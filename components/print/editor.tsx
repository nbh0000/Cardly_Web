"use client";

/**
 * 편집기 전체 — 위 막대, 왼쪽 도구, 가운데 종이, 오른쪽 패널.
 *
 * 이 파일은 «무엇을 언제 보여 줄지» 만 정합니다. 계산은 lib/print 에,
 * 손놀림은 canvas.tsx 에 있습니다.
 *
 * 자동 저장은 브라우저 안에만 합니다. 계정 없이도 만들어 볼 수 있어야 하고,
 * 실제로 대부분의 사람은 로그인하기 전에 먼저 만들어 봅니다. 저장 공간이
 * 모자라면 조용히 실패하는 대신 위 막대에 그 사실을 적습니다 — 저장된 줄
 * 알고 탭을 닫는 것이 가장 나쁩니다.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PrintCanvas } from "@/components/print/canvas";
import { Inspector } from "@/components/print/inspector";
import { Layers } from "@/components/print/layers";
import { AiPanel } from "@/components/print/ai-panel";
import { ExportDialog } from "@/components/print/export-dialog";
import { cloneElements, useEditorStore } from "@/lib/print/store";
import { checkPrint, newShape, newText, uid } from "@/lib/print/model";
import { loadImageFile } from "@/lib/print/image";
import { newImage } from "@/lib/print/model";
import { editorScale, findCategory, minImageDpi } from "@/lib/print/specs";
import { blankDoc } from "@/lib/print/doc";
import { canSave, persistPrintDoc } from "@/lib/print/save";
import type { ImageElement, PrintDoc, ShapeKind } from "@/lib/print/types";

/** 96dpi 화면에서 1mm 가 몇 픽셀인가 */
const MM_PX = 96 / 25.4;

const SHAPES: { kind: ShapeKind; label: string }[] = [
  { kind: "rect", label: "사각형" },
  { kind: "ellipse", label: "원" },
  { kind: "line", label: "선" },
  { kind: "arrow", label: "화살표" },
  { kind: "triangle", label: "삼각형" },
  { kind: "star", label: "별" },
  { kind: "bubble", label: "말풍선" },
];

export function PrintEditor({
  initial,
  storageKey,
  docId: initialDocId = null,
  paid = false,
}: {
  initial: PrintDoc;
  storageKey: string;
  /** 계정에 저장해 둔 문서라면 그 id */
  docId?: string | null;
  /** 결제해서 워터마크가 풀렸는지 */
  paid?: boolean;
}) {
  const store = useEditorStore(initial);
  const { state, dispatch, elements, selectedElements } = store;
  const doc = state.doc;

  const [zoom, setZoom] = useState(1);
  const [tab, setTab] = useState<"props" | "layers" | "ai">("props");
  const [showBleed, setShowBleed] = useState(false);
  const [showSafe, setShowSafe] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [aiEditing, setAiEditing] = useState<ImageElement | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [docId, setDocId] = useState<string | null>(initialDocId);
  const [account, setAccount] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const viewRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replacingRef = useRef<string | null>(null);

  const base = useMemo(() => editorScale(doc.width, doc.height) * MM_PX, [doc.width, doc.height]);
  const scale = base * zoom;
  const category = findCategory(doc.category);

  const warnings = useMemo(
    () => checkPrint(doc.elements, doc, minImageDpi(doc.dpi)),
    [doc],
  );

  /* ── 화면에 맞추기 ─────────────────────────────────────── */

  const fit = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const pad = 64;
    const kx = (view.clientWidth - pad) / (doc.width * base);
    const ky = (view.clientHeight - pad) / (doc.height * base);
    setZoom(Math.max(0.05, Math.min(4, Math.min(kx, ky))));
  }, [doc.width, doc.height, base]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    // ResizeObserver 는 관찰을 시작할 때 한 번 부르므로 첫 맞춤도 여기서 됩니다
    const ro = new ResizeObserver(() => fit());
    ro.observe(view);
    return () => ro.disconnect();
  }, [fit]);

  /* ── 자동 저장 ────────────────────────────────────────── */

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(doc));
        setSaved(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
      } catch {
        setSaved("저장 공간이 모자랍니다");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [doc, storageKey]);

  /* ── 계정에 저장 ──────────────────────────────────────────
     브라우저 저장은 이미 위에서 하고 있습니다. 여기는 «다른 기기에서도
     열리게» 하는 저장이라, 자동으로 하지 않고 사용자가 누를 때만 합니다.
     로그인 화면으로 튕기는 일이 편집 도중에 일어나면 안 되기 때문입니다. */

  const keep = useCallback(async () => {
    setAccount("saving");
    try {
      const id = await persistPrintDoc(doc, docId);
      if (!docId) {
        setDocId(id);
        // 주소에 남겨 두면 새로고침해도 같은 문서로 돌아옵니다
        const url = new URL(window.location.href);
        url.searchParams.set("doc", id);
        window.history.replaceState(null, "", url.toString());
      }
      setAccount("saved");
    } catch {
      setAccount("error");
    }
  }, [doc, docId]);

  /* ── 단축키 ──────────────────────────────────────────── */

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement | null;
      if (el && (el.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(el.tagName))) return;

      const mod = ev.metaKey || ev.ctrlKey;
      const ids = state.selected;

      if (mod && ev.key.toLowerCase() === "z") {
        ev.preventDefault();
        dispatch({ type: ev.shiftKey ? "redo" : "undo" });
        return;
      }
      if (mod && ev.key.toLowerCase() === "y") {
        ev.preventDefault();
        dispatch({ type: "redo" });
        return;
      }
      if (mod && ev.key.toLowerCase() === "c") {
        dispatch({ type: "copy" });
        return;
      }
      if (mod && ev.key.toLowerCase() === "v") {
        dispatch({ type: "paste" });
        return;
      }
      if (mod && ev.key.toLowerCase() === "d") {
        ev.preventDefault();
        const copies = cloneElements(selectedElements);
        if (copies.length) dispatch({ type: "add", elements: copies });
        return;
      }
      if (mod && ev.key.toLowerCase() === "a") {
        ev.preventDefault();
        dispatch({ type: "select", ids: elements.map((e) => e.id) });
        return;
      }
      if (mod && ev.key.toLowerCase() === "g") {
        ev.preventDefault();
        if (selectedElements.length < 2) return;
        const already = selectedElements[0]!.group;
        const same = selectedElements.every((e) => e.group && e.group === already);
        dispatch({ type: "patch", ids, patch: { group: same ? undefined : uid() } });
        return;
      }
      if (ev.key === "Delete" || ev.key === "Backspace") {
        if (ids.length === 0) return;
        ev.preventDefault();
        dispatch({ type: "remove", ids });
        return;
      }
      if (ev.key === "Escape") {
        dispatch({ type: "select", ids: [] });
        return;
      }
      if (ev.key.startsWith("Arrow") && ids.length) {
        ev.preventDefault();
        // 현수막은 mm 가 커서 1mm 씩 움직이면 아무 일도 안 일어난 것처럼 보입니다
        const unit = (doc.width > 1000 ? 10 : 1) * (ev.shiftKey ? 10 : 1);
        const dx = ev.key === "ArrowLeft" ? -unit : ev.key === "ArrowRight" ? unit : 0;
        const dy = ev.key === "ArrowUp" ? -unit : ev.key === "ArrowDown" ? unit : 0;
        dispatch({
          type: "replace",
          elements: doc.elements.map((e) =>
            ids.includes(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e,
          ),
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, state.selected, selectedElements, elements, doc]);

  /* ── 더하기 ──────────────────────────────────────────── */

  const addText = () => {
    const size = Math.max(9, Math.round(doc.width * 0.055));
    dispatch({
      type: "add",
      elements: [
        newText({
          x: doc.safe + 4,
          y: doc.safe + 4,
          w: Math.max(40, doc.width * 0.55),
          h: size * 0.5,
          size,
          side: state.side,
        }),
      ],
    });
  };

  const addShape = (kind: ShapeKind) => {
    const unit = doc.width * 0.22;
    dispatch({
      type: "add",
      elements: [
        newShape(kind, {
          x: doc.width / 2 - unit / 2,
          y: doc.height / 2 - unit / 2,
          w: unit,
          h: kind === "line" || kind === "arrow" ? doc.width * 0.004 : unit,
          side: state.side,
        }),
      ],
    });
  };

  const takeFile = async (file: File, xMm?: number, yMm?: number) => {
    try {
      const img = await loadImageFile(file);
      const replacing = replacingRef.current;
      replacingRef.current = null;
      if (replacing) {
        dispatch({
          type: "patch",
          ids: [replacing],
          patch: { src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight },
        });
        return;
      }
      const w = doc.width * 0.45;
      const h = (w * img.naturalHeight) / Math.max(1, img.naturalWidth);
      dispatch({
        type: "add",
        elements: [
          newImage(img.src, {
            x: xMm !== undefined ? Math.max(0, xMm - w / 2) : doc.width / 2 - w / 2,
            y: yMm !== undefined ? Math.max(0, yMm - h / 2) : doc.height / 2 - h / 2,
            w,
            h,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            side: state.side,
          }),
        ],
      });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "사진을 넣지 못했습니다.");
    }
  };

  return (
    <div className="pe-root">
      <header className="pe-bar">
        <div className="pe-bar-left">
          <Link href="/print" className="pe-back" aria-label="인쇄물 목록으로">
            ←
          </Link>
          <strong className="pe-doc-title">{category?.label}</strong>
          <input
            className="pe-title-input"
            value={doc.title}
            onChange={(e) => dispatch({ type: "doc", value: { title: e.target.value } })}
          />
        </div>

        <div className="pe-bar-mid">
          <button type="button" disabled={!store.canUndo} onClick={() => dispatch({ type: "undo" })}>
            되돌리기
          </button>
          <button type="button" disabled={!store.canRedo} onClick={() => dispatch({ type: "redo" })}>
            다시 하기
          </button>
          <span className="pe-zoom">
            <button type="button" onClick={() => setZoom((z) => Math.max(0.05, z / 1.25))}>−</button>
            <button type="button" onClick={fit} title="화면에 맞추기">
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" onClick={() => setZoom((z) => Math.min(4, z * 1.25))}>+</button>
          </span>
          {doc.duplex && (
            <span className="pe-side">
              <button
                type="button"
                className={state.side === "front" ? "is-on" : undefined}
                onClick={() => dispatch({ type: "side", side: "front" })}
              >
                앞면
              </button>
              <button
                type="button"
                className={state.side === "back" ? "is-on" : undefined}
                onClick={() => dispatch({ type: "side", side: "back" })}
              >
                뒷면
              </button>
            </span>
          )}
        </div>

        <div className="pe-bar-right">
          <span className="pe-saved">
            {account === "saving"
              ? "저장하는 중…"
              : account === "saved"
                ? "계정에 저장됨"
                : account === "error"
                  ? "저장하지 못했습니다"
                  : saved && `자동 저장 ${saved}`}
          </span>
          {canSave() ? (
            <button type="button" className="pe-btn" onClick={() => void keep()}>
              계정에 저장
            </button>
          ) : (
            <Link href="/login" className="pe-btn">
              로그인
            </Link>
          )}
          {warnings.length > 0 && (
            <span className="pe-warn-badge" title="내보내기에서 자세히 볼 수 있습니다">
              점검 {warnings.length}
            </span>
          )}
          <button type="button" className="pe-btn pe-btn-solid" onClick={() => setExporting(true)}>
            내보내기
          </button>
        </div>
      </header>

      <div className="pe-body">
        <aside className="pe-tools">
          <button type="button" onClick={addText}>글자</button>
          <button type="button" onClick={() => fileRef.current?.click()}>사진</button>
          <div className="pe-tool-shapes">
            {SHAPES.map((s) => (
              <button key={s.kind} type="button" onClick={() => addShape(s.kind)}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="pe-tool-toggles">
            <label>
              <input type="checkbox" checked={showSafe} onChange={(e) => setShowSafe(e.target.checked)} />
              안전선
            </label>
            <label>
              <input type="checkbox" checked={showBleed} onChange={(e) => setShowBleed(e.target.checked)} />
              재단 여백
            </label>
          </div>

          <div className="pe-tool-templates">
            <h4>템플릿</h4>
            <Link href={`/print/${doc.category}`} className="pe-tool-link">
              목록에서 고르기
            </Link>
            <button
              type="button"
              onClick={() => {
                if (doc.elements.length > 0 && !window.confirm("빈 종이로 시작할까요?")) return;
                dispatch({ type: "setDoc", value: blankDoc(doc.category, doc.sizeId) });
              }}
            >
              빈 종이
            </button>
          </div>
        </aside>

        <div className="pe-view" ref={viewRef}>
          <PrintCanvas
            store={store}
            scale={scale}
            showBleed={showBleed}
            showSafe={showSafe}
            onDropImage={(file, x, y) => void takeFile(file, x, y)}
          />
        </div>

        <aside className="pe-side-panel">
          <div className="pe-tabs">
            <button type="button" className={tab === "props" ? "is-on" : undefined} onClick={() => setTab("props")}>
              속성
            </button>
            <button type="button" className={tab === "layers" ? "is-on" : undefined} onClick={() => setTab("layers")}>
              층
            </button>
            <button type="button" className={tab === "ai" ? "is-on" : undefined} onClick={() => setTab("ai")}>
              AI
            </button>
          </div>

          {tab === "props" && (
            <Inspector
              store={store}
              onPickImage={(id) => {
                replacingRef.current = id;
                fileRef.current?.click();
              }}
              onEditImage={(el) => {
                setAiEditing(el);
                setTab("ai");
              }}
            />
          )}
          {tab === "layers" && <Layers store={store} />}
          {tab === "ai" && (
            <AiPanel
              key={aiEditing?.id ?? "none"}
              store={store}
              editing={aiEditing}
              onDoneEditing={() => setAiEditing(null)}
            />
          )}
        </aside>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void takeFile(file);
        }}
      />

      {exporting && (
        <ExportDialog
          doc={doc}
          paid={paid}
          docId={docId}
          onClose={() => setExporting(false)}
        />
      )}
    </div>
  );
}
