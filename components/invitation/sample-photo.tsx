/**
 * 사진을 올리기 전에 채워 넣는 샘플 사진.
 *
 * 예전에는 인라인 SVG 로 사람 실루엣을 그렸는데, 청첩장 미리보기의 인상은
 * 결국 사진이 만들기 때문에 실제 웨딩 사진으로 바꿨습니다.
 * (public/samples — Pexels 라이선스: 상업적 이용·수정 가능, 출처 표기 불필요)
 *
 * 슬롯마다 seed 를 다르게 주면 한 청첩장 안에서 같은 사진이 반복되지 않습니다.
 */

import { asset } from "@/lib/asset";

export const SAMPLE_COUNT = 22;

/** seed 번째 샘플 사진의 URL */
export function samplePhoto(seed: number): string {
  const i = ((seed % SAMPLE_COUNT) + SAMPLE_COUNT) % SAMPLE_COUNT;
  return asset(`/samples/couple-${String(i + 1).padStart(2, "0")}.jpg`);
}

export function SamplePhoto({
  seed,
  fit = "cover",
}: {
  seed: number;
  fit?: "cover" | "contain";
}) {
  return (
    // 정적 파일이라 next/image 최적화 대상이 아닙니다 (export 빌드에서 unoptimized).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="iv-sample"
      src={samplePhoto(seed)}
      alt=""
      loading="lazy"
      decoding="async"
      style={{ objectFit: fit }}
    />
  );
}
