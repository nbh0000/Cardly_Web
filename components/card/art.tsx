/* ============================================================
   카드 앞면 그림 열두 가지

   전부 여기서 SVG 로 그립니다. 남의 일러스트를 가져다 쓰면 상업적
   이용 조건을 지킬 수 없고, 스톡 사진을 깔면 초대장이 아니라 배너가
   됩니다.

   그림은 100×140 좌표계 안에서 그리고(카드 비율 5:7), 바깥에서
   preserveAspectRatio 로 면을 채웁니다. 색은 팔레트에서만 받습니다 —
   같은 그림이 색만 바꿔도 전혀 다른 카드가 됩니다.
   ============================================================ */

import type { ArtKind, Palette } from "@/lib/card/types";

type P = { c: Palette };

/* ---------- 1. 꽃다발 ---------- */
function Bouquet({ c }: P) {
  const stems = [
    [50, 96, 34, 44], [50, 96, 50, 34], [50, 96, 66, 44],
    [50, 96, 40, 58], [50, 96, 60, 58],
  ];
  const blooms = [
    [34, 44, 9], [50, 34, 11], [66, 44, 9], [40, 58, 7.5], [60, 58, 7.5],
  ];
  return (
    <>
      {stems.map(([x1, y1, x2, y2], i) => (
        <path key={i} d={`M${x1} ${y1} Q${(x1 + x2) / 2 + (i - 2) * 3} ${(y1 + y2) / 2} ${x2} ${y2}`}
          stroke={c.deep} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ))}
      {/* 잎 */}
      {[[42, 74, -28], [58, 78, 28], [46, 86, -20]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="7" ry="3" fill={c.deep} opacity="0.5"
          transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {blooms.map(([x, y, r], i) => (
        <g key={i}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx={x} cy={y - r * 0.62} rx={r * 0.42} ry={r * 0.62}
              fill={i % 2 ? c.soft : c.accent}
              transform={`rotate(${a} ${x} ${y})`} />
          ))}
          <circle cx={x} cy={y} r={r * 0.3} fill={i % 2 ? c.accent : c.deep} />
        </g>
      ))}
      {/* 묶은 끈 */}
      <path d="M42 92 Q50 88 58 92" stroke={c.accent} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  );
}

/* ---------- 2. 풍선 다발 ---------- */
function Balloons({ c }: P) {
  const set = [
    [30, 40, 11, c.accent], [50, 30, 13, c.soft], [70, 42, 11, c.deep],
    [40, 58, 8.5, c.soft], [62, 60, 8.5, c.accent],
  ] as const;
  return (
    <>
      {set.map(([x, y, r], i) => (
        <path key={`s${i}`} d={`M${x} ${y + r * 1.28} Q${x + (i % 2 ? 6 : -6)} ${(y + 104) / 2} 50 104`}
          stroke={c.deep} strokeWidth="0.8" fill="none" opacity="0.55" />
      ))}
      {set.map(([x, y, r, fill], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 1.18} fill={fill} />
          <ellipse cx={x - r * 0.32} cy={y - r * 0.38} rx={r * 0.22} ry={r * 0.3}
            fill={c.paper} opacity="0.45" />
          <path d={`M${x - 1.6} ${y + r * 1.16} l1.6 2.4 1.6-2.4 z`} fill={fill} />
        </g>
      ))}
      <circle cx="50" cy="104" r="2" fill={c.deep} />
    </>
  );
}

/* ---------- 3. 케이크와 촛불 ---------- */
function Cake({ c }: P) {
  return (
    <>
      {/* 접시 */}
      <ellipse cx="50" cy="100" rx="34" ry="4" fill={c.deep} opacity="0.25" />
      {/* 아래 단 */}
      <rect x="24" y="76" width="52" height="22" rx="3" fill={c.accent} />
      {/* 윗 단 */}
      <rect x="32" y="58" width="36" height="20" rx="3" fill={c.soft} />
      {/* 크림 흘러내림 */}
      <path d="M24 78 q6 7 12 0 q6 7 12 0 q6 7 12 0 q6 7 12 0 l0-4 -48 0 z" fill={c.paper} opacity="0.9" />
      <path d="M32 60 q4.5 6 9 0 q4.5 6 9 0 q4.5 6 9 0 q4.5 6 9 0 l0-4 -36 0 z" fill={c.paper} opacity="0.9" />
      {/* 초 */}
      {[42, 50, 58].map((x, i) => (
        <g key={x}>
          <rect x={x - 1.4} y="44" width="2.8" height="14" rx="1" fill={i === 1 ? c.deep : c.accent} />
          <path d={`M${x} 36 q3.4 4 0 7.4 q-3.4-3.4 0-7.4 z`} fill={c.accent} />
          <path d={`M${x} 38.5 q1.7 2.2 0 4 q-1.7-1.8 0-4 z`} fill={c.paper} opacity="0.75" />
        </g>
      ))}
    </>
  );
}

/* ---------- 4. 집과 창 ---------- */
function Home({ c }: P) {
  return (
    <>
      <path d="M20 62 L50 34 L80 62 Z" fill={c.accent} />
      <rect x="27" y="60" width="46" height="42" fill={c.soft} />
      {/* 창 */}
      <rect x="35" y="68" width="14" height="14" fill={c.paper} />
      <path d="M42 68v14M35 75h14" stroke={c.deep} strokeWidth="1" />
      {/* 문 */}
      <path d="M55 102V80a6 6 0 0 1 12 0v22z" fill={c.deep} />
      <circle cx="64" cy="91" r="1.1" fill={c.paper} />
      {/* 굴뚝과 연기 */}
      <rect x="63" y="40" width="7" height="12" fill={c.deep} />
      <path d="M66.5 36 q4-3 0-6 q-4-3 0-6" stroke={c.deep} strokeWidth="1.2" fill="none"
        opacity="0.5" strokeLinecap="round" />
      {/* 바닥선 */}
      <path d="M12 102h76" stroke={c.deep} strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

/* ---------- 5. 쏟아지는 색종이 ---------- */
const CONFETTI = [
  [16, 22, -24, 0], [32, 12, 38, 1], [48, 26, -8, 2], [64, 14, 22, 0],
  [80, 24, -34, 1], [24, 44, 12, 2], [44, 50, -20, 0], [60, 42, 30, 1],
  [76, 52, -12, 2], [14, 64, 26, 0], [34, 72, -30, 1], [52, 68, 14, 2],
  [70, 76, -22, 0], [86, 66, 34, 1], [26, 90, -14, 2], [46, 96, 20, 0],
  [66, 92, -28, 1], [84, 100, 10, 2],
] as const;

function Confetti({ c }: P) {
  const fills = [c.accent, c.soft, c.deep];
  return (
    <>
      {CONFETTI.map(([x, y, r, v], i) => {
        const fill = fills[v]!;
        if (v === 1)
          return <circle key={i} cx={x} cy={y} r="2.4" fill={fill} />;
        if (v === 2)
          return (
            <rect key={i} x={x} y={y} width="9" height="1.6" rx="0.8" fill={fill}
              transform={`rotate(${r} ${x} ${y})`} />
          );
        return (
          <rect key={i} x={x} y={y} width="4" height="8" rx="1" fill={fill}
            transform={`rotate(${r} ${x} ${y})`} />
        );
      })}
    </>
  );
}

/* ---------- 6. 아치 너머의 해 ---------- */
function Arch({ c }: P) {
  return (
    <>
      <path d="M24 100V56a26 26 0 0 1 52 0v44z" fill={c.soft} />
      <circle cx="50" cy="60" r="16" fill={c.accent} />
      {/* 해 아래로 지나가는 선 */}
      {[70, 76, 82].map((y, i) => (
        <path key={y} d={`M${28 + i * 3} ${y}h${44 - i * 6}`} stroke={c.deep}
          strokeWidth="1.2" opacity={0.5 - i * 0.12} strokeLinecap="round" />
      ))}
      <path d="M24 100V56a26 26 0 0 1 52 0v44" fill="none" stroke={c.deep} strokeWidth="1.6" />
    </>
  );
}

/* ---------- 7. 밤 강과 달 ---------- */
function Night({ c }: P) {
  return (
    <>
      <circle cx="68" cy="34" r="13" fill={c.accent} />
      <circle cx="62" cy="30" r="11" fill={c.paper} />
      {[[24, 22], [36, 40], [18, 52], [46, 18], [84, 56], [30, 62]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1 : 1.6} fill={c.accent} opacity="0.8" />
      ))}
      {/* 물 */}
      <path d="M0 86h100v54H0z" fill={c.soft} />
      {[90, 98, 106, 114].map((y, i) => (
        <path key={y} d={`M${6 + i * 4} ${y} q10-3 20 0 t20 0 t20 0 t20 0`} stroke={c.accent}
          strokeWidth="1.2" fill="none" opacity={0.7 - i * 0.13} strokeLinecap="round" />
      ))}
      {/* 달빛 반사 */}
      <path d="M62 86 q4 14 0 28" stroke={c.accent} strokeWidth="2.4" fill="none" opacity="0.4" />
    </>
  );
}

/* ---------- 8. 굵은 사선 띠 ---------- */
function Stripe({ c }: P) {
  return (
    <>
      {[-30, 0, 30, 60, 90, 120].map((y, i) => (
        <rect key={y} x="-30" y={y} width="180" height="14" fill={i % 2 ? c.soft : c.accent}
          opacity={i % 2 ? 0.75 : 1} transform="rotate(-24 50 70)" />
      ))}
      <rect x="18" y="52" width="64" height="36" fill={c.paper} opacity="0.94" />
      <rect x="18" y="52" width="64" height="36" fill="none" stroke={c.deep} strokeWidth="1.2" />
    </>
  );
}

/* ---------- 9. 잎 화환 ---------- */
function Wreath({ c }: P) {
  const leaves = Array.from({ length: 22 }, (_, i) => {
    const a = -95 + (i / 21) * 350;
    const rad = (a * Math.PI) / 180;
    return { x: 50 + Math.cos(rad) * 30, y: 66 + Math.sin(rad) * 30, a: a + 90 };
  });
  return (
    <>
      <circle cx="50" cy="66" r="30" fill="none" stroke={c.deep} strokeWidth="0.8" opacity="0.35" />
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx="3" ry="7"
          fill={i % 3 === 0 ? c.accent : c.soft}
          transform={`rotate(${l.a} ${l.x} ${l.y})`} />
      ))}
      {[[50, 36], [38, 40], [62, 40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 3.4 : 2.2} fill={c.accent} />
      ))}
    </>
  );
}

/* ---------- 10. 별과 궤적 ---------- */
function Stars({ c }: P) {
  const pts = [
    [26, 30], [44, 20], [62, 34], [78, 24], [34, 52], [54, 58],
    [72, 52], [22, 74], [46, 84], [68, 78], [84, 62], [36, 96],
  ] as const;
  const star = (x: number, y: number, r: number) =>
    `M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z`;
  return (
    <>
      <path d="M26 30 L44 20 L62 34 L78 24" stroke={c.soft} strokeWidth="0.8" fill="none" />
      <path d="M34 52 L54 58 L72 52 L84 62" stroke={c.soft} strokeWidth="0.8" fill="none" />
      <path d="M22 74 L46 84 L68 78" stroke={c.soft} strokeWidth="0.8" fill="none" />
      {pts.map(([x, y], i) => (
        <path key={i} d={star(x, y, i % 3 === 0 ? 5.5 : 3)}
          fill={i % 3 === 0 ? c.accent : c.soft} />
      ))}
    </>
  );
}

/* ---------- 11. 리본 매듭 ---------- */
function Ribbon({ c }: P) {
  return (
    <>
      {/* 가로 띠 */}
      <rect x="0" y="58" width="100" height="16" fill={c.accent} />
      {/* 세로 띠 */}
      <rect x="42" y="0" width="16" height="140" fill={c.accent} opacity="0.55" />
      {/* 매듭 */}
      <path d="M50 66 L26 50 q-6 16 0 32 z" fill={c.deep} />
      <path d="M50 66 L74 50 q6 16 0 32 z" fill={c.deep} />
      <circle cx="50" cy="66" r="6.5" fill={c.soft} />
      <circle cx="50" cy="66" r="3" fill={c.accent} />
      {/* 늘어진 끝 */}
      <path d="M46 72 L38 96 l8-4 8 4 -8-24z" fill={c.deep} opacity="0.85" />
    </>
  );
}

/* ---------- 12. 산으로 난 길 ---------- */
function Path({ c }: P) {
  return (
    <>
      <circle cx="70" cy="30" r="11" fill={c.accent} opacity="0.8" />
      <path d="M0 78 L28 44 L48 72 L66 50 L100 92 L100 140 L0 140 Z" fill={c.soft} />
      <path d="M0 96 L26 62 L46 84 L70 58 L100 104 L100 140 L0 140 Z" fill={c.deep} opacity="0.75" />
      {/* 길 */}
      <path d="M50 140 Q46 116 56 100 Q66 86 58 70" stroke={c.paper} strokeWidth="4"
        fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M50 140 Q46 116 56 100 Q66 86 58 70" stroke={c.accent} strokeWidth="1"
        fill="none" strokeDasharray="3 5" strokeLinecap="round" />
    </>
  );
}

const ART: Record<ArtKind, (p: P) => React.ReactElement> = {
  bouquet: Bouquet,
  balloons: Balloons,
  cake: Cake,
  home: Home,
  confetti: Confetti,
  arch: Arch,
  night: Night,
  stripe: Stripe,
  wreath: Wreath,
  stars: Stars,
  ribbon: Ribbon,
  path: Path,
};

/**
 * 앞면 그림.
 *
 * 카드 면을 꽉 채우되 비율은 지킵니다(slice). 세로로 긴 면이든 짧은
 * 면이든 그림이 늘어지지 않습니다.
 */
export function CardArt({ art, palette }: { art: ArtKind; palette: Palette }) {
  const Shape = ART[art];
  return (
    <svg
      className="cd-art"
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="100" height="140" fill={palette.paper} />
      <Shape c={palette} />
    </svg>
  );
}
