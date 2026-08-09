/* ============================================================
   청첩장 도메인 모델
   - Template        : 디자인 프리셋 (테마 토큰 + 커버 레이아웃)
   - InvitationData  : 고객이 에디터에서 채우는 모든 내용
   두 가지를 합쳐 <InvitationView /> 가 실제 청첩장을 렌더링합니다.
   ============================================================ */

export type CoverLayout =
  | "center" /* 정중앙 미니멀 */
  | "arch" /* 아치 프레임 */
  | "editorial" /* 좌측 정렬 + 큰 날짜 */
  | "photo" /* 풀블리드 사진 */
  | "floral" /* 플라워 장식 */
  | "heart" /* 하트로 오려낸 사진 + 스티커 */
  | "poster" /* 풀사진 위 대형 캘리그래피 */
  | "polaroid" /* 테이프로 붙인 폴라로이드 콜라주 */
  | "band" /* 컬러 배경판 + 액자 + 손글씨 라벨 */
  | "filmstrip"; /* 세로 필름 스트립 */

export const COVER_LAYOUTS: { id: CoverLayout; label: string }[] = [
  { id: "center", label: "센터" },
  { id: "photo", label: "풀사진" },
  { id: "arch", label: "아치" },
  { id: "editorial", label: "에디토리얼" },
  { id: "floral", label: "플라워" },
  { id: "heart", label: "하트" },
  { id: "poster", label: "포스터" },
  { id: "polaroid", label: "폴라로이드" },
  { id: "band", label: "컬러밴드" },
  { id: "filmstrip", label: "필름" },
];

/* ---------- 사진 보정 ----------
   스톡·스냅 사진의 색감이 제각각이어도 템플릿 톤에 묶이도록
   커버와 갤러리 전체에 같은 필터를 겁니다. moiitee 계열 청첩장이
   흑백/필름 톤으로 통일감을 내는 것과 같은 장치입니다. */

export type PhotoTone = "none" | "bw" | "film" | "warm" | "cool" | "fade";

export const PHOTO_TONES: { id: PhotoTone; label: string }[] = [
  { id: "none", label: "원본" },
  { id: "bw", label: "흑백" },
  { id: "film", label: "필름" },
  { id: "warm", label: "웜톤" },
  { id: "cool", label: "쿨톤" },
  { id: "fade", label: "페이드" },
];

export type HeadingFont = "serif" | "sans";

export const FONT_OPTIONS: { id: HeadingFont; label: string; sample: string }[] =
  [
    { id: "serif", label: "명조", sample: "우리 결혼합니다" },
    { id: "sans", label: "고딕", sample: "우리 결혼합니다" },
  ];

export type FontScale = "sm" | "md" | "lg";

export const FONT_SCALES: { id: FontScale; label: string; factor: number }[] = [
  { id: "sm", label: "작게", factor: 0.92 },
  { id: "md", label: "보통", factor: 1 },
  { id: "lg", label: "크게", factor: 1.12 },
];

export type EffectKind = "none" | "petal" | "snow" | "sparkle";

export const EFFECTS: { id: EffectKind; label: string }[] = [
  { id: "none", label: "없음" },
  { id: "petal", label: "꽃잎" },
  { id: "snow", label: "눈" },
  { id: "sparkle", label: "반짝임" },
];

export type BgmTrack = "none" | "canon" | "spring" | "lullaby" | "waltz";

export const BGM_TRACKS: { id: BgmTrack; label: string }[] = [
  { id: "none", label: "사용 안 함" },
  { id: "canon", label: "Canon in D" },
  { id: "spring", label: "봄날의 왈츠" },
  { id: "lullaby", label: "Lullaby" },
  { id: "waltz", label: "Wedding Waltz" },
];

/* ---------- 오프닝 애니메이션 ---------- */

export type OpeningAnimation =
  | "none"
  | "emoji"
  | "lace"
  | "curtain"
  | "envelope"
  | "wrap";

export const OPENING_ANIMATIONS: { id: OpeningAnimation; label: string }[] = [
  { id: "none", label: "미적용" },
  { id: "emoji", label: "웨딩 이모지" },
  { id: "lace", label: "레이스" },
  { id: "curtain", label: "커튼" },
  { id: "envelope", label: "봉투 열기" },
  { id: "wrap", label: "포장지 뜯기" },
];

/* ---------- 날짜 표기 디자인 ---------- */

export type DateFormat = "bar" | "korean" | "dots" | "english";

export const DATE_FORMATS: { id: DateFormat; sample: string }[] = [
  { id: "bar", sample: "10 | 23" },
  { id: "korean", sample: "2024년 10월 23일" },
  { id: "dots", sample: "24.10.23" },
  { id: "english", sample: "October 23, 2024" },
];

/* ---------- 갤러리 타입 (8종) ---------- */

export type GalleryType =
  | "grid"
  | "mosaic"
  | "slide"
  | "stack"
  | "bento"
  | "circle"
  | "polaroid"
  | "floating";

export const GALLERY_TYPES: { id: GalleryType; label: string }[] = [
  { id: "grid", label: "바둑판형" },
  { id: "mosaic", label: "다단형" },
  { id: "slide", label: "슬라이드" },
  { id: "stack", label: "스택" },
  { id: "bento", label: "벤토" },
  { id: "circle", label: "서클" },
  { id: "polaroid", label: "폴라로이드" },
  { id: "floating", label: "플로팅" },
];

/* ---------- 관계 (혼주 기준 호칭) ---------- */

export const SON_RELATIONS = [
  "아들", "장남", "차남", "삼남", "사남", "오남", "육남", "칠남", "팔남", "막내아들", "손자", "조카", "동생", "기타",
];
export const DAUGHTER_RELATIONS = [
  "딸", "장녀", "차녀", "삼녀", "사녀", "오녀", "육녀", "칠녀", "팔녀", "막내딸", "손녀", "조카", "동생", "기타",
];

/* ---------- 부가 섹션 ---------- */

export interface Contact {
  id: string;
  role: string;
  name: string;
  phone: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  body: string;
  photo?: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  period: string;
  body: string;
  photo?: string;
}

export interface AlbumPage {
  id: string;
  designId: number;
  photos: string[];
}

export type SectionKey =
  | "invitation"
  | "couple"
  | "timeline"
  | "album"
  | "notice"
  | "calendar"
  | "gallery"
  | "location"
  | "account"
  | "video"
  | "guestbook"
  | "rsvp"
  | "snap"
  | "gift";

export const SECTION_LABELS: Record<SectionKey, string> = {
  invitation: "초대합니다",
  couple: "두 사람 이야기",
  timeline: "타임라인",
  album: "미니앨범",
  notice: "안내사항",
  calendar: "캘린더",
  gallery: "갤러리",
  location: "식장위치",
  account: "계좌번호",
  video: "비디오",
  guestbook: "방명록",
  rsvp: "참석여부",
  snap: "하객스냅",
  gift: "선물하기",
};

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "invitation", "couple", "timeline", "album", "notice", "calendar",
  "gallery", "location", "account", "video", "guestbook", "rsvp", "snap", "gift",
];

export type TemplateCategory =
  | "minimal"
  | "floral"
  | "modern"
  | "classic"
  | "photo";

export interface InvitationTheme {
  bg: string;
  ink: string;
  sub: string;
  accent: string;
  accentSoft: string;
}

export interface Template {
  id: string;
  name: string;
  categories: TemplateCategory[];
  badge?: "NEW" | "BEST";
  coverLayout: CoverLayout;
  headingFont: HeadingFont;
  theme: InvitationTheme;
  /** 커버·갤러리 사진에 기본으로 걸리는 색보정 */
  photoTone: PhotoTone;
  /** 커버에 얹는 영문 캘리그래피 한 줄 */
  script: string;
  /** 상단 라벨 기본값 (비우면 공용 문구) */
  eyebrow?: string;
  /** 샘플 사진 고르기 — 템플릿마다 다른 사진이 나오도록 */
  photoSeed: number;
}

/* ---------- 내용 ---------- */

export interface Person {
  /** 성 — 남궁·선우처럼 두 글자인 경우가 있어 이름과 따로 보관합니다. */
  lastName: string;
  firstName: string;
  phone: string;
  /** 장남 / 차녀 등 */
  relation: string;
  fatherLastName: string;
  fatherFirstName: string;
  fatherPhone: string;
  fatherLate: boolean;
  motherLastName: string;
  motherFirstName: string;
  motherPhone: string;
  motherLate: boolean;
}

/** 성 + 이름을 합친 표시용 이름 */
export function fullName(p: {
  lastName: string;
  firstName: string;
}): string {
  return `${p.lastName}${p.firstName}`;
}

export function parentName(
  p: Person,
  role: "father" | "mother",
): string {
  return role === "father"
    ? `${p.fatherLastName}${p.fatherFirstName}`
    : `${p.motherLastName}${p.motherFirstName}`;
}

export interface Account {
  id: string;
  side: "groom" | "bride";
  bank: string;
  number: string;
  holder: string;
  /** 카카오페이 송금 링크 */
  kakaopay: string;
}

export interface TransportItem {
  id: string;
  label: string;
  body: string;
}

export interface InvitationData {
  /* 꾸미기 */
  cardTitle: string;
  shareImage?: string;

  /* 오프닝 */
  opening: OpeningAnimation;

  /* 타이틀 이미지 어둡기 0~100 */
  titleDim: number;

  /* 이름 영문 */
  groomEnglish: string;
  brideEnglish: string;
  hideGroomParents: boolean;
  hideBrideParents: boolean;
  groomContacts: Contact[];
  brideContacts: Contact[];

  /* 예식 정보 */
  dateFormat: DateFormat;
  showVenueInfo: boolean;

  /* 초대 글 */
  showDateOnInvitation: boolean;

  /* 미니앨범 */
  showAlbum: boolean;
  albumBg?: string;
  albumInk?: string;
  showAlbumText: boolean;
  albumPages: AlbumPage[];

  /* 안내사항 */
  showNotice: boolean;
  notices: NoticeItem[];

  /* 하객스냅 */
  snapEnabled: boolean;
  snapDriveUrl: string;

  /* 두 사람 이야기 */
  showCouple: boolean;
  coupleDesign: number;
  couplePoint1: string;
  couplePoint2: string;
  groomIntro: string;
  brideIntro: string;
  groomPhoto?: string;
  bridePhoto?: string;

  /* 타임라인 */
  showTimeline: boolean;
  timelineTitle: string;
  timelineShape: "heart" | "circle";
  timeline: TimelineItem[];

  /* 비디오 */
  showVideo: boolean;
  videoMode: "upload" | "youtube";
  videoUrl: string;
  videoThumb?: string;

  /* 선물하기 */
  showGift: boolean;
  giftLabel: string;

  /* 방명록 */
  guestbookPassword: string;

  /* 갤러리 */
  galleryType: GalleryType;
  galleryProtect: boolean;

  /* 순서 */
  sectionOrder: SectionKey[];

  /* 디자인 */
  templateId: string;
  coverLayout: CoverLayout;
  headingFont: HeadingFont;
  fontScale: FontScale;
  /** 템플릿 기본 포인트색을 덮어쓰는 커스텀 색 */
  accentOverride?: string;
  effect: EffectKind;

  /* 커버 */
  coverEyebrow: string;
  coverPhoto?: string;
  coverPhotoFit: "cover" | "contain";
  /** 커버에 얹는 영문 캘리그래피 (빈 문자열이면 숨김) */
  coverScript: string;
  /** 하트·테이프·라벨 같은 장식 요소 표시 여부 */
  showStickers: boolean;
  /** 사진 색보정 — 커버와 갤러리에 함께 적용 */
  photoTone: PhotoTone;
  /** 사진을 아직 올리지 않았을 때 쓰는 샘플 사진 묶음의 시작 번호 */
  photoSeed: number;

  /* 인사말 */
  greetingTitle: string;
  greeting: string;

  /* 신랑 · 신부 */
  groom: Person;
  bride: Person;
  /** 이름 표기 순서 */
  nameOrder: "groom-first" | "bride-first";

  /* 일시 */
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  showCalendar: boolean;
  showDday: boolean;

  /* 장소 */
  venueName: string;
  venueHall: string;
  venueAddress: string;
  venueTel: string;
  showMap: boolean;
  transport: TransportItem[];

  /* 갤러리 */
  showGallery: boolean;
  galleryTitle: string;
  gallery: string[];

  /* 마음 전하는 곳 */
  showAccounts: boolean;
  accountsTitle: string;
  accountsNote: string;
  accounts: Account[];

  /* 참석 의사 */
  showRsvp: boolean;
  rsvpTitle: string;
  rsvpNote: string;
  rsvpAskMeal: boolean;
  rsvpAskCount: boolean;
  rsvpPopup: boolean;

  /* 방명록 */
  showGuestbook: boolean;
  guestbookTitle: string;

  /* 배경음악 */
  bgm: BgmTrack;
  bgmAutoplay: boolean;

  /* 공유 */
  shareTitle: string;
  shareDescription: string;
}

/* ------------------------------------------------------------
   템플릿 카탈로그
   ------------------------------------------------------------ */

export const CATEGORY_LABELS: Record<TemplateCategory | "all", string> = {
  all: "전체",
  minimal: "미니멀",
  floral: "플라워",
  modern: "모던",
  classic: "클래식",
  photo: "포토",
};

export const TEMPLATES: Template[] = [
  /* ---- 그래픽 계열 : 사진을 오려 붙이고 손글씨를 얹는 쪽 ---- */
  {
    id: "heartbeat",
    name: "하트비트",
    categories: ["photo", "modern"],
    badge: "BEST",
    coverLayout: "heart",
    headingFont: "sans",
    photoTone: "bw",
    script: "Save the date!",
    eyebrow: "WE'RE GETTING MARRIED",
    photoSeed: 4,
    theme: { bg: "#F4C6CE", ink: "#2B1F23", sub: "#EBB0BA", accent: "#D01F3C", accentSoft: "#FADDE2" },
  },
  {
    id: "locket",
    name: "로켓",
    categories: ["classic", "photo"],
    badge: "NEW",
    coverLayout: "poster",
    headingFont: "serif",
    photoTone: "warm",
    script: "We are getting Married",
    eyebrow: "THE BRIDE & GROOM",
    photoSeed: 13,
    theme: { bg: "#5E1220", ink: "#F6E9DA", sub: "#7A2231", accent: "#E0BE8A", accentSoft: "#732033" },
  },
  {
    id: "evergreen",
    name: "에버그린",
    categories: ["photo", "floral"],
    badge: "NEW",
    coverLayout: "poster",
    headingFont: "serif",
    photoTone: "cool",
    script: "Happily Ever After",
    eyebrow: "GROOM AND BRIDE",
    photoSeed: 0,
    theme: { bg: "#8FA391", ink: "#FFFFFF", sub: "#7B9080", accent: "#FFFFFF", accentSoft: "#A6B7A6" },
  },
  {
    id: "polaroid-day",
    name: "폴라로이드",
    categories: ["photo", "minimal"],
    coverLayout: "polaroid",
    headingFont: "sans",
    photoTone: "film",
    script: "Our Wedding Day",
    eyebrow: "THE DAY WE BEGAN",
    photoSeed: 12,
    theme: { bg: "#EDE7DD", ink: "#2A2724", sub: "#DCD3C5", accent: "#7C6A57", accentSoft: "#E6DFD3" },
  },
  {
    id: "noir",
    name: "느와르",
    categories: ["modern", "photo"],
    badge: "BEST",
    coverLayout: "poster",
    headingFont: "serif",
    photoTone: "bw",
    script: "Wedding",
    eyebrow: "A NEW CHAPTER BEGINS",
    photoSeed: 6,
    theme: { bg: "#141414", ink: "#F4F2EE", sub: "#242424", accent: "#CFC6B8", accentSoft: "#2C2C2C" },
  },
  {
    id: "super8",
    name: "슈퍼8",
    categories: ["photo", "modern"],
    coverLayout: "filmstrip",
    headingFont: "sans",
    photoTone: "film",
    script: "The Day We Began",
    eyebrow: "REEL 01 · 2026",
    photoSeed: 7,
    theme: { bg: "#1B1A18", ink: "#EFE9DE", sub: "#2A2825", accent: "#D8A15C", accentSoft: "#2F2C28" },
  },
  {
    id: "sorbet",
    name: "소르베",
    categories: ["modern", "photo"],
    coverLayout: "band",
    headingFont: "sans",
    photoTone: "warm",
    script: "with all my heart",
    eyebrow: "SAVE THE DATE",
    photoSeed: 9,
    theme: { bg: "#F6E2CE", ink: "#3B2A20", sub: "#EFD2B6", accent: "#C4714A", accentSoft: "#FAECDD" },
  },
  {
    id: "bluette",
    name: "블루에트",
    categories: ["minimal", "modern"],
    coverLayout: "band",
    headingFont: "serif",
    photoTone: "cool",
    script: "Something Blue",
    eyebrow: "WE ARE GETTING MARRIED",
    photoSeed: 2,
    theme: { bg: "#DCE5EC", ink: "#1F2A33", sub: "#C6D4DF", accent: "#4A6D89", accentSoft: "#E9F0F5" },
  },

  /* ---- 클래식 계열 : 여백과 조판으로 가는 쪽 ---- */
  {
    id: "linen",
    name: "리넨",
    categories: ["minimal"],
    coverLayout: "center",
    headingFont: "serif",
    photoTone: "fade",
    script: "Save the date",
    photoSeed: 1,
    theme: { bg: "#FBF8F3", ink: "#2E2A27", sub: "#EFE7DC", accent: "#B08D80", accentSoft: "#F1E5DF" },
  },
  {
    id: "petit-jour",
    name: "쁘띠 주르",
    categories: ["floral", "classic"],
    coverLayout: "floral",
    headingFont: "serif",
    photoTone: "warm",
    script: "Petit Jour",
    photoSeed: 3,
    theme: { bg: "#FCF6F3", ink: "#4A3A34", sub: "#F0DDD5", accent: "#C08E82", accentSoft: "#F7E9E4" },
  },
  {
    id: "archive",
    name: "아카이브",
    categories: ["modern", "photo"],
    coverLayout: "editorial",
    headingFont: "serif",
    photoTone: "bw",
    script: "The Archive",
    photoSeed: 10,
    theme: { bg: "#F3F1EC", ink: "#26241F", sub: "#E2DED4", accent: "#8A8271", accentSoft: "#EBE8E0" },
  },
  {
    id: "still-life",
    name: "스틸 라이프",
    categories: ["photo", "minimal"],
    coverLayout: "photo",
    headingFont: "serif",
    photoTone: "film",
    script: "Still Life",
    photoSeed: 5,
    theme: { bg: "#FFFDF9", ink: "#332E29", sub: "#DFD3C8", accent: "#B08D80", accentSoft: "#F2E8E2" },
  },
  {
    id: "chapel",
    name: "채플",
    categories: ["classic"],
    coverLayout: "arch",
    headingFont: "serif",
    photoTone: "warm",
    script: "In Chapel",
    photoSeed: 7,
    theme: { bg: "#FAF6EF", ink: "#3A342C", sub: "#EEE4CF", accent: "#A98E63", accentSoft: "#F3EADA" },
  },
  {
    id: "blanc",
    name: "블랑",
    categories: ["minimal", "modern"],
    coverLayout: "center",
    headingFont: "sans",
    photoTone: "bw",
    script: "Blanc",
    photoSeed: 11,
    theme: { bg: "#FFFFFF", ink: "#1F1D1B", sub: "#F0EEEA", accent: "#9E958B", accentSoft: "#F4F2EF" },
  },
  {
    id: "rosewater",
    name: "로즈워터",
    categories: ["floral"],
    coverLayout: "arch",
    headingFont: "serif",
    photoTone: "warm",
    script: "Rosewater",
    photoSeed: 9,
    theme: { bg: "#FBF3F1", ink: "#46322E", sub: "#F2DDD8", accent: "#BF8378", accentSoft: "#F8E9E5" },
  },
  {
    id: "sage-note",
    name: "세이지 노트",
    categories: ["minimal", "floral"],
    coverLayout: "floral",
    headingFont: "serif",
    photoTone: "cool",
    script: "Sage Note",
    photoSeed: 0,
    theme: { bg: "#F7F8F3", ink: "#2F332B", sub: "#E3E8DB", accent: "#8A9A7B", accentSoft: "#EDF1E6" },
  },
  {
    id: "midnight",
    name: "미드나잇",
    categories: ["modern", "classic"],
    coverLayout: "center",
    headingFont: "serif",
    photoTone: "bw",
    script: "Midnight",
    photoSeed: 6,
    theme: { bg: "#2B2A2E", ink: "#F2EFEA", sub: "#3C3A40", accent: "#C4A882", accentSoft: "#3A3840" },
  },
  {
    id: "grain",
    name: "그레인",
    categories: ["photo", "modern"],
    coverLayout: "photo",
    headingFont: "sans",
    photoTone: "film",
    script: "Grain",
    photoSeed: 13,
    theme: { bg: "#F5F2ED", ink: "#2A2724", sub: "#D8CFC2", accent: "#8E7F6E", accentSoft: "#EAE5DC" },
  },
  {
    id: "editorial-no5",
    name: "에디토리얼 N°5",
    categories: ["modern"],
    coverLayout: "editorial",
    headingFont: "serif",
    photoTone: "fade",
    script: "Numéro Cinq",
    photoSeed: 12,
    theme: { bg: "#FDFBF7", ink: "#1E1C1A", sub: "#EDE6DB", accent: "#B08D80", accentSoft: "#F4EAE5" },
  },
  {
    id: "camellia",
    name: "카멜리아",
    categories: ["floral", "classic"],
    coverLayout: "floral",
    headingFont: "serif",
    photoTone: "warm",
    script: "Camellia",
    photoSeed: 4,
    theme: { bg: "#FAF4F4", ink: "#463033", sub: "#EFDCDE", accent: "#A6606A", accentSoft: "#F6E7E9" },
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** 템플릿 + 사용자 override 를 합친 실제 렌더링 테마 */
export function resolveTheme(
  template: Template,
  data: Pick<InvitationData, "accentOverride">,
): InvitationTheme {
  if (!data.accentOverride) return template.theme;
  return { ...template.theme, accent: data.accentOverride };
}

/* ------------------------------------------------------------
   인사말 예시 — 에디터에서 "예시 불러오기"로 사용
   ------------------------------------------------------------ */

export const GREETING_SAMPLES: { label: string; title: string; body: string }[] =
  [
    {
      label: "정중한 인사",
      title: "소중한 분들을 초대합니다",
      body: "서로가 마주 보며 다져온 사랑을\n이제 함께 한곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로\n지켜나갈 수 있게 앞날을\n축복해 주시면 감사하겠습니다.",
    },
    {
      label: "담백한 인사",
      title: "우리 결혼합니다",
      body: "두 사람이 만나\n하나의 이름으로 살아가려 합니다.\n\n귀한 걸음 하시어\n저희의 시작을 함께해 주세요.",
    },
    {
      label: "감성적인 인사",
      title: "함께 걷는 첫걸음",
      body: "봄이 지나 여름이 오듯\n자연스럽게 서로에게 스며들었습니다.\n\n이제 같은 곳을 바라보며\n오래도록 함께 걸어가려 합니다.\n따뜻한 마음으로 축복해 주세요.",
    },
    {
      label: "짧은 인사",
      title: "저희 결혼합니다",
      body: "사랑하는 두 사람이\n하나가 되는 날입니다.\n오셔서 축복해 주시면\n큰 기쁨이 되겠습니다.",
    },
  ];

/* ------------------------------------------------------------
   에디터 초기값
   ------------------------------------------------------------ */

function person(over: Partial<Person>): Person {
  return {
    lastName: "",
    firstName: "",
    phone: "",
    relation: "",
    fatherLastName: "",
    fatherFirstName: "",
    fatherPhone: "",
    fatherLate: false,
    motherLastName: "",
    motherFirstName: "",
    motherPhone: "",
    motherLate: false,
    ...over,
  };
}

export function createDefaultData(templateId: string): InvitationData {
  const t = getTemplate(templateId) ?? TEMPLATES[0]!;
  return {
    cardTitle: "",
    opening: "none",
    titleDim: 0,

    groomEnglish: "",
    brideEnglish: "",
    hideGroomParents: false,
    hideBrideParents: false,
    groomContacts: [],
    brideContacts: [],

    dateFormat: "korean",
    showVenueInfo: true,
    showDateOnInvitation: true,

    showAlbum: false,
    showAlbumText: true,
    albumPages: [{ id: "p1", designId: 0, photos: [] }],

    showNotice: false,
    notices: [],

    snapEnabled: false,
    snapDriveUrl: "",

    showCouple: false,
    coupleDesign: 0,
    couplePoint1: "#E8618C",
    couplePoint2: "#2E2A27",
    groomIntro: "요리 담당 신랑입니다.\n설거지는 협상 중입니다.",
    brideIntro: "맛집 검색 담당 신부입니다.\n먹는 것만큼은 진심입니다.",

    showTimeline: false,
    timelineTitle: "우리의 시간",
    timelineShape: "circle",
    timeline: [],

    showVideo: false,
    videoMode: "upload",
    videoUrl: "",

    showGift: false,
    giftLabel: "화환 선물하기",

    guestbookPassword: "",

    galleryType: "grid",
    galleryProtect: true,

    sectionOrder: [...DEFAULT_SECTION_ORDER],

    templateId: t.id,
    coverLayout: t.coverLayout,
    headingFont: t.headingFont,
    fontScale: "md",
    effect: "none",

    coverEyebrow: t.eyebrow ?? "WE ARE GETTING MARRIED",
    coverPhotoFit: "cover",
    coverScript: t.script,
    showStickers: true,
    photoTone: t.photoTone,
    photoSeed: t.photoSeed,

    greetingTitle: GREETING_SAMPLES[0]!.title,
    greeting: GREETING_SAMPLES[0]!.body,

    groom: person({
      lastName: "김", firstName: "도윤",
      phone: "010-1234-5678",
      relation: "장남",
      fatherLastName: "김", fatherFirstName: "성호",
      fatherPhone: "010-2222-3333",
      motherLastName: "박", motherFirstName: "은정",
      motherPhone: "010-4444-5555",
    }),
    bride: person({
      lastName: "이", firstName: "서연",
      phone: "010-8765-4321",
      relation: "차녀",
      fatherLastName: "이", fatherFirstName: "재현",
      fatherPhone: "010-6666-7777",
      motherLastName: "정", motherFirstName: "미숙",
      motherPhone: "010-8888-9999",
    }),
    nameOrder: "groom-first",

    date: "2026-05-24",
    time: "13:00",
    showCalendar: true,
    showDday: true,

    venueName: "그랜드하얏트 서울",
    venueHall: "그랜드볼룸 3층",
    venueAddress: "서울특별시 용산구 소월로 322",
    venueTel: "02-000-0000",
    showMap: true,
    transport: [
      { id: "tr1", label: "자가용", body: "내비게이션에 '그랜드하얏트 서울' 검색\n지하 주차장 3시간 무료" },
      { id: "tr2", label: "지하철", body: "6호선 녹사평역 2번 출구\n셔틀버스 상시 운행 (10분 간격)" },
      { id: "tr3", label: "버스", body: "402, 405 남산도서관 하차 도보 5분" },
    ],

    showGallery: true,
    galleryTitle: "우리의 순간들",
    gallery: [],

    showAccounts: true,
    accountsTitle: "마음 전하실 곳",
    accountsNote: "참석이 어려우신 분들을 위해\n계좌번호를 안내드립니다.",
    accounts: [
      { id: "a1", side: "groom", bank: "국민은행", number: "123456-01-234567", holder: "김도윤", kakaopay: "" },
      { id: "a2", side: "groom", bank: "신한은행", number: "110-234-567890", holder: "김성호", kakaopay: "" },
      { id: "a3", side: "bride", bank: "하나은행", number: "333-890123-456", holder: "이서연", kakaopay: "" },
      { id: "a4", side: "bride", bank: "우리은행", number: "1002-345-678901", holder: "이재현", kakaopay: "" },
    ],

    showRsvp: true,
    rsvpTitle: "참석 의사 전달",
    rsvpNote: "축하의 마음으로 함께해 주시는 모든 분들을\n정성껏 모시고자 합니다.",
    rsvpAskMeal: true,
    rsvpAskCount: true,
    rsvpPopup: true,

    showGuestbook: true,
    guestbookTitle: "축하 메시지",

    bgm: "none",
    bgmAutoplay: false,

    shareTitle: "김도윤 ♥ 이서연 결혼합니다",
    shareDescription: "2026년 5월 24일 일요일 오후 1시\n그랜드하얏트 서울",
  };
}

/* ------------------------------------------------------------
   날짜 유틸
   ------------------------------------------------------------ */

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const WEEKDAY_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1);
}

export function formatDateKo(iso: string): string {
  const dt = parseDate(iso);
  return `${dt.getFullYear()}년 ${dt.getMonth() + 1}월 ${dt.getDate()}일 ${WEEKDAY_LABELS[dt.getDay()]}요일`;
}

export function formatTimeKo(time: string): string {
  const [hRaw, m] = time.split(":").map(Number);
  const h = hRaw || 0;
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${period} ${h12}시 ${m}분` : `${period} ${h12}시`;
}

export function formatDateDots(iso: string): string {
  const dt = parseDate(iso);
  return `${dt.getFullYear()}. ${String(dt.getMonth() + 1).padStart(2, "0")}. ${String(dt.getDate()).padStart(2, "0")}`;
}

export function formatDateShort(iso: string): string {
  const dt = parseDate(iso);
  return `${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

export function weekdayEn(iso: string): string {
  return WEEKDAY_EN[parseDate(iso).getDay()]!;
}

/** 해당 월의 달력 그리드 (앞쪽 빈칸 포함) */
export function monthGrid(iso: string): (number | null)[] {
  const dt = parseDate(iso);
  const firstDay = new Date(dt.getFullYear(), dt.getMonth(), 1).getDay();
  const days = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstDay }, () => null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return cells;
}

/** 예식일까지 남은 일수. 기준일을 인자로 받아 SSR/CSR 불일치를 막습니다. */
export function daysUntil(iso: string, from: Date): number {
  const target = parseDate(iso);
  const a = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const b = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((a - b) / 86_400_000);
}
