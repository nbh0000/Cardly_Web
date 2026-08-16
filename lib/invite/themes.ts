/* ============================================================
   테마 — 색과 글꼴 한 벌

   기본은 따뜻한 아이보리 바탕에 차분한 포인트색입니다. 나머지 다섯은
   같은 뼈대에 색만 갈아 끼운 것이라, 테마를 바꿔도 조판은 흔들리지
   않습니다.

   색을 새로 만들 때 지켜야 할 것이 하나 있습니다. ink 는 bg 위에서
   4.5:1, accentDeep 은 bg 위에서 4.5:1 을 넘겨야 합니다(WCAG AA).
   accent 는 큰 글자와 장식 전용이라 3:1 이면 됩니다. 아래 값들은
   그 기준으로 잡았습니다.
   ============================================================ */

import type { Theme } from "@/lib/invite/types";

export const THEMES: Theme[] = [
  {
    id: "ivory",
    label: "아이보리",
    note: "따뜻한 종이빛에 마른 장미 — 어느 행사에나 무난합니다",
    bg: "#FBF7F0",
    surface: "#F4EDE1",
    ink: "#2B2520",
    inkSoft: "#544C43",
    muted: "#7B7268",
    line: "#E4DACA",
    accent: "#B08154",
    accentDeep: "#8A5C33",
    accentSoft: "#F1E5D4",
    headingFont: "nanum-myeongjo",
    bodyFont: "gowun-dodum",
  },
  {
    id: "sage",
    label: "세이지",
    note: "마른 풀빛 — 돌잔치, 야외 행사",
    bg: "#F4F6F0",
    surface: "#E8EDE0",
    ink: "#232A22",
    inkSoft: "#4C554A",
    muted: "#727A6C",
    line: "#D9E1CE",
    accent: "#6E8B5E",
    accentDeep: "#4B6740",
    accentSoft: "#E5EDDB",
    headingFont: "gowun-batang",
    bodyFont: "gowun-dodum",
  },
  {
    id: "blush",
    label: "블러시",
    note: "물 빠진 장미 — 결혼식, 기념일",
    bg: "#FCF5F3",
    surface: "#F6E7E2",
    ink: "#2F2523",
    inkSoft: "#5A4A46",
    muted: "#83706B",
    line: "#EED9D2",
    accent: "#B4756C",
    accentDeep: "#8E5148",
    accentSoft: "#F7E6E1",
    headingFont: "nanum-myeongjo",
    bodyFont: "gowun-dodum",
  },
  {
    id: "sky",
    label: "스카이",
    note: "흐린 하늘빛 — 돌잔치, 생일",
    bg: "#F3F7FA",
    surface: "#E4EDF4",
    ink: "#1F2A33",
    inkSoft: "#465360",
    muted: "#6C7885",
    line: "#D4E2ED",
    accent: "#5385A8",
    accentDeep: "#2F5E7E",
    accentSoft: "#E2EEF6",
    headingFont: "gowun-batang",
    bodyFont: "gowun-dodum",
  },
  {
    id: "ink",
    label: "잉크",
    note: "짙은 남색과 금 — 기업 행사, 격식 있는 자리",
    bg: "#F5F5F2",
    surface: "#E9EAE5",
    ink: "#1D2430",
    inkSoft: "#454E5C",
    muted: "#6B7480",
    line: "#DADCD6",
    accent: "#8C6A34",
    accentDeep: "#26374F",
    accentSoft: "#E6E9EE",
    headingFont: "gothic-a1",
    bodyFont: "gothic-a1",
  },
  {
    id: "mocha",
    label: "모카",
    note: "구운 흙빛 — 집들이, 개업, 모임",
    bg: "#F8F2EB",
    surface: "#EEE2D5",
    ink: "#2C2118",
    inkSoft: "#57483C",
    muted: "#7E6E61",
    line: "#E5D6C6",
    accent: "#A8683F",
    accentDeep: "#7C4522",
    accentSoft: "#F0E1D2",
    headingFont: "gowun-batang",
    bodyFont: "gowun-dodum",
  },
];

export const DEFAULT_THEME = THEMES[0]!;

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? DEFAULT_THEME;
}

/**
 * 테마를 CSS 변수로 바꿉니다.
 *
 * 초대장 뿌리 요소에 style 로 붙이면 그 아래 전부가 이 색을 씁니다.
 * 테마를 갈아 끼울 때 클래스를 새로 만들 필요가 없습니다.
 */
export function themeVars(t: Theme): React.CSSProperties {
  return {
    "--wi-bg": t.bg,
    "--wi-surface": t.surface,
    "--wi-ink": t.ink,
    "--wi-ink-soft": t.inkSoft,
    "--wi-muted": t.muted,
    "--wi-line": t.line,
    "--wi-accent": t.accent,
    "--wi-accent-deep": t.accentDeep,
    "--wi-accent-soft": t.accentSoft,
  } as React.CSSProperties;
}
