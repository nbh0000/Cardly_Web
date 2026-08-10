/**
 * 피그마에서 복사한 코드에서 템플릿 값을 뽑아냅니다.
 *
 * 피그마 Dev Mode 의 'Copy as code' 는 프레임의 CSS 를 그대로 줍니다.
 * 그 안에는 색·글꼴·글자 크기가 들어 있지만 배치 정보는 절대 좌표라
 * 여기서는 쓰지 않습니다. 이 코드베이스의 템플릿은 좌표가 아니라
 * "커버 레이아웃 + 테마 색 + 글꼴"의 조합이라, 옮겨올 값도 그것뿐입니다.
 *
 * CSS 가 아니라 React·Tailwind 형태로 복사해도 색과 글꼴 이름은 그대로
 * 문자열에 남으므로, 형식을 가리지 않고 정규식으로 훑습니다.
 */

import type { HeadingFont, InvitationTheme } from "@/lib/invitation";

export interface ExtractedColor {
  hex: string;
  /** 붙여넣은 코드에 몇 번 나왔는지 — 넓은 면일수록 자주 등장합니다. */
  count: number;
}

export interface FigmaExtract {
  colors: ExtractedColor[];
  theme?: InvitationTheme;
  headingFont?: HeadingFont;
  /** 가장 큰 글자에 쓰인 글꼴 이름 — 안내에만 씁니다. */
  fontFamily?: string;
}

/* ---------------- 색 유틸 ---------------- */

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

/** 사람이 느끼는 밝기 (0 어두움 ~ 1 밝음) */
export function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** 색이 얼마나 선명한지 (0 무채색 ~ 1 원색) */
function chroma(hex: string): number {
  const [r, g, b] = toRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/** a 를 b 쪽으로 t(0~1) 만큼 섞습니다. */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/* ---------------- 파싱 ---------------- */

const HEX = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const RGB = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)/g;
const FONT = /font-family\s*:\s*([^;\n}]+)/gi;

/** 이 이름들이 보이면 명조 계열로 봅니다. */
const SERIF_HINTS = [
  "serif", "playfair", "garamond", "cormorant", "didot", "bodoni", "georgia",
  "times", "noto serif", "nanum myeongjo", "myeongjo", "batang", "gowun batang",
];

/** 한 선언(`prop: value`)에서 색을 뽑습니다. */
function colorsIn(value: string): string[] {
  const out: string[] = [];
  for (const m of value.matchAll(HEX)) {
    const raw = m[1]!;
    // #RRGGBBAA — 뒤 두 자리는 투명도. 거의 투명하면 면색으로 볼 수 없습니다.
    if (raw.length === 8 && parseInt(raw.slice(6, 8), 16) / 255 < 0.35) continue;
    const base =
      raw.length === 3
        ? raw
            .split("")
            .map((c) => c + c)
            .join("")
        : raw.slice(0, 6);
    out.push(`#${base}`.toUpperCase());
  }
  for (const m of value.matchAll(RGB)) {
    if (m[4] !== undefined && Number(m[4]) < 0.35) continue;
    out.push(toHex(Number(m[1]), Number(m[2]), Number(m[3])));
  }
  return out;
}

export function extractFromFigma(input: string): FigmaExtract {
  const counts = new Map<string, number>();
  /** 배경으로 쓰인 색 (등장 순서) */
  const asBackground: string[] = [];
  /** 글자색으로 쓰인 색 (등장 순서) */
  const asText: string[] = [];

  /*
   * 색만 긁어모아 빈도로 배경을 고르면 어두운 템플릿에서 어긋납니다.
   * (글자색이 여러 번 나오고 배경은 한 번만 나오는 게 보통이라
   *  크림색 글자가 배경으로 뽑히는 식) 그래서 어떤 속성에 쓰였는지를 봅니다.
   */
  for (const decl of input.split(/[;\n{}]/)) {
    const at = decl.indexOf(":");
    if (at < 0) continue;
    const prop = decl.slice(0, at).trim().toLowerCase();
    const found = colorsIn(decl.slice(at + 1));
    if (!found.length) continue;

    for (const hex of found) counts.set(hex, (counts.get(hex) ?? 0) + 1);

    if (/(^|-)(background|fill)(-color)?$/.test(prop) || prop === "background") {
      asBackground.push(...found);
    } else if (prop === "color" || prop.endsWith("text-color")) {
      asText.push(...found);
    }
  }

  // 속성 없이 색만 붙여넣은 경우(React·Tailwind 등)에도 최소한 목록은 만듭니다.
  if (counts.size === 0) {
    for (const hex of colorsIn(input)) {
      counts.set(hex, (counts.get(hex) ?? 0) + 1);
    }
  }

  const colors: ExtractedColor[] = [...counts.entries()]
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count || luminance(b.hex) - luminance(a.hex));

  const fonts = [...input.matchAll(FONT)].map((m) =>
    m[1]!.replace(/["';]/g, "").split(",")[0]!.trim(),
  );
  const fontFamily = fonts[0];
  const headingFont: HeadingFont | undefined = fonts.length
    ? fonts.some((f) => SERIF_HINTS.some((h) => f.toLowerCase().includes(h)))
      ? "serif"
      : "sans"
    : undefined;

  return {
    colors,
    theme: assignTheme(colors, asBackground, asText),
    headingFont,
    fontFamily,
  };
}

/**
 * 뽑아낸 색을 테마 다섯 자리에 배치합니다.
 *
 * `background`/`fill` 에 쓰인 색을 배경으로, `color` 에 쓰인 색을 글자색으로
 * 봅니다. 피그마 CSS 는 바깥 프레임부터 순서대로 나오므로 각각 첫 번째를
 * 씁니다. 속성 정보가 없으면 밝기 대비로 넘어갑니다.
 */
export function assignTheme(
  colors: ExtractedColor[],
  asBackground: string[] = [],
  asText: string[] = [],
): InvitationTheme | undefined {
  if (colors.length < 2) return undefined;

  const bg = asBackground[0] ?? colors[0]!.hex;
  const bgLum = luminance(bg);

  const rest = colors.filter((c) => c.hex !== bg);
  const byContrast = rest
    .slice()
    .sort(
      (a, b) =>
        Math.abs(luminance(b.hex) - bgLum) - Math.abs(luminance(a.hex) - bgLum),
    );

  // 글자색 — 명시된 값이 있으면 그것을, 없으면 배경과 대비가 가장 큰 색
  const ink =
    asText.find((c) => c !== bg) ??
    byContrast[0]?.hex ??
    (bgLum > 0.5 ? "#2E2A27" : "#F4F2EE");

  // 포인트색 — 가장 선명하면서 배경과 충분히 구분되는 색
  const accent =
    rest
      .filter((c) => c.hex !== ink && Math.abs(luminance(c.hex) - bgLum) > 0.1)
      .sort((a, b) => chroma(b.hex) - chroma(a.hex))[0]?.hex ?? ink;

  // 보조색 — 배경 다음으로 쓰인 면색(카드·박스). 없으면 배경과 글자를 섞습니다.
  const sub =
    asBackground.find((c) => c !== bg && c !== ink && c !== accent) ??
    rest.find((c) => c.hex !== ink && c.hex !== accent)?.hex ??
    mix(bg, ink, 0.12);

  return { bg, ink, sub, accent, accentSoft: mix(bg, accent, 0.18) };
}
