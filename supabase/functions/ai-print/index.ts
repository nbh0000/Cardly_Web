/**
 * 인쇄물 편집기의 AI — 키가 사는 유일한 자리.
 *
 * 사이트는 정적 배포라 Next.js 서버 라우트가 없습니다. 그래서 «서버» 역할은
 * 이 엣지 함수가 맡습니다. 브라우저는 GEMINI_API_KEY 를 절대 보지 못하고,
 * 무엇을 몇 번 불렀는지도 여기서만 셉니다.
 *
 * 키를 클라이언트에 두면 개발자 도구를 열 줄 아는 누구나 우리 계정으로
 * 그림을 뽑을 수 있고, 그 청구서는 우리에게 옵니다. 서버를 거치므로
 * 크레딧 차감·하루 한도·요청 기록이 모두 같은 자리에서 됩니다.
 *
 * 하는 일 넷:
 *   text      문구 만들기·다듬기          (1 크레딧)
 *   image     배경·그림 생성              (5 크레딧)
 *   edit      올린 사진 고치기·배경 지우기 (5 크레딧)
 *   balance   남은 크레딧 묻기            (공짜)
 *
 * 배포:
 *   supabase functions deploy ai-print
 *   supabase secrets set GEMINI_API_KEY=...
 *
 * --no-verify-jwt 를 주지 않습니다. 로그인한 사람만 쓸 수 있어야 하고,
 * 누구인지 알아야 크레딧을 뺄 수 있기 때문입니다.
 */

import { CORS, fail, json, rpc } from "../_shared/lib.ts";

const API = "https://generativelanguage.googleapis.com/v1beta";
const KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

/** 한 번의 호출을 기다려 주는 시간. 그림은 30초쯤 걸립니다 */
const TEXT_MS = 30_000;
const IMAGE_MS = 120_000;

/** 값. 그림이 글보다 훨씬 비싸므로 크레딧도 그렇게 매깁니다 */
const COST = { text: 1, image: 5, edit: 5 } as const;

/**
 * 좋은 것부터. 앞의 것이 막히면 뒤로 내려갑니다.
 *
 * 이름을 하나만 박아 두면 그 모델이 사라진 날 조용히 죽습니다. 실제로
 * 이 작업 중에 gemini-2.5-flash 가 «신규 사용자에게는 제공하지 않는다» 로
 * 바뀌어 404 를 돌려주었습니다. 그래서 목록으로 두고, 없거나(404·400)
 * 몰려 있으면(503) 다음 것으로 넘어갑니다.
 */
const IMAGE_MODELS = ["gemini-3-pro-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"];
const TEXT_MODELS = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-flash-latest"];

interface Body {
  action?: "text" | "image" | "edit" | "balance";
  prompt?: string;
  /** text 전용 — 무엇을 시키는지 */
  task?: string;
  /** image 전용 */
  aspect?: string;
  size?: string;
  /** edit 전용 — data URL 또는 공개 URL */
  image?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return fail("POST 로 불러 주세요.", 405);

  const user = userFromRequest(req);
  if (!user) return fail("로그인이 필요합니다.", 401);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail("요청을 읽지 못했습니다.");
  }

  const action = body.action ?? "text";

  if (action === "balance") {
    const balance = await rpc<number>("ai_balance", { p_user: user });
    return json({ ok: true, balance });
  }

  if (!KEY) return fail("AI 키가 설정되지 않았습니다. 관리자에게 알려 주세요.", 503);
  if (action !== "text" && action !== "image" && action !== "edit") {
    return fail("알 수 없는 요청입니다.");
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) return fail("무엇을 만들지 적어 주세요.");
  if (prompt.length > 2000) return fail("요청이 너무 깁니다. 2000자 안으로 줄여 주세요.");

  /* 먼저 차감합니다.
     나중에 차감하면, 실패한 호출을 반복해 공짜로 쓰는 길이 열립니다.
     대신 우리 잘못으로 실패했을 때는 아래에서 돌려줍니다. */
  let spend: SpendResult;
  try {
    spend = await rpc<SpendResult>("ai_spend", {
      p_user: user,
      p_action: action,
      p_cost: COST[action],
      p_prompt: prompt.slice(0, 400),
    });
  } catch (e) {
    return fail(`크레딧을 확인하지 못했습니다: ${String(e)}`, 500);
  }
  if (!spend.ok) return json({ ok: false, message: spend.message, balance: spend.balance }, 402);

  try {
    const result =
      action === "text"
        ? await runText(prompt, body.task)
        : await runImage(prompt, body, user, action === "edit");
    await rpc("ai_finish", { p_id: spend.log_id, p_ok: true, p_message: null });
    return json({ ok: true, balance: spend.balance, ...result });
  } catch (e) {
    const message = humanMessage(e);
    // 우리 쪽 사정으로 실패했으면 크레딧을 돌려줍니다
    await rpc("ai_refund", { p_id: spend.log_id, p_message: message }).catch(() => {});
    return fail(message, 502);
  }
});

/* ------------------------------------------------------------
   누구인가

   verify_jwt 가 켜져 있으므로 서명은 이미 검증된 상태입니다. 여기서는
   «익명 키가 아니라 로그인한 사람인가» 만 확인하면 됩니다.
   ------------------------------------------------------------ */

function userFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const pad = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(pad + "=".repeat((4 - (pad.length % 4)) % 4)));
    if (payload.role !== "authenticated") return null;
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

interface SpendResult {
  ok: boolean;
  message: string | null;
  balance: number;
  log_id: string;
}

/* ------------------------------------------------------------
   글
   ------------------------------------------------------------ */

/**
 * 무엇을 시키든 «인쇄물에 바로 얹을 수 있는 문장» 이 나와야 합니다.
 *
 * 그래서 지시문을 우리가 앞에 붙입니다. 사용자가 "설명해 줘" 라고 적어도
 * 설명문이 아니라 전단지에 들어갈 문구가 나와야 하기 때문입니다.
 */
const TASKS: Record<string, string> = {
  headline: "전단지·포스터에 크게 넣을 헤드라인을 3개 제안하세요. 각 12자 이내.",
  body: "인쇄물 본문 문구를 씁니다. 3~4문장, 과장 없이 사실 위주로.",
  shorten: "다음 문구를 뜻은 그대로 두고 절반 길이로 줄이세요.",
  polish: "다음 문구의 맞춤법과 띄어쓰기를 고치고 어색한 표현을 다듬으세요.",
  menu: "메뉴판에 들어갈 메뉴 이름과 한 줄 설명을 만듭니다. 설명은 20자 이내.",
};

async function runText(prompt: string, task?: string) {
  const rule =
    (task && TASKS[task]) ??
    "인쇄물에 그대로 넣을 수 있는 한국어 문구를 씁니다.";

  const body = JSON.stringify({
    systemInstruction: {
      parts: [
        {
          text:
            `${rule}\n\n` +
            "규칙: 한국어로만 답합니다. 인사말·설명·따옴표·마크다운을 붙이지 말고 " +
            "결과 문장만 줄바꿈으로 나열합니다. 이모지를 쓰지 않습니다. " +
            "사실이 아닌 정보(가격·날짜·수상 내역)를 지어내지 않습니다.",
        },
      ],
    },
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.9, maxOutputTokens: 800 },
  });

  let text = "";
  let lastError = "";
  for (const model of TEXT_MODELS) {
    const res = await fetch(`${API}/models/${model}:generateContent?key=${KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(TEXT_MS),
      body,
    });
    const data = await res.json();

    if (!res.ok) {
      lastError = data?.error?.message ?? `모델 오류 (${res.status})`;
      // 없거나(404·400) 몰려 있으면(503·429) 다음 모델로
      if ([400, 404, 429, 503].includes(res.status)) continue;
      throw new Error(lastError);
    }

    if (data?.promptFeedback?.blockReason) throw new Error("BLOCKED");

    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    text = parts.map((p: { text?: string }) => p.text ?? "").join("").trim();
    if (text) break;

    if (data?.candidates?.[0]?.finishReason === "SAFETY") throw new Error("BLOCKED");
    lastError = "답이 비어서 왔습니다";
  }

  if (!text) throw new Error(lastError.includes("비어") ? "EMPTY" : lastError || "EMPTY");

  const lines = text
    .split("\n")
    .map((l: string) => l.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);

  return { text, lines };
}

/* ------------------------------------------------------------
   그림
   ------------------------------------------------------------ */

async function runImage(prompt: string, body: Body, user: string, isEdit: boolean) {
  const parts: Record<string, unknown>[] = [];

  if (isEdit) {
    if (!body.image) throw new Error("고칠 사진이 없습니다.");
    parts.push({ inlineData: await toInlineData(body.image) });
  }
  parts.push({
    text: isEdit
      ? `${prompt}\n\n(사진의 구도와 인물은 그대로 두고 요청한 부분만 고칩니다. 글자를 그려 넣지 마세요.)`
      : `${prompt}\n\n인쇄물 배경으로 쓸 그림입니다. 글자·문구·로고를 그려 넣지 마세요.`,
  });

  let lastError = "";
  for (const model of IMAGE_MODELS) {
    try {
      const res = await fetch(`${API}/models/${model}:generateContent?key=${KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(IMAGE_MS),
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: body.aspect ?? "1:1",
              imageSize: body.size ?? "2K",
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        lastError = data?.error?.message ?? `모델 오류 (${res.status})`;
        // 없거나(404·400) 몰려 있으면(503·429) 다음 모델로 내려갑니다
        if ([400, 404, 429, 503].includes(res.status)) continue;
        throw new Error(lastError);
      }

      if (data?.promptFeedback?.blockReason) throw new Error("BLOCKED");

      const out = (data?.candidates?.[0]?.content?.parts ?? []).find(
        (p: { inlineData?: { data?: string } }) => p.inlineData?.data,
      );
      if (!out) {
        lastError = "그림이 오지 않았습니다";
        continue;
      }

      const mime = out.inlineData.mimeType ?? "image/png";
      const url = await store(user, out.inlineData.data, mime);
      return { url, model };
    } catch (e) {
      if (String(e).includes("BLOCKED")) throw e;
      lastError = String(e);
    }
  }
  throw new Error(lastError || "그림을 만들지 못했습니다");
}

async function toInlineData(src: string) {
  if (src.startsWith("data:")) {
    const [head, data] = src.split(",");
    return { mimeType: head.slice(5).replace(";base64", ""), data };
  }
  const res = await fetch(src, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error("사진을 불러오지 못했습니다");
  const buf = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (const byte of buf) binary += String.fromCharCode(byte);
  return { mimeType: res.headers.get("content-type") ?? "image/png", data: btoa(binary) };
}

/**
 * 만든 그림을 저장소에 두고 주소만 돌려줍니다.
 *
 * base64 를 그대로 돌려주면 문서 안에 수 MB 짜리 글자열이 박히고, 그 문서를
 * 저장·불러오기 할 때마다 그 무게를 다시 나릅니다.
 */
async function store(user: string, base64: string, mime: string): Promise<string> {
  const ext = mime.includes("jpeg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
  const name = `${user}/ai/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/photos/${name}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": mime,
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!res.ok) throw new Error(`저장에 실패했습니다 (${res.status})`);
  return `${SUPABASE_URL}/storage/v1/object/public/photos/${name}`;
}

/* ------------------------------------------------------------
   오류를 사람 말로

   «502 Bad Gateway» 를 보여 주면 사용자는 자기가 무엇을 잘못했는지,
   다시 눌러도 되는지 알 수 없습니다.
   ------------------------------------------------------------ */

function humanMessage(e: unknown): string {
  const s = String(e);
  if (s.includes("BLOCKED")) {
    return "요청 내용이 안전 정책에 걸렸습니다. 표현을 바꾸어 다시 시도해 주세요.";
  }
  if (s.includes("EMPTY")) return "답이 비어서 왔습니다. 조금 더 구체적으로 적어 주세요.";
  if (s.includes("TimeoutError") || s.includes("timed out")) {
    return "시간이 너무 오래 걸려 멈췄습니다. 잠시 뒤 다시 시도해 주세요.";
  }
  if (s.includes("429") || s.includes("RESOURCE_EXHAUSTED")) {
    return "지금 요청이 몰려 있습니다. 1분 뒤에 다시 시도해 주세요.";
  }
  if (s.includes("API key") || s.includes("PERMISSION_DENIED")) {
    return "AI 키에 문제가 있습니다. 관리자에게 알려 주세요.";
  }
  return "AI 요청이 실패했습니다. 잠시 뒤 다시 시도해 주세요.";
}
