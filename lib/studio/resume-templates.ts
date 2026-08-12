/**
 * 이력서 템플릿 — 레이아웃 6종 × 색 팔레트 11종 = 66종.
 *
 * 썸네일과 A4 시트 모두 CSS(app/studio.css)로만 그립니다. 이미지 에셋이
 * 없으므로 배포 용량이 늘지 않고, html2canvas 캡처에서도 그대로 재현됩니다.
 */

export type ResumeLayoutId =
  | "classic"
  | "banner"
  | "sidebar"
  | "rule"
  | "editorial"
  | "split";

export type ResumeTemplate = {
  id: string;
  name: string;
  layout: ResumeLayoutId;
  /** 액센트 — 섹션 제목, 배너, 세로 바 */
  accent: string;
  /** 액센트 틴트 — 기술 태그, 사이드바 바탕 */
  soft: string;
  /** 용지색 */
  paper: string;
  /** 본문 잉크 */
  ink: string;
  /** 섹션 제목을 영문으로 조판할지 */
  english: boolean;
};

const LAYOUTS: { id: ResumeLayoutId; label: string }[] = [
  { id: "classic", label: "클래식" },
  { id: "banner", label: "배너" },
  { id: "sidebar", label: "사이드바" },
  { id: "rule", label: "헤어라인" },
  { id: "editorial", label: "에디토리얼" },
  { id: "split", label: "스플릿" },
];

/**
 * 색 팔레트 11종.
 *
 * 뒤쪽 다섯은 예전 Cardly 가 쓰던 색조를 되살린 것입니다. 앞의 여섯보다
 * 채도가 조금 높아, 같은 계열이라도 인상이 다르게 읽힙니다.
 */
const PALETTES = [
  { key: "ink", label: "뉴트럴", accent: "#33302c", soft: "#f2efea", paper: "#ffffff", ink: "#23201d" },
  { key: "navy", label: "네이비", accent: "#22364f", soft: "#eaeff6", paper: "#ffffff", ink: "#1f242b" },
  { key: "forest", label: "포레스트", accent: "#2c4a3e", soft: "#e9f1ec", paper: "#ffffff", ink: "#202623" },
  { key: "burgundy", label: "버건디", accent: "#5c2b33", soft: "#f6ebed", paper: "#ffffff", ink: "#262023" },
  { key: "taupe", label: "토프", accent: "#8a6558", soft: "#f4eae5", paper: "#fffdfa", ink: "#2e2a27" },
  { key: "slate", label: "슬레이트", accent: "#3c4450", soft: "#eef0f3", paper: "#ffffff", ink: "#222528" },
  { key: "midnight", label: "미드나잇", accent: "#182433", soft: "#edf1f5", paper: "#ffffff", ink: "#1d232b" },
  { key: "cobalt", label: "코발트", accent: "#254a73", soft: "#edf4fa", paper: "#ffffff", ink: "#1f2730" },
  { key: "sage", label: "세이지", accent: "#315f52", soft: "#edf5f1", paper: "#ffffff", ink: "#1f2724" },
  { key: "rosewood", label: "로즈우드", accent: "#70464c", soft: "#f7efef", paper: "#ffffff", ink: "#282124" },
  { key: "violet", label: "바이올렛", accent: "#5c536e", soft: "#f2eff7", paper: "#ffffff", ink: "#242128" },
];

export const RESUME_TEMPLATES: ResumeTemplate[] = LAYOUTS.flatMap(
  (layout, layoutIndex) =>
    PALETTES.map((palette, paletteIndex) => ({
      id: `${layout.id}-${palette.key}`,
      name: `${palette.label} ${layout.label}`,
      layout: layout.id,
      accent: palette.accent,
      soft: palette.soft,
      paper: palette.paper,
      ink: palette.ink,
      // 레이아웃마다 한 종류씩만 영문 헤딩으로 — 외국계 지원용
      english: (layoutIndex + paletteIndex) % 11 === 5,
    })),
);

export const DEFAULT_RESUME_TEMPLATE = RESUME_TEMPLATES[0];

/** 이력서 시트에서 자유 배치할 수 있는 블록들 */
export const RESUME_BLOCKS = [
  "photo",
  "identity",
  "contact",
  "summary",
  "experience",
  "projects",
  "education",
  "certificates",
  "skills",
] as const;

export type ResumeBlockId = (typeof RESUME_BLOCKS)[number];

export const RESUME_BLOCK_LABEL: Record<ResumeBlockId, string> = {
  photo: "증명사진",
  identity: "이름·직무",
  contact: "연락처",
  summary: "소개",
  experience: "경력",
  projects: "프로젝트",
  education: "학력",
  certificates: "자격·어학",
  skills: "기술",
};

/** 섹션 제목 — 영문 템플릿용 대응표 */
export const SECTION_HEADING: Record<string, [string, string]> = {
  summary: ["소개", "Profile"],
  experience: ["경력", "Experience"],
  projects: ["프로젝트", "Projects"],
  education: ["학력", "Education"],
  certificates: ["자격·어학", "Certificates"],
  skills: ["기술", "Skills"],
};

/**
 * 경력·프로젝트·학력·자격증이 공유하는 항목 구조.
 *
 * 실제 이력서는 긴 문단이 아니라 「소속 · 역할 — 기간」 한 줄과 그 아래
 * 성과 불릿으로 읽힙니다. 기간을 따로 떼어 둬야 우측 정렬로 붙일 수 있고,
 * 그 정렬이 서류를 훑는 사람에게 가장 큰 단서가 됩니다.
 */
export type ResumeEntry = {
  id: string;
  /** 회사·학교·발급기관 */
  org: string;
  /** 직책·전공·자격명 */
  role: string;
  /** 2021.03 – 2024.08 처럼 */
  period: string;
  /** 성과 불릿. 줄바꿈 하나가 불릿 하나 */
  bullets: string;
};

export type ResumeData = {
  name: string;
  /** 영문 이름 — 비워 두면 표시하지 않습니다 */
  nameEn: string;
  title: string;
  email: string;
  phone: string;
  /** 깃허브·포트폴리오 주소 등, 가운뎃점으로 구분 */
  links: string;
  summary: string;
  experience: ResumeEntry[];
  projects: ResumeEntry[];
  education: ResumeEntry[];
  certificates: ResumeEntry[];
  /** 쉼표로 구분 */
  skills: string;
};

/** 항목 목록을 쓰는 섹션들 */
export const ENTRY_SECTIONS = [
  "experience",
  "projects",
  "education",
  "certificates",
] as const;

export type EntrySection = (typeof ENTRY_SECTIONS)[number];

/** 섹션마다 칸 이름이 다릅니다 (회사/학교, 직책/전공 …) */
export const ENTRY_FIELD_LABEL: Record<
  EntrySection,
  { org: string; role: string; period: string; bullets: string }
> = {
  experience: {
    org: "회사",
    role: "직책",
    period: "재직 기간",
    bullets: "성과 (한 줄에 하나씩)",
  },
  projects: {
    org: "프로젝트",
    role: "맡은 역할",
    period: "기간",
    bullets: "한 일과 결과 (한 줄에 하나씩)",
  },
  education: {
    org: "학교",
    role: "전공",
    period: "재학 기간",
    bullets: "비고 (학점·논문 등)",
  },
  certificates: {
    org: "자격·시험명",
    role: "발급기관·점수",
    period: "취득일",
    bullets: "비고",
  },
};

export function emptyEntry(id: string): ResumeEntry {
  return { id, org: "", role: "", period: "", bullets: "" };
}

export const SAMPLE_RESUME: ResumeData = {
  name: "한서윤",
  nameEn: "Han Seoyun",
  title: "Product Designer",
  email: "seoyun.han@example.com",
  phone: "010-1234-5678",
  links: "github.com/example · seoyun.design",
  summary:
    "결제와 예약처럼 실수가 곧 이탈로 이어지는 화면을 주로 맡아 왔습니다. 인터뷰로 문제를 좁히고 지표로 결과를 확인하는 방식으로 일합니다.",
  experience: [
    {
      id: "exp-1",
      org: "Cardly",
      role: "Product Designer",
      period: "2024.03 – 재직 중",
      bullets:
        "결제 실패 화면을 다시 설계해 재시도 성공률을 62%에서 81%로 올렸습니다.\n디자인 시스템을 새로 세워 신규 화면 제작 시간을 평균 40% 줄였습니다.\n주니어 디자이너 2명의 온보딩과 리뷰를 맡았습니다.",
    },
    {
      id: "exp-2",
      org: "Studio One",
      role: "UX Designer",
      period: "2021.04 – 2024.02",
      bullets:
        "가입 흐름을 5단계에서 3단계로 줄여 첫 주 이탈률을 18% 낮췄습니다.\n사용자 인터뷰 34건을 진행하고 문제를 8개 과제로 정리했습니다.",
    },
  ],
  projects: [
    {
      id: "prj-1",
      org: "모바일 청첩장 편집기",
      role: "설계 · UI 전담",
      period: "2025.01 – 2025.06",
      bullets:
        "실시간 미리보기 편집기를 설계해 제작 이탈률을 27% 줄였습니다.\n템플릿 198종의 조판 규칙을 하나의 토큰 체계로 정리했습니다.",
    },
  ],
  education: [
    {
      id: "edu-1",
      org: "한국대학교",
      role: "시각디자인학과",
      period: "2017.03 – 2021.02",
      bullets: "졸업 · 학점 3.286/4.5",
    },
  ],
  certificates: [
    {
      id: "cert-1",
      org: "TOEIC",
      role: "한국TOEIC위원회 · 905점",
      period: "2025.04",
      bullets: "",
    },
    {
      id: "cert-2",
      org: "컴퓨터활용능력 1급",
      role: "대한상공회의소",
      period: "2020.11",
      bullets: "",
    },
  ],
  skills:
    "Figma, 디자인 시스템, UX 리서치, 프로토타이핑, HTML/CSS, Framer, 데이터 분석",
};
