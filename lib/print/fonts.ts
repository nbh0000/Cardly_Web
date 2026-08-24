/**
 * 인쇄물 편집기에서 고를 수 있는 글꼴.
 *
 * 여섯 벌로 줄였습니다. 사이트 전체가 들고 있는 글꼴은 열일곱 벌이지만,
 * 인쇄물에는 «PDF 에 그대로 심을 수 있는가» 라는 조건이 하나 더 붙습니다.
 * 화면에서만 예쁜 글꼴로 만든 파일을 인쇄소에 넘기면, 그쪽 컴퓨터에 그
 * 글꼴이 없어 다른 글자로 바뀐 채 찍힙니다.
 *
 * ── 여섯 벌 전부 PDF 에 심습니다 ──
 * 처음에는 한 벌만 심고 나머지는 대체했습니다. 돈을 받고 파는 인쇄물에서
 * «화면과 다른 글꼴로 찍히는 것» 은 결함이라, 목록을 «심을 수 있는 글꼴»
 * 로 다시 짰습니다. 그래서 여기 있는 여섯 벌은 화면과 PDF 가 같습니다.
 *
 * 글꼴을 고를 때 본 조건은 셋입니다.
 *   ① 상업적 사용이 무료인가 (여섯 벌 모두 SIL OFL 1.1)
 *   ② fontkit 이 글자 폭을 온전히 읽는가 — 이걸 못 넘긴 글꼴이 실제로
 *      있었습니다(본명조·프리텐다드). docs/print-fonts.md 참고
 *   ③ 파일이 3MB 를 넘지 않는가 — 내보낼 때 받아야 하는 무게입니다
 *
 * ── 라이선스 ──
 * 출처와 조건은 docs/print-fonts.md 와 public/print-fonts/README.txt 에
 * 적어 두었습니다.
 */

export interface PrintFontFile {
  /** 이 파일이 감당하는 굵기 */
  weight: number;
  file: string;
}

export interface PrintFont {
  /** lib/fonts.ts 의 FontId — 화면은 그쪽 스택으로 그립니다 */
  id: string;
  label: string;
  /** 고를 수 있는 굵기 */
  weights: number[];
  /** 화면에서 어떤 인상인지 — 고를 때 도움이 됩니다 */
  note: string;
  /** PDF 에 심는 파일들 */
  files: PrintFontFile[];
}

const DIR = "/print-fonts";

export const PRINT_FONTS: PrintFont[] = [
  {
    id: "nanum-gothic",
    label: "나눔고딕",
    weights: [400, 700],
    note: "본문 기본. 오래 읽어도 편한 고딕",
    files: [
      { weight: 400, file: `${DIR}/NanumGothic-Regular.ttf` },
      { weight: 700, file: `${DIR}/NanumGothic-Bold.ttf` },
    ],
  },
  {
    id: "gothic-a1",
    label: "고딕 A1",
    weights: [400, 700],
    note: "획이 곧아 제목과 표에 잘 맞습니다",
    files: [
      { weight: 400, file: `${DIR}/GothicA1-Regular.ttf` },
      { weight: 700, file: `${DIR}/GothicA1-Bold.ttf` },
    ],
  },
  {
    id: "nanum-myeongjo",
    label: "나눔명조",
    weights: [400, 700],
    note: "격식 있는 자리 — 초청장·안내문",
    files: [
      { weight: 400, file: `${DIR}/NanumMyeongjo-Regular.ttf` },
      { weight: 700, file: `${DIR}/NanumMyeongjo-Bold.ttf` },
    ],
  },
  {
    id: "do-hyeon",
    label: "도현",
    weights: [400],
    note: "굵고 시원한 제목용. 현수막에",
    files: [{ weight: 400, file: `${DIR}/DoHyeon-Regular.ttf` }],
  },
  {
    id: "black-han-sans",
    label: "검은고딕",
    weights: [400],
    note: "가장 굵은 제목. 멀리서 읽히는 글자",
    files: [{ weight: 400, file: `${DIR}/BlackHanSans-Regular.ttf` }],
  },
  {
    id: "jua",
    label: "주아",
    weights: [400],
    note: "둥글고 친근한 인상. 분식·카페에",
    files: [{ weight: 400, file: `${DIR}/Jua-Regular.ttf` }],
  },
];

export const PRINT_FONT_IDS = PRINT_FONTS.map((f) => f.id);

/** 목록에 없는 글꼴을 만나면 첫 번째로 되돌립니다 */
export const DEFAULT_PRINT_FONT = PRINT_FONTS[0]!;

export function printFont(id: string): PrintFont {
  return PRINT_FONTS.find((f) => f.id === id) ?? DEFAULT_PRINT_FONT;
}

/**
 * PDF 에 심을 파일 하나.
 *
 * 굵기가 하나뿐인 글꼴에 700 을 달라고 하면 있는 것을 줍니다. 화면에서는
 * 브라우저가 굵게 흉내 내지만 PDF 에는 그런 기능이 없어서, 굵기가 하나인
 * 글꼴은 PDF 에서도 한 굵기로 나옵니다. 이건 대체가 아니라 그 글꼴의
 * 성질이라 따로 알리지 않습니다.
 */
export function pdfFontFile(fontId: string, weight: number): string {
  const font = printFont(fontId);
  let best = font.files[0]!;
  for (const f of font.files) {
    if (Math.abs(f.weight - weight) < Math.abs(best.weight - weight)) best = f;
  }
  return best.file;
}

/**
 * PDF 에서 자형이 바뀌는 글꼴인지.
 *
 * 목록 안의 여섯 벌은 그대로 심으므로 늘 false 입니다. true 가 되는 것은
 * 예전 초안이 이제 목록에 없는 글꼴을 들고 있을 때뿐이고, 그때는
 * 내보내기 화면이 «나눔고딕으로 바뀝니다» 라고 알립니다.
 */
export function isSubstitutedInPdf(fontId: string): boolean {
  return !PRINT_FONT_IDS.includes(fontId);
}

/** 목록 밖의 글꼴을 대신할 글꼴 */
export const PDF_FALLBACK_FONT = DEFAULT_PRINT_FONT;
