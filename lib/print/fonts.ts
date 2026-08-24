/**
 * 인쇄물 편집기에서 고를 수 있는 글꼴.
 *
 * 여섯 벌로 줄였습니다. 사이트 전체가 들고 있는 글꼴은 열일곱 벌이지만,
 * 인쇄물에서는 «PDF 에 심을 수 있는가» 라는 조건이 하나 더 붙습니다.
 * 화면에서만 예쁜 글꼴로 만든 파일을 인쇄소에 넘기면, 그쪽 컴퓨터에 그
 * 글꼴이 없어 다른 글자로 바뀐 채 찍힙니다. 그래서 목록을 좁히고, 좁힌
 * 만큼 무게(굵기)를 넓게 씁니다.
 *
 * ── 라이선스 ──
 * 여섯 벌 모두 상업적 사용이 무료입니다(SIL OFL 1.1). 출처와 조건은
 * docs/print-fonts.md 에 적어 두었습니다.
 *
 * ── PDF 심기 ──
 * PDF 안에 실제로 심는 자형은 나눔고딕 한 벌입니다(public/print-fonts).
 * 나머지 다섯 벌은 화면 편집과 PNG·JPG 내보내기에서 그대로 보이고,
 * PDF 에서만 대체됩니다. 이 사실을 내보내기 화면에서 사용자에게 그대로
 * 알립니다 — 조용히 바꿔 놓고 인쇄소에서 발견하게 하는 것이 가장 나쁩니다.
 */

export interface PrintFont {
  id: string;
  label: string;
  /** 이 글꼴이 실제로 가진 굵기 */
  weights: number[];
  /** 화면에서 어떤 인상인지 — 고를 때 도움이 됩니다 */
  note: string;
}

export const PRINT_FONTS: PrintFont[] = [
  { id: "sans", label: "프리텐다드", weights: [400, 600, 700], note: "기본. 어디에 써도 무난한 고딕" },
  { id: "nanum-gothic", label: "나눔고딕", weights: [400, 700, 800], note: "본문이 많을 때 읽기 편한 고딕" },
  { id: "gothic-a1", label: "고딕 A1", weights: [400, 600, 800], note: "굵기 폭이 넓어 제목에" },
  { id: "gowun-dodum", label: "고운돋움", weights: [400], note: "동글고 부드러운 인상" },
  { id: "serif", label: "본명조", weights: [400, 600, 700], note: "격식 있는 자리에 쓰는 명조" },
  { id: "do-hyeon", label: "도현", weights: [400], note: "굵고 시원한 제목용" },
];

export const PRINT_FONT_IDS = PRINT_FONTS.map((f) => f.id);

export function printFont(id: string): PrintFont {
  return PRINT_FONTS.find((f) => f.id === id) ?? PRINT_FONTS[0]!;
}

/**
 * PDF 에 실제로 심는 글꼴 파일. 한 벌뿐이라 나머지는 여기로 대체됩니다.
 *
 * 왜 프리텐다드가 아니라 나눔고딕인지는 docs/print-fonts.md 에 길게 적어
 * 두었습니다. 짧게 말하면 PDF 를 만드는 fontkit 이 프리텐다드를 온전히
 * 다루지 못합니다 — OTF 는 아예 못 읽고, TTF 판은 읽되 «14:00» 의 쌍점을
 * 다른 글자로 바꿔 놓는데 그 글자의 폭이 표에 실리지 않아 PDF 에서
 * «14:  00» 이 됩니다.
 *
 * 새 글꼴로 바꿀 때는 반드시 실제로 PDF 를 뽑아, 쓰인 글자의 폭이 모두
 * 표(W)에 들어 있는지 확인하세요. 확인 방법도 같은 문서에 있습니다.
 */
export const PDF_EMBEDDED_FONT = {
  label: "나눔고딕",
  regular: "/print-fonts/NanumGothic-Regular.ttf",
  bold: "/print-fonts/NanumGothic-Bold.ttf",
};

/** PDF 에서 자형이 바뀌는 글꼴인지 — 내보내기 전에 알려 줍니다 */
export function isSubstitutedInPdf(fontId: string): boolean {
  return fontId !== "nanum-gothic";
}
