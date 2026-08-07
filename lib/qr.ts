/* ============================================================
   최소 QR 인코더 (버전 자동 선택, 오류정정 레벨 L, 바이트 모드)
   외부 의존성 없이 청첩장 링크용 QR 을 SVG 로 만들기 위한 구현입니다.
   ============================================================ */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255]!;
})();

const gfMul = (a: number, b: number) =>
  a === 0 || b === 0 ? 0 : GF_EXP[(GF_LOG[a]! + GF_LOG[b]!) % 255]!;

function rsGenerator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j]!, 1);
      next[j + 1] ^= gfMul(poly[j]!, GF_EXP[i]!);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGenerator(ecLen);
  const res = new Array<number>(ecLen).fill(0);
  for (const byte of data) {
    const factor = byte ^ res[0]!;
    res.shift();
    res.push(0);
    for (let i = 0; i < ecLen; i++) res[i] ^= gfMul(gen[i + 1]!, factor);
  }
  return res;
}

/** 버전별 [총 코드워드, EC 코드워드/블록, 블록 수] — 레벨 L, 버전 1~10 */
const VERSIONS: [number, number, number][] = [
  [26, 7, 1], [44, 10, 1], [70, 15, 1], [100, 20, 1], [134, 26, 1],
  [172, 18, 2], [196, 20, 2], [242, 24, 2], [292, 30, 2], [346, 18, 4],
];

const ALIGN_POS: number[][] = [
  [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];

function pickVersion(byteLen: number): number {
  for (let v = 1; v <= 10; v++) {
    const [total, ecPerBlock, blocks] = VERSIONS[v - 1]!;
    const capacity = total - ecPerBlock * blocks;
    // 모드(4bit) + 길이(8 or 16bit) + 데이터
    const header = v < 10 ? 2 : 3;
    if (capacity >= byteLen + header) return v;
  }
  throw new Error("데이터가 너무 깁니다 (QR 버전 10 초과)");
}

export function buildQrSvg(text: string, scale = 8, quiet = 4): string {
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = pickVersion(bytes.length);
  const [totalCw, ecPerBlock, blockCount] = VERSIONS[version - 1]!;
  const dataCw = totalCw - ecPerBlock * blockCount;
  const size = 17 + version * 4;

  /* ---- 비트스트림 ---- */
  const bits: number[] = [];
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  push(0b0100, 4); // 바이트 모드
  push(bytes.length, version < 10 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  const capacityBits = dataCw * 8;
  push(0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const words: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let w = 0;
    for (let j = 0; j < 8; j++) w = (w << 1) | bits[i + j]!;
    words.push(w);
  }
  const PAD = [0xec, 0x11];
  let padIdx = 0;
  while (words.length < dataCw) words.push(PAD[padIdx++ % 2]!);

  /* ---- 블록 분할 + RS ---- */
  const shortLen = Math.floor(dataCw / blockCount);
  const longCount = dataCw % blockCount;
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let off = 0;
  for (let b = 0; b < blockCount; b++) {
    const len = shortLen + (b >= blockCount - longCount ? 1 : 0);
    const block = words.slice(off, off + len);
    off += len;
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }

  const interleaved: number[] = [];
  const maxData = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxData; i++)
    for (const b of dataBlocks) if (i < b.length) interleaved.push(b[i]!);
  for (let i = 0; i < ecPerBlock; i++)
    for (const b of ecBlocks) interleaved.push(b[i]!);

  /* ---- 모듈 배치 ---- */
  const mod: (0 | 1 | null)[][] = Array.from({ length: size }, () =>
    new Array<0 | 1 | null>(size).fill(null),
  );

  const setFinder = (r: number, c: number) => {
    for (let dr = -1; dr <= 7; dr++)
      for (let dc = -1; dc <= 7; dc++) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const inRing =
          (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
          (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6));
        const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        mod[rr]![cc] = inRing || inCore ? 1 : 0;
      }
  };
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    const v: 0 | 1 = i % 2 === 0 ? 1 : 0;
    mod[6]![i] = v;
    mod[i]![6] = v;
  }

  for (const r of ALIGN_POS[version]!)
    for (const c of ALIGN_POS[version]!) {
      if ((r < 8 && c < 8) || (r < 8 && c > size - 9) || (r > size - 9 && c < 8))
        continue;
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++)
          mod[r + dr]![c + dc] =
            Math.max(Math.abs(dr), Math.abs(dc)) !== 1 ? 1 : 0;
    }

  mod[size - 8]![8] = 1; // 다크 모듈

  // 포맷 정보 자리 예약
  const reserve = (r: number, c: number) => {
    if (mod[r]![c] === null) mod[r]![c] = 0;
  };
  for (let i = 0; i < 9; i++) {
    reserve(8, i);
    reserve(i, 8);
  }
  for (let i = 0; i < 8; i++) {
    reserve(8, size - 1 - i);
    reserve(size - 1 - i, 8);
  }

  const isFunction: boolean[][] = mod.map((row) => row.map((v) => v !== null));

  /* ---- 데이터 배치 (지그재그) + 마스크 0 ---- */
  const maskFn = (r: number, c: number) => (r + c) % 2 === 0;
  let bitIdx = 0;
  const dataBits: number[] = [];
  for (const w of interleaved) for (let i = 7; i >= 0; i--) dataBits.push((w >> i) & 1);

  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let n = 0; n < size; n++) {
      const row = upward ? size - 1 - n : n;
      for (const c of [col, col - 1]) {
        if (isFunction[row]![c]) continue;
        let bit = bitIdx < dataBits.length ? dataBits[bitIdx]! : 0;
        bitIdx++;
        if (maskFn(row, c)) bit ^= 1;
        mod[row]![c] = bit as 0 | 1;
      }
    }
    upward = !upward;
  }

  /* ---- 포맷 정보 (레벨 L = 01, 마스크 000) ---- */
  const fmtData = 0b01000;
  let rem = fmtData;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >> 9) * 0b10100110111);
  }
  const fmt = ((fmtData << 10) | rem) ^ 0b101010000010010;
  const fmtBit = (i: number) => ((fmt >> i) & 1) as 0 | 1;

  for (let i = 0; i <= 5; i++) mod[8]![i] = fmtBit(i);
  mod[8]![7] = fmtBit(6);
  mod[8]![8] = fmtBit(7);
  mod[7]![8] = fmtBit(8);
  for (let i = 9; i <= 14; i++) mod[14 - i]![8] = fmtBit(i);
  for (let i = 0; i <= 7; i++) mod[size - 1 - i]![8] = fmtBit(i);
  for (let i = 8; i <= 14; i++) mod[8]![size - 15 + i] = fmtBit(i);

  /* ---- SVG ---- */
  const dim = (size + quiet * 2) * scale;
  let path = "";
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (mod[r]![c] === 1)
        path += `M${(c + quiet) * scale} ${(r + quiet) * scale}h${scale}v${scale}h-${scale}z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges"><rect width="${dim}" height="${dim}" fill="#FDFBF7"/><path d="${path}" fill="#2E2A27"/></svg>`;
}
