"use client";

/**
 * 올린 사진 들이기.
 *
 * 요즘 휴대폰 사진은 한 장에 4~8MB 입니다. 그대로 들고 있으면 문서가 금세
 * 수십 MB 가 되고, 자동 저장이 실패하고, 편집기가 무거워집니다. 그래서
 * 들일 때 한 번 줄입니다.
 *
 * 얼마나 줄일지는 인쇄에서 거꾸로 계산합니다. 300dpi 에서 3000픽셀은
 * 254mm — A4 폭보다 넓습니다. 그보다 큰 원본은 인쇄물에 쓸 때 어차피
 * 남아돕니다.
 *
 * 로그인해 있으면 저장소로 올리고 주소만 들고 옵니다. 아니면 문서 안에
 * data URL 로 넣습니다 — 계정 없이도 만들어 볼 수 있어야 하기 때문입니다.
 */

import { signedIn } from "@/lib/backend/client";
import { uploadOne } from "@/lib/backend/photos";

const MAX_EDGE = 3000;

export interface LoadedImage {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export async function loadImageFile(file: File): Promise<LoadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("사진 파일만 넣을 수 있습니다.");
  }

  const { blob, width, height } = await shrink(file);

  if (signedIn()) {
    try {
      const url = await uploadOne(blob, "print");
      return { src: url, naturalWidth: width, naturalHeight: height };
    } catch {
      // 올리기에 실패해도 편집은 이어져야 합니다
    }
  }

  return { src: await toDataUrl(blob), naturalWidth: width, naturalHeight: height };
}

async function shrink(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => {
      URL.revokeObjectURL(url);
      resolve(el);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("사진을 읽지 못했습니다."));
    };
    el.src = url;
  });

  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (longest <= MAX_EDGE && file.size < 2_000_000) {
    return { blob: file, width: img.naturalWidth, height: img.naturalHeight };
  }

  const k = Math.min(1, MAX_EDGE / longest);
  const w = Math.round(img.naturalWidth * k);
  const h = Math.round(img.naturalHeight * k);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);

  // 투명한 부분이 있는 그림(PNG)은 JPEG 로 바꾸면 검게 됩니다
  const type = file.type.includes("png") ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("사진을 줄이지 못했습니다."))), type, 0.92),
  );
  return { blob, width: w, height: h };
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("사진을 읽지 못했습니다."));
    reader.readAsDataURL(blob);
  });
}

/** 사진 크기를 재 둡니다 — 인쇄 해상도 경고에 씁니다 */
export function measure(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = src;
  });
}
