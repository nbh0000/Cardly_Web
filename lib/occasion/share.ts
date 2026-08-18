/* 초대장을 링크 한 줄에 담습니다.

   서버가 없습니다(정적 사이트). 그래서 내용을 서버에 저장하고 번호를
   받아 오는 대신, 내용 자체를 주소 뒤에 실어 보냅니다.

     /invitation-card/v/?c=eyJkIjoi…

   좋은 점 — 계정도 결제도 필요 없고, 적은 글이 만든 사람 브라우저 밖으로
   나가는 때는 «링크를 직접 보낼 때» 뿐이며, 링크가 살아 있는 한 초대장도
   살아 있습니다. 대신 주소가 길어지므로 실을 것을 아낍니다.

     · 열쇠말은 한 글자로 줄입니다 (title → t)
     · 비어 있는 칸은 아예 싣지 않습니다
     · 참석 회신은 켜져 있을 때만 싣습니다

   btoa 는 한글을 그대로 먹지 못하므로 UTF-8 바이트로 바꾼 뒤 넘기고,
   주소에 안전하도록 + / = 를 - _ 로 바꿉니다.                      */

import { DESIGNS, FALLBACK_DESIGN } from "@/lib/occasion/designs";
import type { InviteData } from "@/lib/occasion/types";

const KNOWN = new Set(DESIGNS.map((d) => d.id));

/* 긴 이름 ↔ 한 글자. 한 번 정하면 바꾸지 마세요 — 이미 보낸 링크가
   전부 안 열리게 됩니다. */
const KEYS: Record<keyof Omit<InviteData, "rsvp">, string> = {
  d: "d",
  eyebrow: "e",
  title: "t",
  host: "h",
  message: "m",
  date: "y",
  time: "i",
  place: "p",
  address: "a",
  note: "n",
  phone: "c",
};

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "="));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeInvite(data: InviteData): string {
  const packed: Record<string, string | 1> = {};
  for (const [long, short] of Object.entries(KEYS)) {
    const v = data[long as keyof typeof KEYS];
    if (v) packed[short] = v;
  }
  if (data.rsvp) packed.r = 1;
  return toBase64Url(new TextEncoder().encode(JSON.stringify(packed)));
}

export function decodeInvite(code: string): InviteData | null {
  try {
    const raw: unknown = JSON.parse(
      new TextDecoder().decode(fromBase64Url(code)),
    );
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;

    /* 예전 링크는 긴 이름으로 담겨 있습니다. 둘 다 알아듣게 둡니다 —
       이미 보낸 초대장이 어느 날 갑자기 안 열리면 안 됩니다. */
    const get = (long: keyof typeof KEYS) => {
      const v = o[KEYS[long]] ?? o[long];
      return typeof v === "string" ? v : "";
    };

    const d = get("d");
    return {
      d: KNOWN.has(d) ? d : FALLBACK_DESIGN.id,
      eyebrow: get("eyebrow"),
      title: get("title") || "초대합니다",
      host: get("host"),
      message: get("message"),
      date: get("date"),
      time: get("time"),
      place: get("place"),
      address: get("address"),
      note: get("note"),
      phone: get("phone"),
      rsvp: o.r === 1 || o.rsvp === true,
    };
  } catch {
    return null;
  }
}

/** 받는 사람이 열게 될 주소 */
export function inviteUrl(data: InviteData, origin: string): string {
  return `${origin}/invitation-card/v/?c=${encodeInvite(data)}`;
}
