/**
 * 템플릿을 고르는 말 — 업종·스타일·색.
 *
 * 목록이 여덟 장을 넘어가는 순간 «쭉 훑어보기» 가 통하지 않습니다. 그때
 * 사람이 실제로 쓰는 말은 «우리 가게는 카페인데» 와 «사진 말고 그림으로»
 * 둘입니다. 그래서 거르는 축을 그 둘로 잡고, 색은 세 번째로 두었습니다.
 *
 * 값은 여기에만 적습니다. 템플릿이 자기 태그를 문자열로 적어 넣으면
 * «cafe» 와 «Cafe» 가 섞이고, 그러면 거르기가 조용히 새기 시작합니다.
 */

export type IndustryId =
  | "food"
  | "cafe"
  | "academy"
  | "beauty"
  | "fitness"
  | "realestate"
  | "event"
  | "sale"
  | "clinic"
  | "community";

export type StyleId = "photo" | "flat" | "watercolor" | "minimal" | "type" | "bold";

export type PaletteId = "ink" | "navy" | "red" | "green" | "warm" | "pastel" | "mono";

export interface Term<T extends string> {
  id: T;
  label: string;
}

export const INDUSTRIES: Term<IndustryId>[] = [
  { id: "food", label: "음식점" },
  { id: "cafe", label: "카페·베이커리" },
  { id: "academy", label: "학원·교육" },
  { id: "beauty", label: "뷰티·미용" },
  { id: "fitness", label: "헬스·필라테스" },
  { id: "realestate", label: "부동산" },
  { id: "event", label: "행사·공연" },
  { id: "sale", label: "세일·오픈" },
  { id: "clinic", label: "병원·약국" },
  { id: "community", label: "종교·단체" },
];

export const STYLES: Term<StyleId>[] = [
  { id: "photo", label: "사진" },
  { id: "flat", label: "플랫 일러스트" },
  { id: "watercolor", label: "수채화" },
  { id: "minimal", label: "미니멀" },
  { id: "type", label: "타이포그래피" },
  { id: "bold", label: "강한 대비" },
];

export const PALETTES: Term<PaletteId>[] = [
  { id: "ink", label: "먹빛" },
  { id: "navy", label: "남색" },
  { id: "red", label: "붉은색" },
  { id: "green", label: "초록" },
  { id: "warm", label: "따뜻한 색" },
  { id: "pastel", label: "파스텔" },
  { id: "mono", label: "흑백" },
];

const label = <T extends string>(list: Term<T>[], id: T) =>
  list.find((t) => t.id === id)?.label ?? id;

export const industryLabel = (id: IndustryId) => label(INDUSTRIES, id);
export const styleLabel = (id: StyleId) => label(STYLES, id);
export const paletteLabel = (id: PaletteId) => label(PALETTES, id);
