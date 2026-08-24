"use client";

/**
 * 층 목록.
 *
 * 요소가 스무 개를 넘으면 «맨 뒤에 깔린 사각형» 을 화면에서 집을 수가
 * 없습니다. 그때부터 이 목록이 유일한 손잡이가 되므로, 잠그기와 숨기기를
 * 여기에 함께 두었습니다.
 *
 * 목록의 위가 화면의 앞입니다. 배열은 뒤쪽이 앞이므로 뒤집어 보여 줍니다.
 */

import type { EditorStore } from "@/lib/print/store";
import type { PrintElement } from "@/lib/print/types";

function labelOf(el: PrintElement): string {
  if (el.kind === "text") return el.text.split("\n")[0]!.slice(0, 22) || "빈 글자";
  if (el.kind === "image") return "사진";
  const names: Record<string, string> = {
    rect: "사각형",
    ellipse: "원",
    line: "선",
    arrow: "화살표",
    star: "별",
    bubble: "말풍선",
    triangle: "삼각형",
  };
  return names[el.shape] ?? "도형";
}

export function Layers({ store }: { store: EditorStore }) {
  const { state, dispatch, elements } = store;
  const list = [...elements].reverse();

  if (list.length === 0) {
    return <p className="pe-hint">이 면에는 아직 아무것도 없습니다.</p>;
  }

  return (
    <ul className="pe-layers">
      {list.map((el) => {
        const on = state.selected.includes(el.id);
        return (
          <li key={el.id} className={on ? "is-on" : undefined}>
            <button
              type="button"
              className="pe-layer-name"
              onClick={(e) =>
                e.shiftKey
                  ? dispatch({ type: "toggle", id: el.id })
                  : dispatch({ type: "select", ids: [el.id] })
              }
            >
              <span className="pe-layer-kind">
                {el.kind === "text" ? "T" : el.kind === "image" ? "▣" : "◇"}
              </span>
              {labelOf(el)}
            </button>
            <button
              type="button"
              title={el.hidden ? "보이기" : "숨기기"}
              className="pe-layer-flag"
              onClick={() => dispatch({ type: "patch", ids: [el.id], patch: { hidden: !el.hidden } })}
            >
              {el.hidden ? "○" : "●"}
            </button>
            <button
              type="button"
              title={el.locked ? "잠금 풀기" : "잠그기"}
              className="pe-layer-flag"
              onClick={() => dispatch({ type: "patch", ids: [el.id], patch: { locked: !el.locked } })}
            >
              {el.locked ? "■" : "□"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
