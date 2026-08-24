"use client";

/**
 * 편집 화면 — 종이 한 장과 그 위의 손놀림.
 *
 * 여기서만 «화면 좌표 ↔ 종이 좌표» 를 오갑니다. 나머지 코드는 mm 만 압니다.
 * 그 환산을 여러 곳에 흩어 두면, 확대해서 보고 있을 때만 어긋나는 종류의
 * 버그가 생기고 그건 재현하기가 아주 어렵습니다.
 *
 * 마우스와 손가락을 따로 다루지 않고 Pointer Events 하나로 받습니다.
 * 태블릿에서 그대로 동작해야 하기 때문입니다.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ElementView, ptToPx } from "@/components/print/element-view";
import { fontStack } from "@/lib/fonts";
import { boundsOf, snap, type Guide } from "@/lib/print/model";
import type { EditorStore } from "@/lib/print/store";
import type { PrintBackground, PrintElement, TextElement } from "@/lib/print/types";

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLES: { id: Handle; hx: -1 | 0 | 1; hy: -1 | 0 | 1; cursor: string }[] = [
  { id: "nw", hx: -1, hy: -1, cursor: "nwse-resize" },
  { id: "n", hx: 0, hy: -1, cursor: "ns-resize" },
  { id: "ne", hx: 1, hy: -1, cursor: "nesw-resize" },
  { id: "e", hx: 1, hy: 0, cursor: "ew-resize" },
  { id: "se", hx: 1, hy: 1, cursor: "nwse-resize" },
  { id: "s", hx: 0, hy: 1, cursor: "ns-resize" },
  { id: "sw", hx: -1, hy: 1, cursor: "nesw-resize" },
  { id: "w", hx: -1, hy: 0, cursor: "ew-resize" },
];

/** 최소 크기(mm). 0 이 되면 다시 잡을 수 없는 요소가 됩니다 */
const MIN_MM = 2;

interface Drag {
  kind: "move" | "resize" | "rotate" | "marquee";
  handle?: Handle;
  startX: number;
  startY: number;
  origin: PrintElement[];
  /** marquee 용 — 지금 끌고 있는 지점 */
  nowX: number;
  nowY: number;
}

export function PrintCanvas({
  store,
  scale,
  showBleed,
  showSafe,
  onDropImage,
}: {
  store: EditorStore;
  /** px/mm */
  scale: number;
  showBleed: boolean;
  showSafe: boolean;
  onDropImage?: (file: File, xMm: number, yMm: number) => void;
}) {
  const { state, dispatch, elements, selectedElements, background } = store;
  const doc = state.doc;
  const pageRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);

  const bleed = showBleed ? doc.bleed : 0;

  /** 화면 좌표 → 종이 좌표(mm). 재단선 왼쪽 위가 원점입니다 */
  const toMm = useCallback(
    (clientX: number, clientY: number) => {
      const box = pageRef.current?.getBoundingClientRect();
      if (!box) return { x: 0, y: 0 };
      return { x: (clientX - box.left) / scale, y: (clientY - box.top) / scale };
    },
    [scale],
  );

  /** 묶인 요소는 함께 움직입니다 */
  const withGroup = useCallback(
    (ids: string[]) => {
      const groups = new Set(
        doc.elements.filter((e) => ids.includes(e.id) && e.group).map((e) => e.group!),
      );
      return doc.elements.filter(
        (e) => ids.includes(e.id) || (e.group && groups.has(e.group)),
      );
    },
    [doc.elements],
  );

  const beginDrag = useCallback(
    (kind: Drag["kind"], ev: React.PointerEvent, handle?: Handle, ids?: string[]) => {
      const p = toMm(ev.clientX, ev.clientY);
      const targets = ids ? withGroup(ids) : [];
      setDrag({
        kind,
        handle,
        startX: p.x,
        startY: p.y,
        nowX: p.x,
        nowY: p.y,
        origin: targets.map((e) => ({ ...e })),
      });
    },
    [toMm, withGroup],
  );

  /* 끄는 동안의 계산. 손을 뗄 때 한 번만 되돌리기 단계를 만듭니다. */
  useEffect(() => {
    if (!drag) return;

    const move = (ev: PointerEvent) => {
      const p = toMm(ev.clientX, ev.clientY);

      if (drag.kind === "marquee") {
        setDrag({ ...drag, nowX: p.x, nowY: p.y });
        return;
      }

      const dx = p.x - drag.startX;
      const dy = p.y - drag.startY;
      const page = { x: 0, y: 0, w: doc.width, h: doc.height };

      if (drag.kind === "move") {
        const box = boundsOf(drag.origin);
        if (!box) return;
        const moving = new Set(drag.origin.map((e) => e.id));
        const others = doc.elements.filter(
          (e) => !moving.has(e.id) && (e.side ?? "front") === state.side,
        );
        const wanted = { x: box.x + dx, y: box.y + dy, w: box.w, h: box.h };
        const fixed = ev.altKey
          ? { x: wanted.x, y: wanted.y, guides: [] as Guide[] }
          : snap(wanted, others, page, 6 / scale);
        setGuides(fixed.guides);
        const gx = fixed.x - box.x;
        const gy = fixed.y - box.y;
        dispatch({
          type: "replace",
          commit: false,
          elements: doc.elements.map((e) => {
            const from = drag.origin.find((o) => o.id === e.id);
            return from ? { ...e, x: from.x + gx, y: from.y + gy } : e;
          }),
        });
        return;
      }

      if (drag.kind === "rotate") {
        const from = drag.origin[0];
        if (!from) return;
        const cx = from.x + from.w / 2;
        const cy = from.y + from.h / 2;
        const raw = (Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI + 90;
        // Shift 를 누르면 15도씩 — 반듯하게 세우려는 손을 도와줍니다
        const deg = ev.shiftKey ? Math.round(raw / 15) * 15 : Math.round(raw);
        dispatch({
          type: "patch",
          commit: false,
          ids: drag.origin.map((e) => e.id),
          patch: { rotation: ((deg % 360) + 360) % 360 },
        });
        return;
      }

      /* resize — 잡은 손잡이의 «반대편 모서리» 를 못으로 박아 두고 늘립니다.
         회전된 요소도 같은 식으로 다뤄야 해서, 좌표를 요소 기준으로 되돌린
         뒤에 계산하고 다시 종이 기준으로 되돌려 놓습니다. */
      const h = HANDLES.find((x) => x.id === drag.handle);
      const from = drag.origin[0];
      if (!h || !from) return;

      const rad = ((from.rotation ?? 0) * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const c = { x: from.x + from.w / 2, y: from.y + from.h / 2 };
      // 고정점 = 반대편 모서리(회전 반영)
      const fLocal = { x: (-h.hx * from.w) / 2, y: (-h.hy * from.h) / 2 };
      const F = {
        x: c.x + fLocal.x * cos - fLocal.y * sin,
        y: c.y + fLocal.x * sin + fLocal.y * cos,
      };
      const v = { x: p.x - F.x, y: p.y - F.y };
      const L = { x: v.x * cos + v.y * sin, y: -v.x * sin + v.y * cos };

      let w = h.hx === 0 ? from.w : Math.max(MIN_MM, L.x * h.hx);
      let hh = h.hy === 0 ? from.h : Math.max(MIN_MM, L.y * h.hy);

      const keepRatio = ev.shiftKey || from.kind === "image";
      if (keepRatio && h.hx !== 0 && h.hy !== 0) {
        const ratio = from.w / from.h;
        if (w / hh > ratio) w = hh * ratio;
        else hh = w / ratio;
      }

      const nLocal = { x: (h.hx * w) / 2, y: (h.hy * hh) / 2 };
      const nc = {
        x: F.x + nLocal.x * cos - nLocal.y * sin,
        y: F.y + nLocal.x * sin + nLocal.y * cos,
      };

      const patch: Record<string, number> = {
        x: nc.x - w / 2,
        y: nc.y - hh / 2,
        w,
        h: hh,
      };
      // 글자는 상자만 늘리면 크기가 그대로라 어색합니다 — 모서리를 잡았을
      // 때는 글자 크기도 같은 비율로 키웁니다.
      if (from.kind === "text" && h.hx !== 0 && h.hy !== 0) {
        patch.size = Math.round(from.size * (hh / from.h) * 10) / 10;
      }
      dispatch({
        type: "patch",
        commit: false,
        ids: [from.id],
        patch: patch as Partial<PrintElement>,
      });
    };

    const up = () => {
      if (drag.kind === "marquee") {
        const x1 = Math.min(drag.startX, drag.nowX);
        const x2 = Math.max(drag.startX, drag.nowX);
        const y1 = Math.min(drag.startY, drag.nowY);
        const y2 = Math.max(drag.startY, drag.nowY);
        if (Math.abs(x2 - x1) > 1 || Math.abs(y2 - y1) > 1) {
          const hit = elements
            .filter((e) => !e.locked && !e.hidden)
            .filter((e) => e.x < x2 && e.x + e.w > x1 && e.y < y2 && e.y + e.h > y1)
            .map((e) => e.id);
          dispatch({ type: "select", ids: hit });
        }
      } else if (drag.origin.length > 0 && movedSince(drag.origin, doc.elements)) {
        /* 끝났을 때 한 칸 — 지금 상태를 되돌리기에 남깁니다.
           «움직였을 때만» 남깁니다. 그냥 한 번 클릭한 것에도 칸을 만들면
           Ctrl+Z 를 눌렀을 때 아무 일도 일어나지 않는 것처럼 보입니다. */
        dispatch({ type: "replace", elements: doc.elements, commit: true });
      }
      setGuides([]);
      setDrag(null);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [drag, toMm, dispatch, doc.elements, doc.width, doc.height, elements, scale, state.side]);

  const onElementDown = (ev: React.PointerEvent, el: PrintElement) => {
    if (el.locked) return;
    ev.stopPropagation();
    if (state.editing === el.id) return;
    const already = state.selected.includes(el.id);
    if (ev.shiftKey) {
      dispatch({ type: "toggle", id: el.id });
      return;
    }
    const ids = already ? state.selected : [el.id];
    if (!already) dispatch({ type: "select", ids });
    beginDrag("move", ev, undefined, ids);
  };

  const box = boundsOf(selectedElements);
  const single = selectedElements.length === 1 ? selectedElements[0] : null;

  return (
    <div
      className="pe-stage"
      onPointerDown={(ev) => {
        if (ev.button !== 0) return;
        dispatch({ type: "select", ids: [] });
        beginDrag("marquee", ev);
      }}
      onDragOver={(ev) => {
        if (onDropImage) ev.preventDefault();
      }}
      onDrop={(ev) => {
        const file = ev.dataTransfer.files?.[0];
        if (!file || !onDropImage) return;
        ev.preventDefault();
        const p = toMm(ev.clientX, ev.clientY);
        onDropImage(file, p.x, p.y);
      }}
    >
      <div
        id="pe-paper"
        className="pe-paper"
        style={{
          width: (doc.width + bleed * 2) * scale,
          height: (doc.height + bleed * 2) * scale,
          padding: bleed * scale,
        }}
      >
        <div
          ref={pageRef}
          id="pe-page"
          className="pe-page"
          style={{
            width: doc.width * scale,
            height: doc.height * scale,
            ...backgroundStyle(background),
          }}
        >
          {background.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={background.image}
              alt=""
              className="pe-bg-image"
              style={{ opacity: background.imageOpacity ?? 1 }}
            />
          )}

          {elements.map((el) => (
            <div
              key={el.id}
              onPointerDown={(ev) => onElementDown(ev, el)}
              onDoubleClick={(ev) => {
                if (el.kind !== "text" || el.locked) return;
                ev.stopPropagation();
                dispatch({ type: "select", ids: [el.id] });
                dispatch({ type: "editing", id: el.id });
              }}
              style={{ cursor: el.locked ? "default" : "move" }}
            >
              <ElementView el={el} scale={scale} editing={state.editing === el.id} />
            </div>
          ))}

          {/* 글자 고치기 — 같은 자리에 같은 모양으로 겹쳐 둡니다 */}
          {state.editing &&
            (() => {
              const el = elements.find((e) => e.id === state.editing);
              if (!el || el.kind !== "text") return null;
              return <TextEditor key={el.id} el={el} scale={scale} store={store} />;
            })()}

          {/* 재단선 안쪽 안전선 */}
          {showSafe && doc.safe > 0 && (
            <div className="pe-safe" data-no-export="" style={{ inset: doc.safe * scale }} />
          )}

          {doc.perforation && (
            <div
              className="pe-perforation"
              data-no-export=""
              style={{ top: doc.height * scale * 0.5 }}
            />
          )}

          {/* 스마트 가이드 */}
          {guides.map((g, i) => (
            <div
              key={i}
              data-no-export=""
              className={g.axis === "x" ? "pe-guide-v" : "pe-guide-h"}
              style={g.axis === "x" ? { left: g.at * scale } : { top: g.at * scale }}
            />
          ))}

          {/* 선택 표시 */}
          {box && (
            <div
              data-no-export=""
              className="pe-select"
              style={{
                left: box.x * scale,
                top: box.y * scale,
                width: box.w * scale,
                height: box.h * scale,
                transform: single?.rotation ? `rotate(${single.rotation}deg)` : undefined,
              }}
            >
              {single && !single.locked && (
                <>
                  {HANDLES.map((h) => (
                    <span
                      key={h.id}
                      className="pe-handle"
                      style={{
                        left: `${((h.hx + 1) / 2) * 100}%`,
                        top: `${((h.hy + 1) / 2) * 100}%`,
                        cursor: h.cursor,
                      }}
                      onPointerDown={(ev) => {
                        ev.stopPropagation();
                        beginDrag("resize", ev, h.id, [single.id]);
                      }}
                    />
                  ))}
                  <span
                    className="pe-rotate"
                    onPointerDown={(ev) => {
                      ev.stopPropagation();
                      beginDrag("rotate", ev, undefined, [single.id]);
                    }}
                  />
                </>
              )}
            </div>
          )}

          {/* 여러 개 고르기 */}
          {drag?.kind === "marquee" && (
            <div
              data-no-export=""
              className="pe-marquee"
              style={{
                left: Math.min(drag.startX, drag.nowX) * scale,
                top: Math.min(drag.startY, drag.nowY) * scale,
                width: Math.abs(drag.nowX - drag.startX) * scale,
                height: Math.abs(drag.nowY - drag.startY) * scale,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** 끄는 동안 실제로 무언가 달라졌는지 */
function movedSince(origin: PrintElement[], now: PrintElement[]): boolean {
  return origin.some((o) => {
    const e = now.find((x) => x.id === o.id);
    if (!e) return true;
    if (e.x !== o.x || e.y !== o.y || e.w !== o.w || e.h !== o.h) return true;
    if (e.rotation !== o.rotation) return true;
    return e.kind === "text" && o.kind === "text" && e.size !== o.size;
  });
}

export function backgroundStyle(bg: PrintBackground): React.CSSProperties {
  if (bg.gradient) {
    return {
      background: `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})`,
    };
  }
  return { background: bg.color };
}

/**
 * 글자를 제자리에서 고칩니다.
 *
 * 별도 입력창을 띄우지 않는 이유는, 인쇄물에서는 «이 자리에 이 크기로 넣었을
 * 때 넘치는가» 가 곧 결과이기 때문입니다. 다른 곳에서 고치면 넘치는 것을
 * 나중에야 봅니다.
 */
function TextEditor({
  el,
  scale,
  store,
}: {
  el: TextElement;
  scale: number;
  store: EditorStore;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.textContent = el.text;
    node.focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    // 처음 들어올 때 한 번만 — 이후에는 사용자가 친 글자를 건드리지 않습니다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.id]);

  const commit = () => {
    const text = ref.current?.innerText ?? el.text;
    if (text !== el.text) {
      store.dispatch({ type: "patch", ids: [el.id], patch: { text } });
    }
    store.dispatch({ type: "editing", id: null });
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className="pe-text-edit"
      onPointerDown={(ev) => ev.stopPropagation()}
      onBlur={commit}
      onKeyDown={(ev) => {
        ev.stopPropagation();
        if (ev.key === "Escape") {
          ev.preventDefault();
          commit();
        }
      }}
      style={{
        position: "absolute",
        left: el.x * scale,
        top: el.y * scale,
        width: el.w * scale,
        minHeight: el.h * scale,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        transformOrigin: "center center",
        fontFamily: fontStack(el.font),
        fontSize: ptToPx(el.size, scale),
        fontWeight: el.weight,
        color: el.color,
        textAlign: el.align,
        lineHeight: el.lineHeight,
        letterSpacing: `${el.letterSpacing}em`,
        whiteSpace: "pre-wrap",
        wordBreak: "keep-all",
      }}
    />
  );
}
