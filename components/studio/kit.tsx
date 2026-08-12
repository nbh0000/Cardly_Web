"use client";

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { readDraft, writeDraft } from "@/lib/studio/storage";

export const MM = 96 / 25.4; // 1mm 를 CSS px 로

/* ------------------------------------------------------------------
   무대 맞춤 — 실제 mm 크기로 그린 캔버스를 화면 폭에 맞춰 축소
   ------------------------------------------------------------------ */

/**
 * 캔버스는 늘 실제 크기(mm)로 그리고, 화면에서만 배율을 바꿔 보여줍니다.
 *
 * 그런데 90 × 50 mm 명함은 96dpi 로 340px 밖에 안 돼서 그대로 두면 편집이
 * 불가능할 만큼 작습니다. 그래서 축소만이 아니라 확대도 허용하되, 너무
 * 커져서 글자가 뭉개지지 않도록 maxScale 로 상한을 둡니다.
 */
export function useStageFit(
  naturalWidthMm: number,
  naturalHeightMm: number,
  {
    maxScale = 1,
    minScale = 0,
    padding = 0,
  }: { maxScale?: number; minScale?: number; padding?: number } = {},
) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(maxScale);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const naturalWidth = naturalWidthMm * MM;
    const measure = () => {
      const width = node.clientWidth - padding;
      // 좁은 화면에서 끝까지 줄이면 글자를 읽을 수 없습니다.
      // 하한 아래로는 줄이지 않고 가로 스크롤로 보게 둡니다.
      if (width > 0)
        setScale(Math.max(minScale, Math.min(maxScale, width / naturalWidth)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [naturalWidthMm, maxScale, minScale, padding]);

  // ref 와 치수를 한 객체에 담으면 정적 분석이 객체 전체를 ref 로 보고
  // "렌더 중 ref 접근" 으로 잡습니다. 그래서 따로 돌려줍니다.
  return [
    ref,
    {
      scale,
      /** 배율이 적용된 캔버스가 실제로 차지하는 화면 크기 */
      width: naturalWidthMm * MM * scale,
      height: naturalHeightMm * MM * scale,
    },
  ] as const;
}

/* ------------------------------------------------------------------
   포인터 드래그 — 캔버스 기준 % 단위로 이동량을 돌려줍니다
   ------------------------------------------------------------------ */

type DragOptions = {
  /** 이동량을 % 로 환산할 기준 요소 */
  boundsRef: RefObject<HTMLElement | null>;
  onStart?: () => void;
  onMove: (deltaXPercent: number, deltaYPercent: number) => void;
};

export function usePointerDrag({ boundsRef, onStart, onMove }: DragOptions) {
  return useCallback(
    (event: React.PointerEvent) => {
      // 더블클릭(텍스트 편집 진입)은 드래그로 보지 않습니다.
      if (event.detail > 1) return;
      const bounds = boundsRef.current?.getBoundingClientRect();
      if (!bounds) return;
      event.preventDefault();
      onStart?.();

      // currentTarget 은 Element 로 좁혀져 오는데, 포인터 이벤트 맵은
      // HTMLElement 에만 붙어 있어 addEventListener 오버로드가 맞지 않습니다.
      const target = event.currentTarget as HTMLElement;
      const pointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;
      target.setPointerCapture(pointerId);

      const cleanup = () => {
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", cleanup);
        target.removeEventListener("pointercancel", cleanup);
        target.removeEventListener("lostpointercapture", cleanup);
        if (target.hasPointerCapture(pointerId))
          target.releasePointerCapture(pointerId);
      };

      const move = (next: PointerEvent) => {
        if (next.pointerId !== pointerId) return;
        if (next.pointerType === "mouse" && next.buttons !== 1) return cleanup();
        onMove(
          ((next.clientX - startX) / bounds.width) * 100,
          ((next.clientY - startY) / bounds.height) * 100,
        );
      };

      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", cleanup);
      target.addEventListener("pointercancel", cleanup);
      target.addEventListener("lostpointercapture", cleanup);
    },
    [boundsRef, onMove, onStart],
  );
}

/* ------------------------------------------------------------------
   되돌리기 / 다시 실행
   ------------------------------------------------------------------ */

export function useHistory<T>(current: T, apply: (value: T) => void) {
  // 되돌리기 버튼의 활성 여부를 렌더에서 읽어야 하므로 ref 가 아니라
  // 상태로 들고 있습니다.
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const remember = useCallback(() => {
    setPast((list) => [...list.slice(-29), current]);
    setFuture([]);
  }, [current]);

  const undo = useCallback(() => {
    setPast((list) => {
      if (list.length === 0) return list;
      const previous = list[list.length - 1];
      setFuture((next) => [...next, current]);
      apply(previous);
      return list.slice(0, -1);
    });
  }, [apply, current]);

  const redo = useCallback(() => {
    setFuture((list) => {
      if (list.length === 0) return list;
      const next = list[list.length - 1];
      setPast((prev) => [...prev, current]);
      apply(next);
      return list.slice(0, -1);
    });
  }, [apply, current]);

  return {
    remember,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}

/* ------------------------------------------------------------------
   초안 자동 저장 — 정적 내보내기 대비, 마운트 이후에만 읽습니다
   ------------------------------------------------------------------ */

export function useDraft<T>(key: string, value: T, restore: (draft: T) => void) {
  // 아직 초안을 읽기 전에 기본값을 덮어써 버리지 않도록 표시해 둡니다.
  // 화면에 쓰이지 않는 값이라 상태가 아니라 ref 로 둡니다.
  const loaded = useRef(false);

  useEffect(() => {
    const draft = readDraft<T>(key);
    if (draft) restore(draft);
    loaded.current = true;
    // restore 는 호출부에서 useCallback 으로 고정해 넘겨야 합니다.
  }, [key, restore]);

  useEffect(() => {
    if (!loaded.current) return;
    const timer = setTimeout(() => writeDraft(key, value), 400);
    return () => clearTimeout(timer);
  }, [key, value]);
}

/* ------------------------------------------------------------------
   편집기 공통 UI
   ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.75rem] text-ink-soft">{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-[0.6875rem] text-hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function ToolButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className="rounded-full border border-line px-3 py-1.5 text-[0.75rem] text-ink transition-colors enabled:hover:border-rose enabled:hover:text-rose-deep disabled:opacity-35"
    >
      {children}
    </button>
  );
}
