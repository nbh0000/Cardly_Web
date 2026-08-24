"use client";

/**
 * AI 기능의 클라이언트 쪽 — 부르는 방법만 압니다.
 *
 * 키는 여기 없습니다. 있어서도 안 됩니다. 모든 호출은 엣지 함수
 * (supabase/functions/ai-print)를 지나가고, 그 안에서만 GEMINI_API_KEY 가
 * 존재합니다. 이 파일에 키를 잠깐 두는 «임시» 코드를 넣지 마세요 —
 * 정적 빌드에 그대로 실려 누구나 볼 수 있게 됩니다.
 *
 * 다섯 가지를 씁니다.
 *   ① 헤드라인 만들기      전단지·포스터의 큰 문구
 *   ② 본문 만들기          안내 문장
 *   ③ 문구 다듬기·줄이기   이미 쓴 글을 고칩니다
 *   ④ 배경 그림 만들기     인쇄물 뒤에 까는 그림
 *   ⑤ 사진 고치기          올린 사진의 배경을 지우거나 바꿉니다
 */

import { BackendError, backendEnabled, callFunction, signedIn } from "@/lib/backend/client";

export type AiTask = "headline" | "body" | "shorten" | "polish" | "menu";

export interface AiTextResult {
  text: string;
  /** 줄 단위로 나눈 결과 — 여러 안을 고르게 하려고 */
  lines: string[];
  balance: number;
}

export interface AiImageResult {
  url: string;
  model: string;
  balance: number;
}

/** 크레딧 값 — 화면에 미리 알려 줍니다 */
export const AI_COST = { text: 1, image: 5, edit: 5 } as const;

export class AiError extends Error {
  /** 크레딧이 모자라 막힌 것인지 — 화면에서 다르게 안내합니다 */
  outOfCredit: boolean;
  constructor(message: string, outOfCredit = false) {
    super(message);
    this.outOfCredit = outOfCredit;
  }
}

/** 지금 AI 를 쓸 수 있는 상태인지 — 아니라면 왜인지 */
export function aiReady(): { ok: boolean; reason?: string } {
  if (!backendEnabled) return { ok: false, reason: "서버가 연결되어 있지 않습니다." };
  if (!signedIn()) return { ok: false, reason: "AI 기능은 로그인 뒤에 쓸 수 있습니다." };
  return { ok: true };
}

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const ready = aiReady();
  if (!ready.ok) throw new AiError(ready.reason!);
  try {
    return await callFunction<T>("ai-print", body);
  } catch (e) {
    if (e instanceof BackendError) {
      // 402 = 크레딧 부족·하루 한도
      throw new AiError(e.message, e.status === 402);
    }
    throw new AiError("AI 요청이 실패했습니다. 잠시 뒤 다시 시도해 주세요.");
  }
}

export async function aiBalance(): Promise<number> {
  const res = await call<{ balance: number }>({ action: "balance" });
  return res.balance ?? 0;
}

export async function aiText(prompt: string, task: AiTask): Promise<AiTextResult> {
  const res = await call<{ text: string; lines: string[]; balance: number }>({
    action: "text",
    task,
    prompt,
  });
  return { text: res.text, lines: res.lines ?? [], balance: res.balance ?? 0 };
}

/**
 * 배경 그림.
 *
 * 종이 비율을 그대로 넘깁니다. 정사각형으로 만들어 늘려 쓰면 사람도 건물도
 * 찌그러지는데, 인쇄해 놓고 보면 그 왜곡이 아주 잘 보입니다.
 */
export async function aiImage(
  prompt: string,
  opts: { widthMm: number; heightMm: number } = { widthMm: 1, heightMm: 1 },
): Promise<AiImageResult> {
  const res = await call<{ url: string; model: string; balance: number }>({
    action: "image",
    prompt,
    aspect: nearestAspect(opts.widthMm, opts.heightMm),
    size: "2K",
  });
  return { url: res.url, model: res.model, balance: res.balance ?? 0 };
}

export async function aiEditImage(prompt: string, image: string): Promise<AiImageResult> {
  const res = await call<{ url: string; model: string; balance: number }>({
    action: "edit",
    prompt,
    image,
  });
  return { url: res.url, model: res.model, balance: res.balance ?? 0 };
}

/**
 * 모델이 받아 주는 비율 중 가장 가까운 것.
 *
 * 현수막은 5000×900(5.6:1)처럼 극단적이라 목록에 딱 맞는 것이 없습니다.
 * 그럴 때는 가장 넓은 비율을 주고, 화면에서 잘라 쓰게 합니다.
 */
const ASPECTS: [string, number][] = [
  ["1:1", 1],
  ["3:4", 3 / 4],
  ["4:3", 4 / 3],
  ["9:16", 9 / 16],
  ["16:9", 16 / 9],
  ["2:3", 2 / 3],
  ["3:2", 3 / 2],
  ["21:9", 21 / 9],
];

export function nearestAspect(w: number, h: number): string {
  const want = w / h;
  let best = ASPECTS[0]!;
  for (const a of ASPECTS) {
    if (Math.abs(Math.log(a[1] / want)) < Math.abs(Math.log(best[1] / want))) best = a;
  }
  return best[0];
}
