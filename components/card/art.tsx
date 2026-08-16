/* ============================================================
   카드 앞면 그림

   처음 판은 원과 사각형으로 꽃과 케이크를 흉내 낸 것이라 클립아트에
   가까웠습니다. 다시 그리면서 실제 문구류가 쓰는 언어를 가져왔습니다.

     · 리소그래프 2도 인쇄 — 잉크가 겹치는 자리가 짙어집니다(multiply).
     · 화면 밖으로 잘려 나가는 큰 모티프 — 여백을 겁내지 않습니다.
     · 베지에로 그린 유기적인 형태 — 원과 사각형을 쓰지 않습니다.
     · 종이의 결과 잉크의 얼룩 — feTurbulence 로 그 자리에서 만듭니다.
     · 부드러운 그라디언트 — 단색 면을 그대로 두지 않습니다.

   그림은 100×140(카드 비율 5:7) 안에서 그리고 바깥에서 면을 채웁니다.
   색은 팔레트에서만 받으므로, 같은 그림도 색이 바뀌면 다른 카드가
   됩니다. 외부 이미지를 쓰지 않으니 라이선스 문제도 없습니다.
   ============================================================ */

import type { ArtKind, Palette } from "@/lib/card/types";

type P = { c: Palette; id: string };

/* ------------------------------------------------------------
   공통 재질 — 종이 결, 잉크 얼룩, 부드러운 빛
   ------------------------------------------------------------ */

function Defs({ c, id }: P) {
  return (
    <defs>
      {/* 종이 위에 얹히는 아주 고운 결 */}
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="4"
          stitchTiles="stitch"
          result="n"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>

      {/* 잉크가 번진 자리 — 형태의 가장자리를 눅눅하게 만듭니다 */}
      <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.1" />
      </filter>

      {/* 바탕에 도는 빛 */}
      <radialGradient id={`${id}-glow`} cx="50%" cy="34%" r="72%">
        <stop offset="0%" stopColor={c.tint} />
        <stop offset="100%" stopColor={c.paper} />
      </radialGradient>

      {/* 주색의 농담 */}
      <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor={c.accent} />
        <stop offset="100%" stopColor={c.deep} />
      </linearGradient>

      <linearGradient id={`${id}-soft2`} x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor={c.soft} />
        <stop offset="100%" stopColor={c.tint} />
      </linearGradient>
    </defs>
  );
}

/** 종이 바탕 + 결 */
function Ground({ c, id }: P) {
  return (
    <>
      <rect width="100" height="140" fill={`url(#${id}-glow)`} />
      <rect
        width="100"
        height="140"
        filter={`url(#${id}-grain)`}
        opacity="0.055"
        style={{ mixBlendMode: "multiply" }}
      />
      <rect width="100" height="140" fill="none" />
      {/* 아래쪽으로 아주 옅게 깔리는 그늘 — 종이가 평평해 보이지 않게 */}
      <rect
        width="100"
        height="140"
        fill={c.soft}
        opacity="0.16"
        style={{ mixBlendMode: "multiply" }}
        mask={`url(#${id}-fade)`}
      />
      <defs>
        <mask id={`${id}-fade`}>
          <linearGradient id={`${id}-fadeg`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
          <rect width="100" height="140" fill={`url(#${id}-fadeg)`} />
        </mask>
      </defs>
    </>
  );
}

/* ------------------------------------------------------------
   1. BLOOM — 화면을 넘어 잘려 나가는 큰 꽃
   ------------------------------------------------------------ */

function Bloom({ c, id }: P) {
  /* 꽃잎 한 장을 베지에로 그리고 축을 돌려 씁니다.
     끝이 뾰족하고 밑동이 좁은, 실제 꽃잎의 실루엣입니다. */
  const petal =
    "M0 0 C 10 -6 20 -20 16 -34 C 13 -44 5 -48 0 -48 C -5 -48 -13 -44 -16 -34 C -20 -20 -10 -6 0 0 Z";
  const ring = (cx: number, cy: number, s: number, n: number, off: number) =>
    Array.from({ length: n }, (_, i) => (
      <path
        key={i}
        d={petal}
        transform={`translate(${cx} ${cy}) rotate(${off + (360 / n) * i}) scale(${s})`}
      />
    ));

  return (
    <>
      {/* 뒤쪽 꽃 — 잘려 나갑니다 */}
      <g fill={c.soft} opacity="0.9" style={{ mixBlendMode: "multiply" }}>
        {ring(14, 24, 0.5, 7, 12)}
      </g>
      <g fill={c.soft} opacity="0.75" style={{ mixBlendMode: "multiply" }}>
        {ring(96, 108, 0.44, 7, 40)}
      </g>

      {/* 줄기와 잎 */}
      <path
        d="M60 140 C 58 116 56 100 58 84"
        stroke={c.deep}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M58 116 C 46 112 40 102 42 94 C 52 94 58 104 58 116 Z"
        fill={c.deep}
        opacity="0.45"
      />
      <path
        d="M58 100 C 70 98 76 88 74 80 C 64 81 58 90 58 100 Z"
        fill={c.deep}
        opacity="0.3"
      />

      {/* 주인공 꽃 */}
      <g
        fill={`url(#${id}-ink)`}
        style={{ mixBlendMode: "multiply" }}
        opacity="0.95"
      >
        {ring(58, 62, 0.62, 8, 22)}
      </g>
      <g fill={c.tint} opacity="0.95">
        {ring(58, 62, 0.34, 6, 0)}
      </g>
      <circle cx="58" cy="62" r="6.5" fill={c.deep} opacity="0.85" />
      <circle cx="56" cy="60" r="2.2" fill={c.tint} opacity="0.7" />
    </>
  );
}

/* ------------------------------------------------------------
   2. GARDEN — 가는 선으로 그린 들꽃 몇 줄기
   ------------------------------------------------------------ */

function Garden({ c, id }: P) {
  const stems: [number, number, number][] = [
    [26, 118, 46],
    [40, 122, 34],
    [54, 118, 52],
    [68, 124, 40],
    [80, 120, 58],
  ];
  return (
    <>
      <ellipse
        cx="50"
        cy="130"
        rx="42"
        ry="9"
        fill={c.soft}
        opacity="0.5"
        filter={`url(#${id}-soft)`}
      />
      {stems.map(([x, base, h], i) => {
        const top = base - h;
        const bend = i % 2 ? 5 : -5;
        return (
          <g key={i}>
            <path
              d={`M${x} ${base} C ${x + bend} ${base - h * 0.5} ${x - bend} ${top + 10} ${x} ${top}`}
              stroke={c.deep}
              strokeWidth="0.9"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* 잎 두 장 */}
            <path
              d={`M${x} ${base - h * 0.42} C ${x - 9} ${base - h * 0.5} ${x - 11} ${base - h * 0.62} ${x - 4} ${base - h * 0.66} C ${x - 2} ${base - h * 0.56} ${x} ${base - h * 0.48} ${x} ${base - h * 0.42} Z`}
              fill={c.deep}
              opacity="0.35"
            />
            {/* 꽃 머리 */}
            {i % 2 === 0 ? (
              <g style={{ mixBlendMode: "multiply" }}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse
                    key={a}
                    cx={x}
                    cy={top - 3.4}
                    rx="2.1"
                    ry="3.6"
                    fill={c.accent}
                    opacity="0.85"
                    transform={`rotate(${a} ${x} ${top})`}
                  />
                ))}
                <circle cx={x} cy={top} r="1.8" fill={c.deep} />
              </g>
            ) : (
              <g>
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <circle
                    key={k}
                    cx={x + (k % 2 ? 2.4 : -2.4)}
                    cy={top + k * 2.6}
                    r="1.7"
                    fill={k % 2 ? c.soft : c.accent}
                    opacity="0.9"
                  />
                ))}
              </g>
            )}
          </g>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------
   3. ARCH — 아치 너머의 해
   ------------------------------------------------------------ */

function Arch({ c, id }: P) {
  return (
    <>
      <defs>
        <clipPath id={`${id}-arch`}>
          <path d="M20 122 V 56 a30 30 0 0 1 60 0 V 122 Z" />
        </clipPath>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.tint} />
          <stop offset="55%" stopColor={c.soft} />
          <stop offset="100%" stopColor={c.accent} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${id}-arch)`}>
        <rect x="20" y="20" width="60" height="102" fill={`url(#${id}-sky)`} />
        <circle
          cx="50"
          cy="70"
          r="19"
          fill={`url(#${id}-ink)`}
          style={{ mixBlendMode: "multiply" }}
          opacity="0.92"
        />
        {/* 해 아래를 지나는 구름 띠 */}
        {[84, 92, 100].map((y, i) => (
          <rect
            key={y}
            x={20}
            y={y}
            width="60"
            height={2.2 - i * 0.4}
            rx="1"
            fill={c.paper}
            opacity={0.55 - i * 0.12}
          />
        ))}
      </g>

      {/* 아치 테두리 */}
      <path
        d="M20 122 V 56 a30 30 0 0 1 60 0 V 122"
        fill="none"
        stroke={c.deep}
        strokeWidth="1.4"
        opacity="0.65"
      />
      <path
        d="M15 122 V 56 a35 35 0 0 1 70 0 V 122"
        fill="none"
        stroke={c.deep}
        strokeWidth="0.6"
        opacity="0.28"
      />
      <path d="M8 122 H 92" stroke={c.deep} strokeWidth="1.4" opacity="0.65" />
    </>
  );
}

/* ------------------------------------------------------------
   4. DUNE — 겹치는 언덕과 해
   ------------------------------------------------------------ */

function Dune({ c }: Pick<P, "c">) {
  return (
    <>
      <circle
        cx="64"
        cy="46"
        r="17"
        fill={c.accent}
        opacity="0.9"
        style={{ mixBlendMode: "multiply" }}
      />
      <g style={{ mixBlendMode: "multiply" }}>
        <path
          d="M-4 96 C 16 78 34 92 52 84 C 70 76 88 86 104 78 L104 144 L-4 144 Z"
          fill={c.soft}
          opacity="0.95"
        />
        <path
          d="M-4 112 C 18 96 30 110 50 104 C 72 97 84 108 104 100 L104 144 L-4 144 Z"
          fill={c.accent}
          opacity="0.5"
        />
        <path
          d="M-4 126 C 20 114 36 124 56 120 C 78 115 88 122 104 118 L104 144 L-4 144 Z"
          fill={c.deep}
          opacity="0.55"
        />
      </g>
      {/* 언덕 위의 가는 능선 */}
      <path
        d="M-4 96 C 16 78 34 92 52 84 C 70 76 88 86 104 78"
        fill="none"
        stroke={c.deep}
        strokeWidth="0.7"
        opacity="0.35"
      />
    </>
  );
}

/* ------------------------------------------------------------
   5. TERRAZZO — 테라조 조각
   ------------------------------------------------------------ */

const CHIPS: [number, number, number, number, number][] = [
  [12, 18, 4.2, 24, 0], [30, 10, 3.1, -40, 1], [48, 22, 5, 12, 2],
  [70, 14, 3.6, 55, 0], [86, 26, 4.4, -18, 1], [8, 42, 3.4, 70, 2],
  [26, 38, 4.8, -12, 0], [46, 48, 3.2, 34, 1], [66, 40, 4.6, -50, 2],
  [88, 52, 3, 20, 0], [16, 64, 4.4, -30, 1], [36, 70, 3.4, 48, 2],
  [58, 66, 5.2, -8, 0], [78, 74, 3.6, 62, 1], [10, 88, 4, -44, 2],
  [32, 96, 3.4, 16, 0], [52, 90, 4.6, -26, 1], [72, 98, 3.2, 40, 2],
  [90, 92, 4.2, -60, 0], [20, 114, 3.6, 28, 1], [44, 120, 4.4, -14, 2],
  [66, 116, 3.2, 52, 0], [86, 124, 4, -36, 1], [14, 132, 3.4, 8, 2],
  [56, 134, 4.2, -48, 0],
];

function Terrazzo({ c }: Pick<P, "c">) {
  const fills = [c.accent, c.deep, c.soft];
  return (
    <g style={{ mixBlendMode: "multiply" }}>
      {CHIPS.map(([x, y, s, r, v], i) => (
        <path
          key={i}
          /* 조각마다 다른 다각형 — 자연석처럼 각이 불규칙합니다 */
          d={
            i % 3 === 0
              ? "M0 -1 L0.9 -0.4 L0.7 0.7 L-0.3 1 L-0.9 0.1 Z"
              : i % 3 === 1
                ? "M-0.9 -0.5 L0.6 -1 L1 0.2 L0.1 1 L-0.8 0.5 Z"
                : "M-0.6 -0.9 L0.8 -0.6 L0.9 0.5 L-0.2 1 L-1 0.1 Z"
          }
          transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
          fill={fills[v]}
          opacity={v === 2 ? 0.85 : 0.75}
        />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------
   6. CONFETTI — 손으로 뿌린 색종이
   ------------------------------------------------------------ */

const FLAKES: [number, number, number, number][] = [
  [10, 16, -28, 0], [24, 8, 46, 1], [38, 20, -8, 2], [52, 10, 22, 0],
  [66, 18, -40, 1], [80, 8, 14, 2], [92, 22, -22, 0], [6, 36, 38, 1],
  [20, 44, -14, 2], [34, 34, 58, 0], [50, 42, -34, 1], [64, 36, 10, 2],
  [78, 46, -52, 0], [92, 38, 26, 1], [12, 58, -20, 2], [28, 64, 42, 0],
  [44, 56, -6, 1], [60, 62, 30, 2], [74, 58, -46, 0], [88, 66, 18, 1],
  [8, 80, -32, 2], [22, 88, 52, 0], [40, 82, -12, 1], [56, 90, 36, 2],
  [70, 84, -54, 0], [86, 92, 8, 1], [14, 106, -24, 2], [32, 114, 44, 0],
  [50, 108, -10, 1], [68, 116, 28, 2], [84, 110, -42, 0], [24, 130, 16, 1],
  [58, 132, -30, 2], [78, 128, 50, 0],
];

function Confetti({ c }: Pick<P, "c">) {
  const fills = [c.accent, c.deep, c.soft];
  return (
    <g style={{ mixBlendMode: "multiply" }}>
      {FLAKES.map(([x, y, r, v], i) => {
        const fill = fills[v]!;
        const t = `translate(${x} ${y}) rotate(${r})`;
        /* 세 가지 조각 — 긴 리본, 작은 점, 굽은 실 */
        if (i % 3 === 1)
          return <circle key={i} cx={x} cy={y} r="1.5" fill={fill} opacity="0.8" />;
        if (i % 3 === 2)
          return (
            <path
              key={i}
              d="M-4 0 C -1.5 -2.6 1.5 2.6 4 0"
              transform={t}
              stroke={fill}
              strokeWidth="1.1"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />
          );
        return (
          <rect
            key={i}
            x="-1.5"
            y="-3.6"
            width="3"
            height="7.2"
            rx="1.4"
            transform={t}
            fill={fill}
            opacity="0.82"
          />
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------
   7. BALLOON — 풍선 다발
   ------------------------------------------------------------ */

function Balloon({ c, id }: P) {
  const set: [number, number, number, string, number][] = [
    [30, 40, 11.5, c.accent, 0.95],
    [52, 28, 13.5, c.deep, 0.9],
    [72, 42, 11, c.soft, 1],
    [41, 60, 8.5, c.soft, 1],
    [63, 62, 9, c.accent, 0.8],
  ];
  return (
    <>
      {/* 끈 — 한 점으로 모입니다 */}
      {set.map(([x, y, r], i) => (
        <path
          key={`s${i}`}
          d={`M${x} ${y + r * 1.3} C ${x + (i % 2 ? 8 : -8)} ${(y + 104) / 2} ${52 + (i % 2 ? -4 : 4)} ${96} 52 108`}
          stroke={c.deep}
          strokeWidth="0.7"
          fill="none"
          opacity="0.45"
        />
      ))}
      {set.map(([x, y, r, fill, op], i) => (
        <g key={i} style={{ mixBlendMode: "multiply" }} opacity={op}>
          {/* 풍선은 정확한 타원이 아닙니다 — 아래가 좁고 위가 넓습니다 */}
          <path
            d={`M${x} ${y - r * 1.2}
                C ${x + r * 1.05} ${y - r * 1.2} ${x + r * 1.1} ${y + r * 0.55} ${x} ${y + r * 1.28}
                C ${x - r * 1.1} ${y + r * 0.55} ${x - r * 1.05} ${y - r * 1.2} ${x} ${y - r * 1.2} Z`}
            fill={fill}
          />
          {/* 빛 */}
          <ellipse
            cx={x - r * 0.34}
            cy={y - r * 0.42}
            rx={r * 0.2}
            ry={r * 0.32}
            fill={c.paper}
            opacity="0.5"
            transform={`rotate(-18 ${x} ${y})`}
          />
          {/* 묶은 목 */}
          <path
            d={`M${x - 1.5} ${y + r * 1.26} l1.5 2.6 1.5-2.6 z`}
            fill={fill}
          />
        </g>
      ))}
      <circle cx="52" cy="108" r="1.8" fill={c.deep} opacity="0.6" />
      <ellipse
        cx="52"
        cy="122"
        rx="26"
        ry="4"
        fill={c.soft}
        opacity="0.45"
        filter={`url(#${id}-soft)`}
      />
    </>
  );
}

/* ------------------------------------------------------------
   8. CANDLE — 촛불 세 자루와 빛무리
   ------------------------------------------------------------ */

function Candle({ c, id }: P) {
  const candles: [number, number][] = [
    [34, 74],
    [50, 66],
    [66, 74],
  ];
  return (
    <>
      <defs>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.accent} stopOpacity="0.4" />
          <stop offset="100%" stopColor={c.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {candles.map(([x, y], i) => (
        <circle key={`h${i}`} cx={x} cy={y - 12} r="20" fill={`url(#${id}-halo)`} />
      ))}

      {candles.map(([x, y], i) => (
        <g key={i}>
          {/* 초 — 줄무늬 */}
          <rect
            x={x - 3}
            y={y}
            width="6"
            height="34"
            rx="2.4"
            fill={i === 1 ? c.accent : c.soft}
            style={{ mixBlendMode: "multiply" }}
          />
          {[0, 1, 2, 3].map((k) => (
            <path
              key={k}
              d={`M${x - 3} ${y + 5 + k * 8} l6 -3.4`}
              stroke={i === 1 ? c.tint : c.deep}
              strokeWidth="1.5"
              opacity={i === 1 ? 0.65 : 0.35}
            />
          ))}
          {/* 심지 */}
          <path
            d={`M${x} ${y} v-3`}
            stroke={c.deep}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          {/* 불꽃 — 눈물 모양 */}
          <path
            d={`M${x} ${y - 14}
                C ${x + 4.2} ${y - 9} ${x + 3.4} ${y - 3.4} ${x} ${y - 3}
                C ${x - 3.4} ${y - 3.4} ${x - 4.2} ${y - 9} ${x} ${y - 14} Z`}
            fill={c.accent}
          />
          <path
            d={`M${x} ${y - 10}
                C ${x + 2} ${y - 7} ${x + 1.7} ${y - 4.4} ${x} ${y - 4.2}
                C ${x - 1.7} ${y - 4.4} ${x - 2} ${y - 7} ${x} ${y - 10} Z`}
            fill={c.tint}
            opacity="0.9"
          />
        </g>
      ))}

      {/* 초를 세운 자리 */}
      <path
        d="M16 108 C 34 104 66 104 84 108 L84 110 C 66 106 34 106 16 110 Z"
        fill={c.deep}
        opacity="0.4"
      />
    </>
  );
}

/* ------------------------------------------------------------
   9. NIGHT — 밤하늘, 달, 능선
   ------------------------------------------------------------ */

function Night({ c, id }: P) {
  const stars: [number, number, number][] = [
    [16, 22, 1.5], [30, 14, 1], [44, 26, 0.9], [58, 16, 1.4], [72, 28, 1],
    [86, 18, 1.2], [10, 40, 0.9], [36, 44, 1.3], [64, 46, 0.9], [90, 42, 1.1],
    [22, 58, 1], [50, 60, 1.2], [78, 62, 0.9],
  ];
  const star = (x: number, y: number, r: number) =>
    `M${x} ${y - r * 3} C ${x + r * 0.5} ${y - r} ${x + r} ${y - r * 0.5} ${x + r * 3} ${y} C ${x + r} ${y + r * 0.5} ${x + r * 0.5} ${y + r} ${x} ${y + r * 3} C ${x - r * 0.5} ${y + r} ${x - r} ${y + r * 0.5} ${x - r * 3} ${y} C ${x - r} ${y - r * 0.5} ${x - r * 0.5} ${y - r} ${x} ${y - r * 3} Z`;

  return (
    <>
      <defs>
        <linearGradient id={`${id}-nsky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.deep} />
          <stop offset="60%" stopColor={c.paper} />
        </linearGradient>
      </defs>
      <rect width="100" height="140" fill={`url(#${id}-nsky)`} opacity="0.55" />

      {/* 달 — 초승달은 원 두 개의 차집합입니다.
          호 두 개로 그리면 반지름이 현보다 짧아 브라우저가 반지름을
          늘려 버리고, 그 순간 초승달이 사라집니다. 마스크가 확실합니다. */}
      <defs>
        <mask id={`${id}-moon`}>
          <circle cx="70" cy="38" r="15" fill="#fff" />
          <circle cx="78" cy="33" r="13.5" fill="#000" />
        </mask>
      </defs>
      <circle
        cx="70"
        cy="38"
        r="15"
        fill={c.accent}
        mask={`url(#${id}-moon)`}
        opacity="0.95"
      />

      {stars.map(([x, y, r], i) => (
        <path key={i} d={star(x, y, r)} fill={c.accent} opacity={0.35 + (i % 3) * 0.2} />
      ))}

      {/* 능선 */}
      <g style={{ mixBlendMode: "multiply" }}>
        <path
          d="M-4 104 L 18 82 L 34 98 L 52 76 L 72 100 L 88 88 L104 102 L104 144 L-4 144 Z"
          fill={c.soft}
          opacity="0.9"
        />
        <path
          d="M-4 118 L 22 98 L 40 112 L 60 94 L 82 114 L104 100 L104 144 L-4 144 Z"
          fill={c.deep}
          opacity="0.75"
        />
      </g>
    </>
  );
}

/* ------------------------------------------------------------
   10. WAVE — 겹쳐 흐르는 물결
   ------------------------------------------------------------ */

function Wave({ c }: Pick<P, "c">) {
  const line = (y: number, a: number) =>
    `M-6 ${y} C 12 ${y - a} 26 ${y + a} 44 ${y} C 62 ${y - a} 76 ${y + a} 106 ${y}`;
  return (
    <g style={{ mixBlendMode: "multiply" }}>
      {Array.from({ length: 11 }, (_, i) => {
        const y = 18 + i * 11;
        const a = 6 + (i % 3) * 2;
        const w = i % 4 === 0 ? 3 : 1.4;
        const col = i % 4 === 0 ? c.accent : i % 2 ? c.soft : c.deep;
        return (
          <path
            key={i}
            d={line(y, a)}
            stroke={col}
            strokeWidth={w}
            fill="none"
            strokeLinecap="round"
            opacity={i % 4 === 0 ? 0.85 : 0.45}
          />
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------
   11. SPRIG — 모서리에서 뻗어 나온 잎가지
   ------------------------------------------------------------ */

function Sprig({ c }: Pick<P, "c">) {
  /* 가지 하나를 그리고 잎을 좌우 번갈아 답니다.
     잎은 양 끝이 뾰족한 렌즈 모양(두 호의 교집합)입니다. */
  const branch = (
    sx: number, sy: number, ex: number, ey: number,
    c1x: number, c1y: number, c2x: number, c2y: number,
    n: number, size: number, flip: number,
  ) => {
    const pt = (t: number) => {
      const u = 1 - t;
      return {
        x: u * u * u * sx + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * ex,
        y: u * u * u * sy + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * ey,
      };
    };
    const leaves = Array.from({ length: n }, (_, i) => {
      const t = 0.16 + (i / (n - 1)) * 0.8;
      const p = pt(t);
      const a = (i % 2 ? 42 : -42) * flip + (t - 0.5) * 40;
      const s = size * (1 - t * 0.42);
      return (
        <path
          key={i}
          d="M0 0 C 5 -2.6 11 -1.4 14 0 C 11 1.4 5 2.6 0 0 Z"
          transform={`translate(${p.x} ${p.y}) rotate(${a}) scale(${s})`}
          fill={c.deep}
          opacity={0.42 + (i % 2) * 0.16}
        />
      );
    });
    return (
      <>
        <path
          d={`M${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`}
          stroke={c.deep}
          strokeWidth="0.9"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
        {leaves}
      </>
    );
  };

  return (
    <g style={{ mixBlendMode: "multiply" }}>
      {branch(-6, 8, 62, 58, 18, 10, 40, 30, 9, 1, 1)}
      {branch(106, 128, 44, 82, 88, 128, 62, 108, 8, 0.9, -1)}
      {/* 작은 열매 */}
      {[[52, 50], [58, 56], [46, 44]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.2 - i * 0.3} fill={c.accent} opacity="0.85" />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------
   12. STRIPE — 굵은 사선
   ------------------------------------------------------------ */

function Stripe({ c }: Pick<P, "c">) {
  return (
    <g transform="rotate(-22 50 70)" style={{ mixBlendMode: "multiply" }}>
      {Array.from({ length: 9 }, (_, i) => {
        const y = -34 + i * 24;
        const h = i % 3 === 0 ? 16 : i % 3 === 1 ? 7 : 3;
        const col = i % 3 === 0 ? c.accent : i % 3 === 1 ? c.soft : c.deep;
        return (
          <rect
            key={i}
            x="-40"
            y={y}
            width="190"
            height={h}
            rx={h / 2}
            fill={col}
            opacity={i % 3 === 0 ? 0.92 : 0.6}
          />
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------
   13. FRAME — 얇은 이중 테두리와 코너 오너먼트
   ------------------------------------------------------------ */

function Frame({ c }: Pick<P, "c">) {
  const corner = (x: number, y: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d="M0 12 C 0 5 5 0 12 0"
        fill="none"
        stroke={c.accent}
        strokeWidth="0.9"
        opacity="0.9"
      />
      <path
        d="M0 12 C 0 5 5 0 12 0"
        fill="none"
        stroke={c.accent}
        strokeWidth="0.5"
        opacity="0.5"
        transform="translate(3 3)"
      />
      {/* 작은 잎 장식 */}
      <path
        d="M6 6 C 10 3 14 4 16 6 C 13 8 9 8 6 6 Z"
        fill={c.accent}
        opacity="0.55"
      />
    </g>
  );
  return (
    <g>
      <rect
        x="9"
        y="11"
        width="82"
        height="118"
        fill="none"
        stroke={c.accent}
        strokeWidth="0.8"
        opacity="0.8"
      />
      <rect
        x="12.5"
        y="14.5"
        width="75"
        height="111"
        fill="none"
        stroke={c.accent}
        strokeWidth="0.4"
        opacity="0.45"
      />
      {corner(9, 11, 0)}
      {corner(91, 11, 90)}
      {corner(91, 129, 180)}
      {corner(9, 129, 270)}
      {/* 가운데 위아래 작은 마름모 */}
      {[11, 129].map((y) => (
        <path
          key={y}
          d={`M50 ${y - 2} L52 ${y} L50 ${y + 2} L48 ${y} Z`}
          fill={c.accent}
          opacity="0.8"
        />
      ))}

      {/* 액자 한가운데의 작은 가지 — 테두리만 있으면 빈 종이로 보입니다 */}
      <g transform="translate(50 54)">
        <path
          d="M0 18 V -12"
          stroke={c.accent}
          strokeWidth="0.7"
          opacity="0.7"
          strokeLinecap="round"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = 14 - i * 5.4;
          const left = i % 2 === 0;
          const s = (1 - i * 0.1) * 0.62;
          return (
            <path
              key={i}
              d="M0 0 C 5 -2.4 11 -1.2 14 0 C 11 1.2 5 2.4 0 0 Z"
              transform={`translate(0 ${y}) rotate(${left ? -152 : -28}) scale(${s})`}
              fill={c.accent}
              opacity="0.5"
            />
          );
        })}
        {/* 위쪽 작은 꽃 */}
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-16"
            rx="1.8"
            ry="3"
            fill={c.accent}
            opacity="0.6"
            transform={`rotate(${a} 0 -13)`}
          />
        ))}
        <circle cx="0" cy="-13" r="1.5" fill={c.deep} opacity="0.7" />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------
   14. WREATH — 둥근 잎 화환
   ------------------------------------------------------------ */

function Wreath({ c }: Pick<P, "c">) {
  const n = 26;
  const R = 31;
  const cx = 50;
  const cy = 62;
  return (
    <g style={{ mixBlendMode: "multiply" }}>
      {Array.from({ length: n }, (_, i) => {
        const a = -100 + (i / (n - 1)) * 340;
        const rad = (a * Math.PI) / 180;
        const x = cx + Math.cos(rad) * R;
        const y = cy + Math.sin(rad) * R;
        const s = i % 4 === 0 ? 1.15 : 0.9;
        return (
          <path
            key={i}
            d="M0 0 C 5 -2.4 11 -1.2 14 0 C 11 1.2 5 2.4 0 0 Z"
            transform={`translate(${x} ${y}) rotate(${a + 96}) scale(${s})`}
            fill={i % 4 === 0 ? c.accent : c.deep}
            opacity={i % 4 === 0 ? 0.8 : 0.4}
          />
        );
      })}
      {/* 매듭 — 고리 두 개와 늘어진 꼬리 두 가닥.
          삼각형 두 개로 두면 리본이 아니라 종이비행기로 보입니다. */}
      <path d="M50 92 C 43 85 34 88 36.5 94.5 C 39 100 47 96.5 50 92 Z" fill={c.accent} opacity="0.75" />
      <path d="M50 92 C 57 85 66 88 63.5 94.5 C 61 100 53 96.5 50 92 Z" fill={c.accent} opacity="0.75" />
      <path d="M49 94 C 45.5 101 43 108 43.5 112 C 47 108 49 100 50 95 Z" fill={c.accent} opacity="0.6" />
      <path d="M51 94 C 54.5 101 57 108 56.5 112 C 53 108 51 100 50 95 Z" fill={c.accent} opacity="0.6" />
      <circle cx="50" cy="92.5" r="2.1" fill={c.deep} opacity="0.75" />
    </g>
  );
}

/* ------------------------------------------------------------
   15. RIBBON — 매듭과 늘어진 띠
   ------------------------------------------------------------ */

function Ribbon({ c, id }: P) {
  return (
    <>
      <g style={{ mixBlendMode: "multiply" }}>
        {/* 세로로 지나는 띠 */}
        <rect x="41" y="-4" width="18" height="148" fill={c.soft} opacity="0.7" />
        {/* 가로 띠 */}
        <rect x="-4" y="56" width="108" height="18" fill={`url(#${id}-ink)`} opacity="0.9" />
        {/* 매듭 고리 두 개 */}
        <path
          d="M50 66 C 40 52 24 48 20 58 C 16 68 34 72 50 66 Z"
          fill={c.accent}
        />
        <path
          d="M50 66 C 60 52 76 48 80 58 C 84 68 66 72 50 66 Z"
          fill={c.accent}
        />
        <path
          d="M50 66 C 40 80 26 90 22 100 C 34 96 46 82 50 66 Z"
          fill={c.deep}
          opacity="0.8"
        />
        <path
          d="M50 66 C 60 80 74 90 78 100 C 66 96 54 82 50 66 Z"
          fill={c.deep}
          opacity="0.8"
        />
      </g>
      <circle cx="50" cy="66" r="5.5" fill={c.tint} />
      <circle cx="50" cy="66" r="2.4" fill={c.deep} opacity="0.7" />
    </>
  );
}

/* ------------------------------------------------------------
   16. WINDOW — 창 너머의 집
   ------------------------------------------------------------ */

function Window({ c, id }: P) {
  return (
    <>
      <defs>
        <clipPath id={`${id}-win`}>
          <path d="M26 116 V 54 a24 24 0 0 1 48 0 V 116 Z" />
        </clipPath>
        <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={c.tint} />
          <stop offset="100%" stopColor={c.accent} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* 창으로 새어 나오는 빛 */}
      <path
        d="M26 116 L4 140 L96 140 L74 116 Z"
        fill={c.accent}
        opacity="0.14"
        filter={`url(#${id}-soft)`}
      />

      <g clipPath={`url(#${id}-win)`}>
        <rect x="26" y="30" width="48" height="86" fill={`url(#${id}-warm)`} />
        {/* 안쪽에 놓인 화분 */}
        <path d="M40 116 V 104 h12 v12 z" fill={c.deep} opacity="0.5" />
        <path
          d="M46 104 C 40 96 40 88 44 84 C 48 88 48 98 46 104 Z"
          fill={c.deep}
          opacity="0.42"
        />
        <path
          d="M46 104 C 52 98 54 90 51 86 C 47 90 45 98 46 104 Z"
          fill={c.deep}
          opacity="0.32"
        />
      </g>

      {/* 창틀 */}
      <path
        d="M26 116 V 54 a24 24 0 0 1 48 0 V 116 Z"
        fill="none"
        stroke={c.deep}
        strokeWidth="2.2"
      />
      <path d="M50 32 V 116" stroke={c.deep} strokeWidth="1.6" />
      <path d="M26 78 H 74" stroke={c.deep} strokeWidth="1.6" />
      {/* 창턱 */}
      <path d="M18 116 H 82" stroke={c.deep} strokeWidth="2.6" strokeLinecap="round" />
    </>
  );
}

/* ------------------------------------------------------------ */

const ART: Record<ArtKind, (p: P) => React.ReactElement> = {
  bloom: Bloom,
  garden: Garden,
  arch: Arch,
  dune: Dune,
  terrazzo: Terrazzo,
  confetti: Confetti,
  balloon: Balloon,
  candle: Candle,
  night: Night,
  wave: Wave,
  sprig: Sprig,
  stripe: Stripe,
  frame: Frame,
  wreath: Wreath,
  ribbon: Ribbon,
  window: Window,
};

/**
 * 앞면 그림.
 *
 * 그라디언트·필터 id 는 문서 전체에서 하나뿐이어야 합니다. 목록에는
 * 카드가 수십 장 함께 그려지므로, 그림 종류와 주색으로 id 를 만듭니다.
 * 같은 그림·같은 색이면 정의 내용도 같아서 공유해도 무방합니다.
 */
export function CardArt({ art, palette }: { art: ArtKind; palette: Palette }) {
  const id = `a-${art}-${palette.accent.replace("#", "")}`;
  const Shape = ART[art];
  return (
    <svg
      className="cd-art"
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <Defs c={palette} id={id} />
      <Ground c={palette} id={id} />
      <Shape c={palette} id={id} />
    </svg>
  );
}
