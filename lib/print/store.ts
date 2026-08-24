"use client";

/**
 * 편집기의 상태 한 곳.
 *
 * 화면 컴포넌트는 상태를 직접 만지지 않고 여기 action 만 부릅니다. 그래야
 * 실행 취소가 한 곳에서 성립합니다 — 어디선가 몰래 doc 를 고치면 그 변경은
 * 되돌릴 수 없는 변경이 되고, 사용자는 Ctrl+Z 를 눌렀는데 아무 일도 일어나지
 * 않는 화면을 보게 됩니다.
 *
 * ── 되돌리기는 통째로 담습니다 ──
 * 변경분(diff)이 아니라 문서 전체를 스냅샷으로 쌓습니다. 요소 백 개짜리
 * 문서도 JSON 으로 수십 KB 라 오십 단계를 들고 있어도 부담이 없고, 무엇보다
 * «어떤 변경이든 되돌릴 수 있다» 가 코드 한 줄로 보장됩니다. diff 방식은
 * 새 기능을 더할 때마다 되돌리기 코드를 함께 고쳐야 하고, 그 짝이 어긋나는
 * 순간 조용히 깨집니다.
 *
 * ── 드래그는 한 번으로 묶습니다 ──
 * 마우스를 끄는 동안 스냅샷을 쌓으면 Ctrl+Z 를 백 번 눌러야 원래대로
 * 돌아옵니다. 그래서 끄는 중에는 replace 로 덮어쓰고, 손을 뗄 때 commit 이
 * 한 칸을 만듭니다.
 */

import { useCallback, useMemo, useReducer } from "react";
import type {
  PrintDoc,
  PrintElement,
  ElementId,
  PrintBackground,
} from "@/lib/print/types";

const HISTORY_LIMIT = 60;

export interface EditorState {
  doc: PrintDoc;
  past: PrintDoc[];
  future: PrintDoc[];
  selected: ElementId[];
  /** 지금 글자를 고치고 있는 요소 */
  editing: ElementId | null;
  side: "front" | "back";
  clipboard: PrintElement[];
}

export type EditorAction =
  | { type: "select"; ids: ElementId[] }
  | { type: "toggle"; id: ElementId }
  | { type: "editing"; id: ElementId | null }
  | { type: "side"; side: "front" | "back" }
  /** commit 이 false 면 되돌리기 단계를 만들지 않고 마지막 상태를 덮어씁니다 */
  | { type: "patch"; ids: ElementId[]; patch: Partial<PrintElement>; commit?: boolean }
  | { type: "replace"; elements: PrintElement[]; commit?: boolean }
  | { type: "add"; elements: PrintElement[] }
  | { type: "remove"; ids: ElementId[] }
  | { type: "order"; id: ElementId; to: "front" | "back" | "forward" | "backward" }
  | { type: "background"; value: Partial<PrintBackground> }
  | { type: "doc"; value: Partial<PrintDoc> }
  | { type: "setDoc"; value: PrintDoc; keepHistory?: boolean }
  | { type: "copy" }
  | { type: "paste" }
  | { type: "undo" }
  | { type: "redo" };

function push(state: EditorState, doc: PrintDoc, commit = true): EditorState {
  if (!commit) return { ...state, doc };
  return {
    ...state,
    doc,
    past: [...state.past, state.doc].slice(-HISTORY_LIMIT),
    future: [],
  };
}

const uid = () => Math.random().toString(36).slice(2, 10);

/** 요소를 복제할 때는 새 id 를 주어야 합니다 — 같은 id 가 둘이면 선택이 엉킵니다 */
export function cloneElements(list: PrintElement[], offsetMm = 4): PrintElement[] {
  const map = new Map<string, string>();
  return list.map((el) => {
    const group = el.group
      ? (map.get(el.group) ?? map.set(el.group, uid()).get(el.group)!)
      : undefined;
    return { ...el, id: uid(), x: el.x + offsetMm, y: el.y + offsetMm, group };
  });
}

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "select":
      return { ...state, selected: action.ids, editing: null };

    case "toggle": {
      const on = state.selected.includes(action.id);
      return {
        ...state,
        selected: on
          ? state.selected.filter((i) => i !== action.id)
          : [...state.selected, action.id],
      };
    }

    case "editing":
      return { ...state, editing: action.id };

    case "side":
      return { ...state, side: action.side, selected: [], editing: null };

    case "patch": {
      const elements = state.doc.elements.map((el) =>
        action.ids.includes(el.id) ? ({ ...el, ...action.patch } as PrintElement) : el,
      );
      return push(state, { ...state.doc, elements }, action.commit);
    }

    case "replace":
      return push(state, { ...state.doc, elements: action.elements }, action.commit);

    case "add":
      return {
        ...push(state, {
          ...state.doc,
          elements: [...state.doc.elements, ...action.elements],
        }),
        selected: action.elements.map((e) => e.id),
      };

    case "remove":
      return {
        ...push(state, {
          ...state.doc,
          elements: state.doc.elements.filter((e) => !action.ids.includes(e.id)),
        }),
        selected: [],
        editing: null,
      };

    case "order": {
      const list = [...state.doc.elements];
      const at = list.findIndex((e) => e.id === action.id);
      if (at < 0) return state;
      const [el] = list.splice(at, 1);
      const to =
        action.to === "front"
          ? list.length
          : action.to === "back"
            ? 0
            : action.to === "forward"
              ? Math.min(list.length, at + 1)
              : Math.max(0, at - 1);
      list.splice(to, 0, el!);
      return push(state, { ...state.doc, elements: list });
    }

    case "background": {
      const key = state.side === "back" ? "backgroundBack" : "background";
      const current = (state.doc[key] ?? state.doc.background) as PrintBackground;
      return push(state, { ...state.doc, [key]: { ...current, ...action.value } });
    }

    case "doc":
      return push(state, { ...state.doc, ...action.value });

    case "setDoc":
      return action.keepHistory
        ? push(state, action.value)
        : { ...state, doc: action.value, past: [], future: [], selected: [], editing: null };

    case "copy":
      return {
        ...state,
        clipboard: state.doc.elements.filter((e) => state.selected.includes(e.id)),
      };

    case "paste": {
      if (state.clipboard.length === 0) return state;
      const copies = cloneElements(state.clipboard).map((e) => ({ ...e, side: state.side }));
      return {
        ...push(state, { ...state.doc, elements: [...state.doc.elements, ...copies] }),
        selected: copies.map((e) => e.id),
      };
    }

    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        ...state,
        doc: previous,
        past: state.past.slice(0, -1),
        future: [state.doc, ...state.future].slice(0, HISTORY_LIMIT),
        editing: null,
      };
    }

    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        doc: next,
        past: [...state.past, state.doc].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        editing: null,
      };
    }
  }
}

export function useEditorStore(initial: PrintDoc) {
  const [state, dispatch] = useReducer(reducer, {
    doc: initial,
    past: [],
    future: [],
    selected: [],
    editing: null,
    side: "front",
    clipboard: [],
  } satisfies EditorState);

  /** 지금 면에 놓인 요소만 — 양면 인쇄물에서 뒷면 요소가 앞면에 보이면 안 됩니다 */
  const elements = useMemo(
    () => state.doc.elements.filter((e) => (e.side ?? "front") === state.side),
    [state.doc.elements, state.side],
  );

  const selectedElements = useMemo(
    () => elements.filter((e) => state.selected.includes(e.id)),
    [elements, state.selected],
  );

  const background = state.side === "back" ? (state.doc.backgroundBack ?? state.doc.background) : state.doc.background;

  const select = useCallback((ids: ElementId[]) => dispatch({ type: "select", ids }), []);

  return {
    state,
    dispatch,
    elements,
    selectedElements,
    background,
    select,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}

export type EditorStore = ReturnType<typeof useEditorStore>;
