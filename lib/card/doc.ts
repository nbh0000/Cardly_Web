/* ============================================================
   카드 내용 — 만들기, 저장하기, 링크에 싣기
   ============================================================ */

import { getDesign, getOccasion } from "@/lib/card/designs";
import type { CardDoc } from "@/lib/card/types";

/** 견본에 쓰는 날짜. 오늘이 아니라 고정값이라야 서버·브라우저가 같습니다. */
const SAMPLE_DATE = "2026-05-24";

export function createDoc(designId: string): CardDoc {
  const design = getDesign(designId);
  const preset = getOccasion(design?.occasion ?? "party")!.preset;
  return {
    designId,
    title: preset.title,
    subtitle: preset.subtitle,
    date: SAMPLE_DATE,
    time: "18:00",
    host: preset.host,
    place: preset.place,
    address: preset.address,
    greeting: preset.greeting,
    hand: { font: "nanum-pen", size: 100, color: "", align: "left" },
    note: preset.note,
    rsvpTo: "",
  };
}

/* ---------- 날짜 ---------- */

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
const WEEKDAY_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1);
}

export function dateKo(iso: string): string {
  const t = parseDate(iso);
  return `${t.getFullYear()}년 ${t.getMonth() + 1}월 ${t.getDate()}일 ${WEEKDAY[t.getDay()]}요일`;
}

export function dateShort(iso: string): string {
  const t = parseDate(iso);
  return `${t.getFullYear()}. ${String(t.getMonth() + 1).padStart(2, "0")}. ${String(t.getDate()).padStart(2, "0")}`;
}

export function weekdayEn(iso: string): string {
  return WEEKDAY_EN[parseDate(iso).getDay()]!;
}

export function monthDay(iso: string): { month: string; day: string } {
  const t = parseDate(iso);
  return {
    month: String(t.getMonth() + 1).padStart(2, "0"),
    day: String(t.getDate()).padStart(2, "0"),
  };
}

export function timeKo(hhmm: string): string {
  const [hRaw, m] = hhmm.split(":").map(Number);
  const h = hRaw || 0;
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${period} ${h12}시 ${m}분` : `${period} ${h12}시`;
}

/* ---------- 초안 저장 ----------
   초대장은 계정을 만들지 않고 씁니다. 그래서 쓰던 내용은 이 브라우저
   안에만 남습니다. 디자인마다 따로 두어야 다른 카드를 열어 봤다고
   해서 쓰던 글이 사라지지 않습니다. */

const KEY = (designId: string) => `cardly:card:${designId}`;

export function saveDraft(doc: CardDoc): void {
  try {
    localStorage.setItem(KEY(doc.designId), JSON.stringify(doc));
  } catch {
    /* 저장 공간이 없거나 시크릿 모드 — 편집을 막을 이유는 없습니다 */
  }
}

export function loadDraft(designId: string): CardDoc | null {
  try {
    const raw = localStorage.getItem(KEY(designId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CardDoc;
    return parsed.designId === designId ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDraft(designId: string): void {
  try {
    localStorage.removeItem(KEY(designId));
  } catch {
    /* 지우지 못해도 할 일은 없습니다 */
  }
}

/* ---------- 링크에 싣기 ----------
   서버가 없으므로 카드 내용을 주소에 통째로 담아 보냅니다. 한글이
   그대로 들어가면 주소가 퍼센트 인코딩으로 서너 배 길어지므로,
   UTF-8 로 바꾼 뒤 URL 에 안전한 base64 로 접습니다. */

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeDoc(doc: CardDoc): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(doc)));
}

export function decodeDoc(token: string): CardDoc | null {
  try {
    const doc = JSON.parse(
      new TextDecoder().decode(fromBase64Url(token)),
    ) as CardDoc;
    return getDesign(doc.designId) ? doc : null;
  } catch {
    return null;
  }
}
