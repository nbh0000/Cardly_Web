"use client";

/**
 * 하객이 남기는 것 — 참석 여부와 방명록.
 *
 * 하객은 로그인하지 않습니다. 그런데 로그인 없이 쓰기를 열어 두면 남의
 * 청첩장에 아무 글이나 밀어 넣을 수 있게 됩니다. 그래서 표에 직접 쓰지
 * 못하게 막고, 슬러그를 인자로 받는 데이터베이스 함수로만 통하게 했습니다.
 * 그 함수가 «지금 열려 있는 청첩장인가 · 프리미엄인가 · 너무 잦지 않은가»
 * 를 보고 나서 한 줄을 넣습니다.
 */

import { rpc, select, remove, update } from "@/lib/backend/client";

/* ------------------------------------------------------------
   하객 쪽
   ------------------------------------------------------------ */

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export async function listGuestbook(slug: string): Promise<GuestbookEntry[]> {
  return rpc<GuestbookEntry[]>("list_guestbook", { p_slug: slug }, { anon: true });
}

export async function submitGuestbook(
  slug: string,
  name: string,
  message: string,
): Promise<void> {
  await rpc("submit_guestbook", { p_slug: slug, p_name: name, p_message: message }, { anon: true });
}

export async function submitRsvp(
  slug: string,
  entry: {
    name: string;
    attending: boolean;
    party?: number;
    side?: string;
    message?: string;
  },
): Promise<void> {
  await rpc(
    "submit_rsvp",
    {
      p_slug: slug,
      p_name: entry.name,
      p_attending: entry.attending,
      p_party: entry.party ?? 1,
      p_side: entry.side ?? "",
      p_message: entry.message ?? "",
    },
    { anon: true },
  );
}

/* ------------------------------------------------------------
   만든 사람 쪽 — 집계와 정리
   ------------------------------------------------------------ */

export interface RsvpRow {
  id: string;
  name: string;
  attending: boolean;
  party: number;
  side: string;
  message: string;
  created_at: string;
}

export interface GuestbookRow extends GuestbookEntry {
  hidden: boolean;
}

export async function listRsvps(docId: string): Promise<RsvpRow[]> {
  return select<RsvpRow>(
    "rsvps",
    `select=id,name,attending,party,side,message,created_at&doc_id=eq.${docId}&order=created_at.desc`,
  );
}

export async function listGuestbookAll(docId: string): Promise<GuestbookRow[]> {
  return select<GuestbookRow>(
    "guestbook",
    `select=id,name,message,hidden,created_at&doc_id=eq.${docId}&order=created_at.desc`,
  );
}

export async function deleteGuestbookEntry(id: string): Promise<void> {
  await remove("guestbook", `id=eq.${id}`);
}

export async function hideGuestbookEntry(id: string, hidden: boolean): Promise<void> {
  await update("guestbook", `id=eq.${id}`, { hidden });
}

export async function deleteRsvp(id: string): Promise<void> {
  await remove("rsvps", `id=eq.${id}`);
}

/** 참석 집계 — 화면 세 군데에서 같은 셈을 쓰지 않도록 여기 둡니다 */
export interface RsvpSummary {
  total: number;
  attending: number;
  absent: number;
  heads: number;
}

export function summarize(rows: RsvpRow[]): RsvpSummary {
  let attending = 0;
  let absent = 0;
  let heads = 0;
  for (const r of rows) {
    if (r.attending) {
      attending += 1;
      heads += r.party;
    } else {
      absent += 1;
    }
  }
  return { total: rows.length, attending, absent, heads };
}
