/**
 * 이력서·명함을 파일로 저장하는 공통 도구.
 *
 * html2canvas 와 jspdf 는 둘 다 무거우므로 저장 버튼을 누른 순간에만
 * 동적으로 불러옵니다. 첫 화면 번들에는 들어가지 않습니다.
 */

/**
 * 캡처 대상은 화면에서 `transform: scale()` 로 축소되어 있습니다.
 * 그대로 캡처하면 축소된 크기로 찍히므로, 캡처하는 동안만 배율을
 * 1 로 되돌렸다가 원래대로 돌려놓습니다.
 */
async function withFullScale<T>(
  el: HTMLElement,
  run: () => Promise<T>,
): Promise<T> {
  const fit = el.closest<HTMLElement>("[data-fit]");
  const previous = fit?.style.transform ?? "";
  if (fit) fit.style.transform = "none";
  // 선택 표시(점선 테두리)가 캡처에 찍히지 않도록 잠시 감춥니다.
  el.classList.add("is-export");
  try {
    // 스타일 변경이 실제 레이아웃에 반영된 다음 프레임에 캡처합니다.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    return await run();
  } finally {
    el.classList.remove("is-export");
    if (fit) fit.style.transform = previous;
  }
}

export async function captureCanvas(
  el: HTMLElement,
  scale: number,
  transparent = false,
): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import("html2canvas");
  return withFullScale(el, () =>
    html2canvas(el, {
      scale,
      useCORS: true,
      backgroundColor: transparent ? null : "#ffffff",
      logging: false,
    }),
  );
}

/** 저장 위치를 고를 수 있으면 고르게 하고, 아니면 바로 내려받습니다. */
export async function saveBlob(
  blob: Blob,
  filename: string,
  picker?: { description: string; mime: string; extension: string },
) {
  if (picker && "showSaveFilePicker" in window) {
    try {
      const handle = await (
        window as unknown as {
          showSaveFilePicker: (o: unknown) => Promise<FileSystemFileHandle>;
        }
      ).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: picker.description,
            accept: { [picker.mime]: [`.${picker.extension}`] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (error) {
      // 사용자가 저장 창을 닫았다면 아무 일도 하지 않습니다.
      if ((error as { name?: string })?.name === "AbortError") return false;
      // 그 밖의 실패는 아래의 일반 다운로드로 넘어갑니다.
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return true;
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("캔버스 변환 실패"))),
      type,
      quality,
    );
  });
}

/** A4 한 장짜리 PDF. 시트를 이미지로 찍어 페이지 전체에 채웁니다. */
export async function sheetToPdfBlob(el: HTMLElement): Promise<Blob> {
  const canvas = await captureCanvas(el, 3);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF("p", "mm", "a4");
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 297);
  return pdf.output("blob");
}

/** 사용자가 넣은 값이 HTML 문서로 나갈 때 태그로 해석되지 않게 합니다. */
export function escapeHtml(value = ""): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function readImageFile(
  file: File | null | undefined,
): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
