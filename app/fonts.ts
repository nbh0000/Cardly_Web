/**
 * 자체 호스팅하는 웹폰트 — next/font 가 빌드 때 내려받아 우리 도메인에서 서빙합니다.
 * 방문자의 브라우저가 구글에 요청을 보내지 않습니다.
 *
 * 여기 실린 글꼴은 모두 SIL 오픈 폰트 라이선스(OFL)라 상업적 이용이 무료입니다.
 * 고를 수 있는 목록·분류·대체 글꼴은 `lib/fonts.ts` 가 들고 있고,
 * 두 파일은 아래 CSS 변수 이름으로 이어집니다. 이름을 바꾸면 양쪽을 함께 고치세요.
 *
 * next/font 는 옵션을 리터럴로만 받으므로(공용 상수를 펼쳐 넣을 수 없습니다)
 * 글꼴마다 같은 옵션을 그대로 적습니다.
 * 한글 글꼴은 파일이 커서 전부 `preload: false` 로 둡니다. 유니코드 구간별로
 * 쪼개져 있어 실제로 화면에 쓰인 글자 묶음만 내려받습니다.
 */
import localFont from "next/font/local";
import {
  Black_Han_Sans,
  Caveat,
  Cormorant_Garamond,
  Diphylleia,
  Do_Hyeon,
  Gaegu,
  Gothic_A1,
  Gowun_Batang,
  Gowun_Dodum,
  Hahmlet,
  Hi_Melody,
  Jua,
  Kirang_Haerang,
  Nanum_Brush_Script,
  Nanum_Gothic,
  Nanum_Myeongjo,
  Nanum_Pen_Script,
  Noto_Sans_KR,
  Noto_Serif_KR,
  Parisienne,
  Playfair_Display,
} from "next/font/google";

/* ---------- 본문 기본 글꼴 ---------- */

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: false,
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: false,
});

/* ---------- 고딕 ---------- */

const nanumGothic = Nanum_Gothic({
  variable: "--f-nanum-gothic",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const gothicA1 = Gothic_A1({
  variable: "--f-gothic-a1",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

/** 획이 부드러운 고딕 — 굵기가 하나뿐이라 굵게는 브라우저가 흉내 냅니다. */
const gowunDodum = Gowun_Dodum({
  variable: "--f-gowun-dodum",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

/* ---------- 명조 ---------- */

const nanumMyeongjo = Nanum_Myeongjo({
  variable: "--f-nanum-myeongjo",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const gowunBatang = Gowun_Batang({
  variable: "--f-gowun-batang",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

/** 현대적인 세리프 — 라틴 글자가 또렷해 국·영문 섞인 문장에 잘 맞습니다. */
const hahmlet = Hahmlet({
  variable: "--f-hahmlet",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

/* ---------- 손글씨 ---------- */

const nanumPen = Nanum_Pen_Script({
  variable: "--f-nanum-pen",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const nanumBrush = Nanum_Brush_Script({
  variable: "--f-nanum-brush",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const gaegu = Gaegu({
  variable: "--f-gaegu",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const hiMelody = Hi_Melody({
  variable: "--f-hi-melody",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

/* ---------- 장식 ---------- */

/** 획이 아주 가는 장식 명조 — 커버 제목처럼 큰 글씨에 씁니다. */
const diphylleia = Diphylleia({
  variable: "--f-diphylleia",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const jua = Jua({
  variable: "--f-jua",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const doHyeon = Do_Hyeon({
  variable: "--f-do-hyeon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const blackHanSans = Black_Han_Sans({
  variable: "--f-black-han-sans",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const kirangHaerang = Kirang_Haerang({
  variable: "--f-kirang-haerang",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

/* ---------- 커버 장식용 라틴 글꼴 ----------
   한글은 위의 국문 글꼴이 맡고, 아래 글꼴은 영문 문구·큰 숫자에만 씁니다. */

/** 큰 제목용 디스플레이 세리프 — "WEDDING" 같은 대문자 조판 */
const playfair = Playfair_Display({
  variable: "--ff-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

/** 캘리그래피 — "We are getting Married" */
const parisienne = Parisienne({
  variable: "--ff-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

/** 손글씨 마커 — "Save the date!" 같은 스티커 문구 */
const caveat = Caveat({
  variable: "--ff-hand",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

/** 얇은 세리프 — 날짜·영문 이름의 가는 조판 */
const cormorant = Cormorant_Garamond({
  variable: "--ff-thin-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

/* ---------- 초대장 본문 글꼴 ----------
 *
 * Pretendard 는 구글 폰트에 없어 npm 패키지(pretendard, OFL-1.1)로 들여와
 * next/font/local 로 자체 호스팅합니다. 한글 상용 글자만 담긴 subset 판을
 * 쓰면 굵기 하나가 264KB 라, 두 굵기를 실어도 본문 글꼴로 감당할 만합니다.
 * (전체 판은 굵기당 748KB, 가변 판은 2MB 입니다)
 *
 * display: swap — 글꼴이 늦게 와도 글을 먼저 읽게 합니다. 초대장은 받은
 * 사람이 링크를 누른 직후에 읽는 물건이라, 빈 화면으로 기다리게 하는 쪽이
 * 글자가 한 번 바뀌는 쪽보다 나쁩니다.
 * preload: false — 초대장 화면에서만 쓰므로 다른 페이지의 첫 화면 비용에
 * 얹지 않습니다.
 */
const pretendard = localFont({
  variable: "--f-pretendard",
  display: "swap",
  preload: false,
  src: [
    {
      path: "../node_modules/pretendard/dist/web/static/woff2-subset/Pretendard-Regular.subset.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/pretendard/dist/web/static/woff2-subset/Pretendard-SemiBold.subset.woff2",
      weight: "600",
      style: "normal",
    },
  ],
});

/** 루트 <html> 에 얹는 글꼴 변수 모음 */
export const FONT_VARIABLES = [
  pretendard,
  notoSerifKr,
  notoSansKr,
  nanumGothic,
  gothicA1,
  gowunDodum,
  nanumMyeongjo,
  gowunBatang,
  hahmlet,
  nanumPen,
  nanumBrush,
  gaegu,
  hiMelody,
  diphylleia,
  jua,
  doHyeon,
  blackHanSans,
  kirangHaerang,
  playfair,
  parisienne,
  caveat,
  cormorant,
]
  .map((f) => f.variable)
  .join(" ");
