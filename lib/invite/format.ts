/* 날짜와 시간을 사람이 읽는 말로. 초대장 곳곳에서 같은 표기를 씁니다. */

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const WEEK_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1);
}

export function dateKo(iso: string): string {
  const t = parseDate(iso);
  return `${t.getFullYear()}년 ${t.getMonth() + 1}월 ${t.getDate()}일 ${WEEK[t.getDay()]}요일`;
}

export function dateDots(iso: string): string {
  const t = parseDate(iso);
  return `${t.getFullYear()}. ${pad(t.getMonth() + 1)}. ${pad(t.getDate())}`;
}

export function weekdayKo(iso: string): string {
  return WEEK[parseDate(iso).getDay()]!;
}

export function weekdayEn(iso: string): string {
  return WEEK_EN[parseDate(iso).getDay()]!;
}

export function timeKo(hhmm: string): string {
  const [hRaw, m] = hhmm.split(":").map(Number);
  const h = hRaw || 0;
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${period} ${h12}시 ${m}분` : `${period} ${h12}시`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function monthDay(iso: string) {
  const t = parseDate(iso);
  return { year: t.getFullYear(), month: pad(t.getMonth() + 1), day: pad(t.getDate()) };
}

/**
 * 그 달의 달력 칸.
 *
 * 앞쪽 빈칸을 null 로 채워 1일이 제 요일에 놓이게 합니다.
 */
export function monthGrid(iso: string): (number | null)[] {
  const t = parseDate(iso);
  const first = new Date(t.getFullYear(), t.getMonth(), 1).getDay();
  const days = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return cells;
}

/**
 * 행사까지 남은 날.
 *
 * 오늘을 인자로 받는 이유는 서버와 브라우저의 «오늘»이 다를 수 있어서
 * 입니다. 서버에서 계산해 두면 자정을 넘긴 방문자에게 하루 어긋난
 * 숫자가 보입니다. 브라우저에서만 계산하고, 그 전에는 자리를 비웁니다.
 */
export function daysUntil(iso: string, from: Date): number {
  const target = parseDate(iso);
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** 지도 앱에서 열 주소 검색 링크 */
export function mapHref(query: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
}

/** 전화 걸기 링크. 숫자만 남깁니다. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}
