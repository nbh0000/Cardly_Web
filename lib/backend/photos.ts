"use client";

/**
 * 사진을 계정에 붙입니다.
 *
 * 편집기 안의 사진은 blob: 주소입니다 — 브라우저가 이 탭에서만 알아보는
 * 임시 이름이라, 탭을 닫으면 죽고 다른 기기에서는 애초에 존재하지 않습니다.
 * 그래서 저장·발행하는 순간 실제 파일을 저장소로 올리고, 그 자리에 진짜
 * 주소를 넣어 줍니다.
 *
 * 어느 칸이 사진인지 일일이 적지 않고 값 전체를 훑습니다. 청첩장 자료형에는
 * 사진 칸이 열 군데 가까이 있고(커버·공유·신랑·신부·갤러리·공지·타임라인·
 * 미니앨범…), 앞으로 더 늘어납니다. 칸 이름을 적어 두면 새 칸이 생길 때마다
 * 조용히 빠뜨리게 됩니다.
 */

import { deletePhoto, publicPhotoUrl, uploadPhoto, currentSession } from "@/lib/backend/client";

/** 올려야 하는 임시 주소인지 */
function isLocal(value: string): boolean {
  return value.startsWith("blob:") || value.startsWith("data:image");
}

/** 우리 저장소의 사진인지 */
export function isStoredPhoto(value: string): boolean {
  return value.includes("/storage/v1/object/public/photos/");
}

function extensionOf(type: string): string {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  return "jpg";
}

/** 사진 한 장 올리고 공개 주소를 돌려줍니다 */
export async function uploadOne(blob: Blob, docId: string): Promise<string> {
  const session = currentSession();
  if (!session) throw new Error("로그인이 필요합니다.");

  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${session.user.id}/${docId}/${name}.${extensionOf(blob.type)}`;
  return uploadPhoto(blob, path);
}

/**
 * 값 안의 임시 사진을 전부 올리고, 올린 주소로 바꾼 사본을 돌려줍니다.
 *
 * 같은 사진이 여러 칸에 쓰이면(커버 사진을 공유 이미지로도 쓰는 경우가
 * 흔합니다) 한 번만 올립니다.
 */
export async function materializePhotos<T>(
  value: T,
  docId: string,
  onProgress?: (done: number, total: number) => void,
): Promise<T> {
  const found = new Set<string>();
  collect(value, found);
  const targets = [...found];
  if (targets.length === 0) return value;

  const mapping = new Map<string, string>();
  let done = 0;
  for (const src of targets) {
    try {
      const blob = await (await fetch(src)).blob();
      mapping.set(src, await uploadOne(blob, docId));
    } catch {
      // 죽은 blob: 주소입니다. 그 칸은 비워 둡니다 — 깨진 사진을 하객에게
      // 보여 주는 것보다 낫습니다.
      mapping.set(src, "");
    }
    onProgress?.(++done, targets.length);
  }

  return replace(value, mapping) as T;
}

function collect(value: unknown, out: Set<string>): void {
  if (typeof value === "string") {
    if (isLocal(value)) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collect(v, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) collect(v, out);
  }
}

function replace(value: unknown, mapping: Map<string, string>): unknown {
  if (typeof value === "string") {
    const next = mapping.get(value);
    return next === undefined ? value : next;
  }
  if (Array.isArray(value)) {
    // 올리지 못해 빈 문자열이 된 사진은 목록에서 아예 뺍니다.
    return value.map((v) => replace(v, mapping)).filter((v) => v !== "");
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const next = replace(v, mapping);
      out[k] = next === "" && typeof v === "string" && isLocal(v) ? undefined : next;
    }
    return out;
  }
  return value;
}

/** 저장소 주소에서 파일 경로만 — 지울 때 씁니다 */
export function pathOf(url: string): string | null {
  const marker = "/storage/v1/object/public/photos/";
  const at = url.indexOf(marker);
  return at === -1 ? null : url.slice(at + marker.length);
}

/** 문서에서 빠진 사진 치우기 — 저장 용량이 조용히 쌓이지 않게 */
export async function prunePhotos(previous: unknown, next: unknown): Promise<void> {
  const before = new Set<string>();
  const after = new Set<string>();
  collectStored(previous, before);
  collectStored(next, after);

  for (const url of before) {
    if (after.has(url)) continue;
    const path = pathOf(url);
    if (path) await deletePhoto(path);
  }
}

function collectStored(value: unknown, out: Set<string>): void {
  if (typeof value === "string") {
    if (isStoredPhoto(value)) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectStored(v, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectStored(v, out);
  }
}

export { publicPhotoUrl };
