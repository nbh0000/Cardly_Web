/**
 * 사진을 넣기 전에 보이는 기본 이미지.
 *
 * 외부 파일을 받지 않고 인라인 SVG 로 그리기 때문에 오프라인·정적 배포에서도
 * 그대로 뜨고, `--iv-*` 테마 변수를 참조하므로 템플릿 색이 바뀌면 같이 바뀝니다.
 * 사용자가 사진을 올리면 이 자리를 그 사진이 대신합니다.
 */

export type PhotoVariant =
  | "couple" /* 노을 아래 두 사람 */
  | "arch" /* 플라워 아치 */
  | "bouquet" /* 부케 정물 */
  | "rings" /* 반지와 보케 */
  | "portrait" /* 나란한 상반신 */
  | "field"; /* 들판과 나뭇잎 프레임 */

const A = "var(--iv-accent)";
const SUB = "var(--iv-sub)";
const BG = "var(--iv-bg)";

export function DefaultPhoto({ variant = "couple" }: { variant?: PhotoVariant }) {
  return (
    <svg
      className="iv-defaultphoto"
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="기본 이미지 — 사진을 등록하면 바뀝니다"
    >
      <defs>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BG} />
          <stop offset="55%" stopColor={SUB} />
          <stop offset="100%" stopColor={A} stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`glow-${variant}`} cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor={BG} stopOpacity="0.95" />
          <stop offset="100%" stopColor={BG} stopOpacity="0" />
        </radialGradient>
        <filter id={`grain-${variant}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.055" />
          </feComponentTransfer>
          <feComposite operator="over" in2="SourceGraphic" />
        </filter>
      </defs>

      <rect width="300" height="400" fill={`url(#sky-${variant})`} />
      <rect width="300" height="400" fill={`url(#glow-${variant})`} />

      {variant === "couple" && <Couple />}
      {variant === "arch" && <Arch />}
      {variant === "bouquet" && <Bouquet />}
      {variant === "rings" && <Rings />}
      {variant === "portrait" && <Portrait />}
      {variant === "field" && <Field />}

      {/* 필름 그레인 — 밋밋한 면을 사진처럼 보이게 합니다 */}
      <rect width="300" height="400" filter={`url(#grain-${variant})`} opacity="0.5" />
    </svg>
  );
}

/* ---------------- 변주 ---------------- */

function Couple() {
  return (
    <g>
      <circle cx="150" cy="132" r="46" fill={BG} opacity="0.55" />
      {/* 지평선 */}
      <path d="M0 300h300v100H0z" fill={A} opacity="0.22" />
      <path d="M0 300c60-14 110 10 150 4s90-24 150-10v106H0z" fill={A} opacity="0.3" />
      {/* 두 사람 */}
      <g fill={A} opacity="0.92">
        <circle cx="126" cy="228" r="16" />
        <path d="M104 400c0-32 10-56 22-56s22 24 22 56z" />
        <circle cx="176" cy="234" r="15" />
        <path d="M156 400c0-30 9-52 20-52 12 0 22 22 24 52z" />
        {/* 드레스 자락 */}
        <path d="M152 400c2-30 12-52 24-52 13 0 24 24 26 52z" opacity="0.75" />
      </g>
      {/* 보케 */}
      <g fill={BG} opacity="0.5">
        <circle cx="58" cy="96" r="9" />
        <circle cx="242" cy="76" r="6" />
        <circle cx="86" cy="52" r="4" />
        <circle cx="214" cy="140" r="5" />
      </g>
    </g>
  );
}

function Arch() {
  return (
    <g>
      <path
        d="M78 400V196a72 72 0 0 1 144 0v204"
        fill={BG}
        opacity="0.7"
        stroke={A}
        strokeWidth="2"
      />
      {/* 덩굴 */}
      <g stroke={A} strokeWidth="2" fill="none" opacity="0.85" strokeLinecap="round">
        <path d="M78 250c14-10 14-30 0-40M78 300c16-10 16-30 0-40" />
        <path d="M222 250c-14-10-14-30 0-40M222 300c-16-10-16-30 0-40" />
        <path d="M110 168c-10-14-4-30 8-34M190 168c10-14 4-30-8-34" />
      </g>
      <g fill={A} opacity="0.75">
        {[
          [92, 214], [110, 178], [150, 150], [190, 178], [208, 214],
          [86, 268], [214, 268], [92, 320], [208, 320],
        ].map(([x, y], i) => (
          <Blossom key={i} x={x!} y={y!} r={i % 3 === 0 ? 9 : 6} />
        ))}
      </g>
    </g>
  );
}

function Blossom({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy={-r * 0.7}
          rx={r * 0.42}
          ry={r * 0.7}
          transform={`rotate(${deg})`}
        />
      ))}
      <circle r={r * 0.3} fill={BG} />
    </g>
  );
}

function Bouquet() {
  return (
    <g>
      <ellipse cx="150" cy="372" rx="86" ry="12" fill={A} opacity="0.18" />
      {/* 화병 */}
      <path d="M118 268h64l-10 96a12 12 0 0 1-12 10h-20a12 12 0 0 1-12-10z" fill={BG} opacity="0.85" stroke={A} strokeWidth="2" />
      {/* 줄기 */}
      <g stroke={A} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8">
        <path d="M150 268V150M150 214c-22-8-34-28-32-50M150 232c24-10 36-30 34-52M150 190c-16-6-24-20-22-36M150 200c18-8 26-22 24-38" />
      </g>
      <g fill={A} opacity="0.8">
        <Blossom x={150} y={140} r={16} />
        <Blossom x={116} y={162} r={11} />
        <Blossom x={184} y={168} r={12} />
        <Blossom x={128} y={116} r={8} />
        <Blossom x={176} y={112} r={9} />
      </g>
      <g fill={A} opacity="0.4">
        <ellipse cx="104" cy="196" rx="14" ry="6" transform="rotate(-28 104 196)" />
        <ellipse cx="196" cy="204" rx="14" ry="6" transform="rotate(26 196 204)" />
      </g>
    </g>
  );
}

function Rings() {
  return (
    <g>
      <g fill={BG} opacity="0.45">
        <circle cx="62" cy="88" r="22" />
        <circle cx="238" cy="120" r="16" />
        <circle cx="96" cy="330" r="26" />
        <circle cx="228" cy="316" r="14" />
        <circle cx="150" cy="60" r="10" />
      </g>
      <g fill="none" stroke={A} strokeWidth="6" opacity="0.9">
        <circle cx="128" cy="200" r="42" />
        <circle cx="180" cy="216" r="42" />
      </g>
      <path d="M128 152l6 12h-12z" fill={A} />
      <g fill={BG} opacity="0.7">
        <circle cx="128" cy="158" r="4" />
      </g>
    </g>
  );
}

function Portrait() {
  return (
    <g>
      <rect x="26" y="60" width="112" height="280" rx="56" fill={BG} opacity="0.55" />
      <rect x="162" y="60" width="112" height="280" rx="56" fill={BG} opacity="0.4" />
      <g fill={A} opacity="0.9">
        <circle cx="82" cy="176" r="30" />
        <path d="M34 340c0-42 22-72 48-72s48 30 48 72z" />
        <circle cx="218" cy="182" r="28" />
        <path d="M172 340c0-40 20-68 46-68s46 28 46 68z" opacity="0.85" />
      </g>
      {/* 베일 */}
      <path d="M190 154c0-16 12-28 28-28s28 12 28 28c0 40-8 74-28 94-20-20-28-54-28-94z" fill={BG} opacity="0.35" />
    </g>
  );
}

function Field() {
  return (
    <g>
      <path d="M0 288c50-20 96 6 150 0s100-26 150-6v118H0z" fill={A} opacity="0.28" />
      <path d="M0 330c56-16 100 8 150 2s96-20 150-4v72H0z" fill={A} opacity="0.4" />
      <circle cx="150" cy="126" r="34" fill={BG} opacity="0.8" />
      {/* 나뭇잎 프레임 */}
      <g stroke={A} strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round">
        <path d="M-4 40c40 6 66 30 74 66M304 40c-40 6-66 30-74 66" />
      </g>
      <g fill={A} opacity="0.55">
        {[[14, 46], [34, 62], [54, 82], [70, 106], [286, 46], [266, 62], [246, 82], [230, 106]].map(
          ([x, y], i) => (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="13"
              ry="6"
              transform={`rotate(${i < 4 ? -34 : 34} ${x} ${y})`}
            />
          ),
        )}
      </g>
    </g>
  );
}

/** 슬롯 인덱스로 변주를 고르게 섞습니다. */
const ORDER: PhotoVariant[] = ["couple", "arch", "bouquet", "portrait", "field", "rings"];
export function variantFor(seed: number): PhotoVariant {
  return ORDER[((seed % ORDER.length) + ORDER.length) % ORDER.length]!;
}
