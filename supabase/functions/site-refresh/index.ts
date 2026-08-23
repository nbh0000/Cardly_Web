/**
 * 발행 직후 사이트를 다시 굽습니다 — 카카오톡 미리보기를 위해서.
 *
 * 카카오 크롤러는 자바스크립트를 돌리지 않습니다. 그래서 청첩장마다 다른
 * 제목·사진이 미리보기에 뜨려면 그 주소의 HTML 이 <meta> 를 이미 달고
 * 있어야 합니다. 사이트가 정적 배포라, 그 HTML 은 빌드 때 만들어집니다.
 *
 * 그래서 발행을 마치면 이 함수가 GitHub Actions 를 깨웁니다. 1~2 분 뒤
 * /w/<슬러그> HTML 이 생기고, 그때부터 링크 미리보기가 예쁘게 뜹니다.
 * 그 전에도 링크 자체는 열립니다 — 브라우저가 내용을 직접 받아 그립니다.
 *
 * 토큰이 없으면 아무 일도 하지 않고 skipped 를 돌려줍니다. 발행은 그대로
 * 됩니다. 미리보기만 다음 배포 때 따라옵니다.
 *
 * 배포:
 *   supabase functions deploy site-refresh
 *   supabase secrets set GITHUB_DISPATCH_TOKEN=github_pat_… GITHUB_REPOSITORY=nbh0000/Cardly_Web
 */

import { CORS, fail, json, selectOne } from "../_shared/lib.ts";

const TOKEN = Deno.env.get("GITHUB_DISPATCH_TOKEN") ?? "";
const REPO = Deno.env.get("GITHUB_REPOSITORY") ?? "";

interface DocRow {
  slug: string;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return fail("POST 로 불러 주세요.", 405);

  if (!TOKEN || !REPO) return json({ ok: true, skipped: "no-token" });

  let payload: { slug?: string };
  try {
    payload = await req.json();
  } catch {
    return fail("요청을 읽지 못했습니다.");
  }
  if (!payload.slug) return fail("슬러그가 필요합니다.");

  // 실제로 발행된 문서일 때만 빌드를 겁니다. 아무나 눌러 빌드를 돌리는
  // 것을 막는 최소한의 문지기입니다.
  const doc = await selectOne<DocRow>(
    "docs",
    `slug=eq.${encodeURIComponent(payload.slug)}&select=slug,status`,
  );
  if (!doc || doc.status !== "published") {
    return json({ ok: true, skipped: "not-published" });
  }

  const res = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: "publish",
      client_payload: { slug: doc.slug },
    }),
  });

  if (!res.ok) {
    return json({ ok: true, skipped: `dispatch-${res.status}` });
  }
  return json({ ok: true, dispatched: true });
});
