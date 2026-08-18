/* 날짜와 연락처를 사람이 읽는 모양으로.

   Date 를 문자열에서 만들 때 "2026-11-14" 를 그대로 넘기면 UTC 로
   읽혀 한국에서는 하루 앞선 날이 나옵니다. 항상 숫자 세 개로 쪼개
   지역 시각으로 만듭니다.                                        */

const WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];
const WEEK_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function toDate(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 2026년 11월 14일 토요일 */
export function dateKo(ymd: string): string {
  const d = toDate(ymd);
  if (!d) return ymd;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEK_KO[d.getDay()]}요일`;
}

/** 2026. 11. 14 */
export function dateDots(ymd: string): string {
  const d = toDate(ymd);
  if (!d) return ymd;
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** 11.14 SAT */
export function dateShort(ymd: string): string {
  const d = toDate(ymd);
  if (!d) return ymd;
  return `${d.getMonth() + 1}.${d.getDate()} ${WEEK_EN[d.getDay()]}`;
}

export function weekdayKo(ymd: string): string {
  const d = toDate(ymd);
  return d ? `${WEEK_KO[d.getDay()]}요일` : "";
}

export function weekdayEn(ymd: string): string {
  const d = toDate(ymd);
  return d ? WEEK_EN[d.getDay()]! : "";
}

/** 오후 6시 30분 */
export function timeKo(hm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return hm;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return min === 0 ? `${ampm} ${h12}시` : `${ampm} ${h12}시 ${min}분`;
}

/** 오늘부터 며칠 남았는지. 지난 날짜면 음수 */
export function daysUntil(ymd: string): number | null {
  const d = toDate(ymd);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

/** 지도 앱으로 넘기는 주소 검색 */
export function mapHref(query: string): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export function smsHref(phone: string, body: string): string {
  /* iOS 는 물음표 뒤의 body 를, 안드로이드는 &body 를 받습니다.
     ?&body= 로 적으면 양쪽에서 모두 동작합니다. */
  return `sms:${phone.replace(/[^0-9+]/g, "")}?&body=${encodeURIComponent(body)}`;
}
