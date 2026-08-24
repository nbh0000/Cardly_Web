"use client";

/**
 * 요소 한 개를 화면에 그립니다.
 *
 * 편집 화면과 내보내기(PNG·JPG)가 같은 컴포넌트를 씁니다. 미리보기와
 * 결과물을 따로 그리면 반드시 어느 날 서로 달라지고, 그 차이는 인쇄를
 * 맡긴 뒤에 발견됩니다.
 *
 * 좌표는 전부 mm 이고, 그리는 순간에만 scale(px/mm)을 곱합니다. 그래서
 * 같은 문서가 화면(작게)과 파일(300dpi)에서 같은 그림이 됩니다.
 */

import { fontStack } from "@/lib/fonts";
import type { PrintElement, ShapeElement, TextElement } from "@/lib/print/types";

/** pt → px. 1pt 는 1/72인치이고 1인치는 25.4mm 입니다. */
export function ptToPx(pt: number, scale: number): number {
  return (pt / 72) * 25.4 * scale;
}

export function shadowCss(
  s: { x: number; y: number; blur: number; color: string } | undefined,
  scale: number,
): string | undefined {
  if (!s) return undefined;
  return `${s.x * scale}px ${s.y * scale}px ${s.blur * scale}px ${s.color}`;
}

export function ElementView({
  el,
  scale,
  /** 글자를 고치는 중이면 그 요소는 여기서 그리지 않습니다 */
  editing,
}: {
  el: PrintElement;
  scale: number;
  editing?: boolean;
}) {
  if (el.hidden) return null;

  const base: React.CSSProperties = {
    position: "absolute",
    left: el.x * scale,
    top: el.y * scale,
    width: el.w * scale,
    height: el.h * scale,
    opacity: el.opacity,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    transformOrigin: "center center",
  };

  if (el.kind === "text") return <TextBody el={el} scale={scale} style={base} editing={editing} />;

  if (el.kind === "image") {
    return (
      <div style={{ ...base, overflow: "hidden", borderRadius: (el.radius ?? 0) * scale }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={el.src}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: el.fit,
            objectPosition: `${(el.focusX ?? 0.5) * 100}% ${(el.focusY ?? 0.5) * 100}%`,
            filter: `brightness(${el.brightness ?? 100}%) contrast(${el.contrast ?? 100}%) saturate(${el.saturate ?? 100}%)`,
            boxShadow: shadowCss(el.shadow, scale),
          }}
        />
      </div>
    );
  }

  return <ShapeBody el={el} scale={scale} style={base} />;
}

function TextBody({
  el,
  scale,
  style,
  editing,
}: {
  el: TextElement;
  scale: number;
  style: React.CSSProperties;
  editing?: boolean;
}) {
  return (
    <div
      style={{
        ...style,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        // 편집 중에는 contentEditable 쪽이 그리므로 여기서는 감춥니다
        visibility: editing ? "hidden" : undefined,
      }}
    >
      <div
        style={{
          fontFamily: fontStack(el.font),
          fontSize: ptToPx(el.size, scale),
          fontWeight: el.weight,
          fontStyle: el.italic ? "italic" : undefined,
          textDecoration: el.underline ? "underline" : undefined,
          color: el.color,
          textAlign: el.align,
          lineHeight: el.lineHeight,
          letterSpacing: `${el.letterSpacing}em`,
          background: el.highlight,
          textShadow: shadowCss(el.shadow, scale),
          whiteSpace: "pre-wrap",
          wordBreak: "keep-all",
          overflowWrap: "break-word",
        }}
      >
        {el.text}
      </div>
    </div>
  );
}

function ShapeBody({
  el,
  scale,
  style,
}: {
  el: ShapeElement;
  scale: number;
  style: React.CSSProperties;
}) {
  const stroke = el.stroke && (el.strokeWidth ?? 0) > 0 ? el.stroke : "none";
  const strokeWidth = (el.strokeWidth ?? 0) * scale;
  const w = Math.max(1, el.w * scale);
  const h = Math.max(1, el.h * scale);
  const filter = el.shadow
    ? `drop-shadow(${el.shadow.x * scale}px ${el.shadow.y * scale}px ${el.shadow.blur * scale}px ${el.shadow.color})`
    : undefined;

  /* 선과 화살표는 높이가 0 에 가까워 svg 로 그리면 잘립니다. 그래서 이 둘만
     따로 그리고, 나머지는 하나의 svg 규칙으로 처리합니다. */
  if (el.shape === "line" || el.shape === "arrow") {
    return (
      <div style={{ ...style, height: Math.max(h, 2), filter }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${Math.max(h, 2)}`} preserveAspectRatio="none">
          <line
            x1={0}
            y1={Math.max(h, 2) / 2}
            x2={el.shape === "arrow" ? w - Math.max(h, 6) * 1.6 : w}
            y2={Math.max(h, 2) / 2}
            stroke={el.fill}
            strokeWidth={Math.max(h, 1.5)}
            strokeLinecap="round"
          />
          {el.shape === "arrow" && (
            <polygon
              points={`${w},${Math.max(h, 2) / 2} ${w - Math.max(h, 6) * 1.8},${Math.max(h, 2) / 2 - Math.max(h, 6)} ${w - Math.max(h, 6) * 1.8},${Math.max(h, 2) / 2 + Math.max(h, 6)}`}
              fill={el.fill}
            />
          )}
        </svg>
      </div>
    );
  }

  return (
    <div style={{ ...style, filter }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {el.shape === "rect" && (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={Math.max(0, w - strokeWidth)}
            height={Math.max(0, h - strokeWidth)}
            rx={(el.radius ?? 0) * scale}
            fill={el.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        )}
        {el.shape === "ellipse" && (
          <ellipse
            cx={w / 2}
            cy={h / 2}
            rx={Math.max(0, w / 2 - strokeWidth / 2)}
            ry={Math.max(0, h / 2 - strokeWidth / 2)}
            fill={el.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        )}
        {el.shape === "triangle" && (
          <polygon points={`${w / 2},0 ${w},${h} 0,${h}`} fill={el.fill} stroke={stroke} strokeWidth={strokeWidth} />
        )}
        {el.shape === "star" && <polygon points={starPoints(w, h)} fill={el.fill} stroke={stroke} strokeWidth={strokeWidth} />}
        {el.shape === "bubble" && (
          <path d={bubblePath(w, h)} fill={el.fill} stroke={stroke} strokeWidth={strokeWidth} />
        )}
      </svg>
    </div>
  );
}

/** 오각별 — 바깥 반지름과 안쪽 반지름을 번갈아 찍습니다 */
function starPoints(w: number, h: number): string {
  const cx = w / 2;
  const cy = h / 2;
  const outer = Math.min(w, h) / 2;
  const inner = outer * 0.42;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a) * (w / Math.min(w, h))},${cy + r * Math.sin(a) * (h / Math.min(w, h))}`);
  }
  return pts.join(" ");
}

/** 말풍선 — 둥근 네모에 아래쪽 꼬리 */
function bubblePath(w: number, h: number): string {
  const r = Math.min(w, h) * 0.14;
  const body = h * 0.82;
  return [
    `M ${r} 0`,
    `H ${w - r}`,
    `Q ${w} 0 ${w} ${r}`,
    `V ${body - r}`,
    `Q ${w} ${body} ${w - r} ${body}`,
    `H ${w * 0.34}`,
    `L ${w * 0.22} ${h}`,
    `L ${w * 0.24} ${body}`,
    `H ${r}`,
    `Q 0 ${body} 0 ${body - r}`,
    `V ${r}`,
    `Q 0 0 ${r} 0`,
    "Z",
  ].join(" ");
}
