"use client";

/**
 * 편집기의 내용을 "발행용 파일" 하나로 내보냅니다.
 *
 * 편집기 안의 사진은 blob: URL 이라 그 탭을 닫는 순간 사라집니다. 그래서
 * 내보낼 때 모든 사진을 실제 픽셀로 읽어 data URL 로 바꿔 파일에 담습니다.
 * 그 파일을 `npm run invite:add` 로 넘기면 사진은 public/ 아래 파일로,
 * 나머지 내용은 content/invitations.json 항목으로 갈라져 들어갑니다.
 */

import type { InvitationData } from "@/lib/invitation";

export interface InvitationExport {
  slug: string;
  templateId: string;
  updatedAt: string;
  data: InvitationData;
}

/** blob:/http 사진을 지정 폭까지 줄여 JPEG data URL 로 만듭니다. */
async function toDataUrl(src: string, maxW = 1400): Promise<string> {
  if (!src || src.startsWith("data:")) return src;
  // 이미 발행된 청첩장을 다시 편집하는 경우 — 경로는 그대로 둡니다.
  if (src.startsWith("/")) return src;

  const res = await fetch(src);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

async function maybe(src?: string): Promise<string | undefined> {
  return src ? await toDataUrl(src) : undefined;
}

/** 청첩장 안의 모든 사진을 파일에 담을 수 있는 형태로 바꿉니다. */
export async function inlinePhotos(d: InvitationData): Promise<InvitationData> {
  const [coverPhoto, shareImage, groomPhoto, bridePhoto, videoThumb] =
    await Promise.all([
      maybe(d.coverPhoto),
      maybe(d.shareImage),
      maybe(d.groomPhoto),
      maybe(d.bridePhoto),
      maybe(d.videoThumb),
    ]);

  const gallery = await Promise.all(d.gallery.map((g) => toDataUrl(g)));
  const notices = await Promise.all(
    d.notices.map(async (n) => ({ ...n, photo: await maybe(n.photo) })),
  );
  const timeline = await Promise.all(
    d.timeline.map(async (t) => ({ ...t, photo: await maybe(t.photo) })),
  );
  const albumPages = await Promise.all(
    d.albumPages.map(async (p) => ({
      ...p,
      photos: await Promise.all(p.photos.map((s) => toDataUrl(s))),
    })),
  );

  return {
    ...d,
    coverPhoto,
    shareImage,
    groomPhoto,
    bridePhoto,
    videoThumb,
    gallery,
    notices,
    timeline,
    albumPages,
  };
}

/** 신랑·신부 이름에서 주소에 쓸 이름을 만듭니다. 한글이면 날짜로 대신합니다. */
export function suggestSlug(d: InvitationData): string {
  const en = [d.groomEnglish, d.brideEnglish]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return en || `wedding-${d.date.replace(/-/g, "")}`;
}

export async function buildExport(
  data: InvitationData,
  slug: string,
): Promise<InvitationExport> {
  return {
    slug,
    templateId: data.templateId,
    updatedAt: new Date().toISOString(),
    data: await inlinePhotos(data),
  };
}

export function downloadExport(payload: InvitationExport): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `${payload.slug}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}
