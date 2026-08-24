"use client";

/**
 * 오른쪽 속성 패널.
 *
 * 고른 것이 없으면 «종이» 를, 하나 이상 고르면 그 요소들의 속성을 보여
 * 줍니다. 탭으로 나누지 않은 이유는, 인쇄물 편집에서 가장 자주 오가는 두
 * 가지가 «이 글자» 와 «이 종이» 라서 한 번의 클릭 차이가 하루에 수백 번이
 * 되기 때문입니다.
 */

import { ColorBox, Group, NumberBox, Row, Segmented, Slider, shared } from "@/components/print/controls";
import { PRINT_FONTS } from "@/lib/print/fonts";
import { alignElements, distribute, uid, type AlignMode } from "@/lib/print/model";
import { findCategory } from "@/lib/print/specs";
import { resizeDoc } from "@/lib/print/doc";
import type { EditorStore } from "@/lib/print/store";
import type { ImageElement, PrintElement, ShapeElement, TextElement } from "@/lib/print/types";

export function Inspector({
  store,
  onPickImage,
  onEditImage,
}: {
  store: EditorStore;
  onPickImage: (id: string) => void;
  onEditImage: (el: ImageElement) => void;
}) {
  const { state, dispatch, selectedElements, elements, background } = store;
  const doc = state.doc;
  const ids = selectedElements.map((e) => e.id);

  const patch = (p: Record<string, unknown>) =>
    dispatch({ type: "patch", ids, patch: p as Partial<PrintElement> });

  if (selectedElements.length === 0) {
    const category = findCategory(doc.category);
    return (
      <div className="pe-panel">
        <Group title="종이">
          <Row label="규격">
            <select
              value={doc.sizeId}
              onChange={(e) => {
                const size = category?.sizes.find((s) => s.id === e.target.value);
                if (size) dispatch({ type: "setDoc", value: resizeDoc(doc, size), keepHistory: true });
              }}
            >
              {category?.sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Row>
          <Row label="크기">
            <NumberBox value={doc.width} onChange={(v) => dispatch({ type: "doc", value: { width: v, sizeId: "custom" } })} suffix="mm" />
            <NumberBox value={doc.height} onChange={(v) => dispatch({ type: "doc", value: { height: v, sizeId: "custom" } })} suffix="mm" />
          </Row>
          <Row label="재단 여백">
            <NumberBox value={doc.bleed} onChange={(v) => dispatch({ type: "doc", value: { bleed: Math.max(0, v) } })} suffix="mm" />
          </Row>
          <Row label="안전선">
            <NumberBox value={doc.safe} onChange={(v) => dispatch({ type: "doc", value: { safe: Math.max(0, v) } })} suffix="mm" />
          </Row>
          {category?.perforation && (
            <Row label="절취선">
              <input
                type="checkbox"
                checked={Boolean(doc.perforation)}
                onChange={(e) => dispatch({ type: "doc", value: { perforation: e.target.checked } })}
              />
            </Row>
          )}
        </Group>

        <Group title="배경">
          <Row label="방식">
            <Segmented
              value={background.gradient ? "gradient" : background.image ? "image" : "solid"}
              options={[
                { value: "solid", label: "단색" },
                { value: "gradient", label: "그라데이션" },
                { value: "image", label: "사진" },
              ]}
              onChange={(v) => {
                if (v === "solid") dispatch({ type: "background", value: { gradient: undefined, image: undefined } });
                if (v === "gradient")
                  dispatch({
                    type: "background",
                    value: { gradient: { from: background.color, to: "#ffffff", angle: 160 }, image: undefined },
                  });
                if (v === "image") dispatch({ type: "background", value: { gradient: undefined } });
              }}
            />
          </Row>
          {!background.gradient && (
            <Row label="색">
              <ColorBox value={background.color} onChange={(v) => dispatch({ type: "background", value: { color: v } })} />
            </Row>
          )}
          {background.gradient && (
            <>
              <Row label="시작">
                <ColorBox
                  value={background.gradient.from}
                  onChange={(v) =>
                    dispatch({ type: "background", value: { gradient: { ...background.gradient!, from: v } } })
                  }
                />
              </Row>
              <Row label="끝">
                <ColorBox
                  value={background.gradient.to}
                  onChange={(v) =>
                    dispatch({ type: "background", value: { gradient: { ...background.gradient!, to: v } } })
                  }
                />
              </Row>
              <Row label="각도">
                <Slider
                  min={0}
                  max={360}
                  value={background.gradient.angle}
                  onChange={(v) =>
                    dispatch({ type: "background", value: { gradient: { ...background.gradient!, angle: v } } })
                  }
                />
              </Row>
            </>
          )}
          {background.image && (
            <>
              <Row label="사진 농도">
                <Slider
                  min={10}
                  max={100}
                  value={(background.imageOpacity ?? 1) * 100}
                  onChange={(v) => dispatch({ type: "background", value: { imageOpacity: v / 100 } })}
                />
              </Row>
              <Row label="">
                <button type="button" className="pe-btn" onClick={() => dispatch({ type: "background", value: { image: undefined } })}>
                  사진 빼기
                </button>
              </Row>
            </>
          )}
        </Group>

        <p className="pe-hint">
          요소를 고르면 이 자리에 그 속성이 나옵니다. 빈 곳을 끌면 여러 개를 한 번에 고를 수 있습니다.
        </p>
      </div>
    );
  }

  const one = selectedElements.length === 1 ? selectedElements[0]! : null;
  const texts = selectedElements.filter((e): e is TextElement => e.kind === "text");
  const shapes = selectedElements.filter((e): e is ShapeElement => e.kind === "shape");
  const images = selectedElements.filter((e): e is ImageElement => e.kind === "image");

  const align = (mode: AlignMode) => {
    const moved = alignElements(selectedElements, mode, { x: 0, y: 0, w: doc.width, h: doc.height });
    const byId = new Map(moved.map((e) => [e.id, e]));
    dispatch({ type: "replace", elements: doc.elements.map((e) => byId.get(e.id) ?? e) });
  };

  const spread = (axis: "x" | "y") => {
    const moved = distribute(selectedElements, axis);
    const byId = new Map(moved.map((e) => [e.id, e]));
    dispatch({ type: "replace", elements: doc.elements.map((e) => byId.get(e.id) ?? e) });
  };

  const grouped = selectedElements.every((e) => e.group) && shared(selectedElements, "group") !== undefined;

  return (
    <div className="pe-panel">
      <Group title="자리">
        <Row label="X · Y">
          <NumberBox value={shared(selectedElements, "x")} onChange={(v) => patch({ x: v })} suffix="mm" />
          <NumberBox value={shared(selectedElements, "y")} onChange={(v) => patch({ y: v })} suffix="mm" />
        </Row>
        <Row label="너비 · 높이">
          <NumberBox value={shared(selectedElements, "w")} onChange={(v) => patch({ w: Math.max(1, v) })} suffix="mm" />
          <NumberBox value={shared(selectedElements, "h")} onChange={(v) => patch({ h: Math.max(1, v) })} suffix="mm" />
        </Row>
        <Row label="회전">
          <Slider min={0} max={359} value={shared(selectedElements, "rotation")} onChange={(v) => patch({ rotation: v })} />
        </Row>
        <Row label="투명도">
          <Slider
            min={5}
            max={100}
            value={(shared(selectedElements, "opacity") ?? 1) * 100}
            onChange={(v) => patch({ opacity: v / 100 })}
          />
        </Row>
        <Row label="맞추기">
          <span className="pe-align">
            {(
              [
                ["left", "⇤"],
                ["hcenter", "⇔"],
                ["right", "⇥"],
                ["top", "⇡"],
                ["vcenter", "⇕"],
                ["bottom", "⇣"],
              ] as [AlignMode, string][]
            ).map(([mode, icon]) => (
              <button key={mode} type="button" onClick={() => align(mode)} title={mode}>
                {icon}
              </button>
            ))}
          </span>
        </Row>
        {selectedElements.length >= 3 && (
          <Row label="고르게">
            <span className="pe-align">
              <button type="button" onClick={() => spread("x")}>가로</button>
              <button type="button" onClick={() => spread("y")}>세로</button>
            </span>
          </Row>
        )}
        {selectedElements.length >= 2 && (
          <Row label="묶기">
            <button
              type="button"
              className="pe-btn"
              onClick={() => patch({ group: grouped ? undefined : uid() })}
            >
              {grouped ? "묶음 풀기" : "하나로 묶기"}
            </button>
          </Row>
        )}
      </Group>

      {texts.length > 0 && (
        <Group title="글자">
          <Row label="글꼴">
            <select value={shared(texts, "font") ?? ""} onChange={(e) => patch({ font: e.target.value })}>
              {shared(texts, "font") === undefined && <option value="">여러 글꼴</option>}
              {PRINT_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </Row>
          <Row label="크기">
            <NumberBox value={shared(texts, "size")} step={0.5} min={4} onChange={(v) => patch({ size: v })} suffix="pt" />
            <NumberBox value={shared(texts, "weight")} step={100} min={100} max={900} onChange={(v) => patch({ weight: v })} />
          </Row>
          <Row label="색">
            <ColorBox value={shared(texts, "color")} onChange={(v) => patch({ color: v })} />
          </Row>
          <Row label="정렬">
            <Segmented
              value={shared(texts, "align")}
              options={[
                { value: "left", label: "왼쪽" },
                { value: "center", label: "가운데" },
                { value: "right", label: "오른쪽" },
              ]}
              onChange={(v) => patch({ align: v })}
            />
          </Row>
          <Row label="행간">
            <NumberBox value={shared(texts, "lineHeight")} step={0.05} min={0.8} max={3} onChange={(v) => patch({ lineHeight: v })} />
          </Row>
          <Row label="자간">
            <NumberBox value={shared(texts, "letterSpacing")} step={0.01} min={-0.2} max={1} onChange={(v) => patch({ letterSpacing: v })} suffix="em" />
          </Row>
          <Row label="꾸밈">
            <span className="pe-align">
              <button type="button" onClick={() => patch({ underline: !shared(texts, "underline") })}>밑줄</button>
              <button type="button" onClick={() => patch({ italic: !shared(texts, "italic") })}>기울임</button>
            </span>
          </Row>
        </Group>
      )}

      {images.length > 0 && (
        <Group title="사진">
          <Row label="채우기">
            <Segmented
              value={shared(images, "fit")}
              options={[
                { value: "cover", label: "가득" },
                { value: "contain", label: "맞춤" },
              ]}
              onChange={(v) => patch({ fit: v })}
            />
          </Row>
          <Row label="모서리">
            <NumberBox value={shared(images, "radius") ?? 0} min={0} onChange={(v) => patch({ radius: v })} suffix="mm" />
          </Row>
          <Row label="밝기">
            <Slider min={40} max={160} value={shared(images, "brightness") ?? 100} onChange={(v) => patch({ brightness: v })} />
          </Row>
          <Row label="대비">
            <Slider min={40} max={160} value={shared(images, "contrast") ?? 100} onChange={(v) => patch({ contrast: v })} />
          </Row>
          <Row label="채도">
            <Slider min={0} max={200} value={shared(images, "saturate") ?? 100} onChange={(v) => patch({ saturate: v })} />
          </Row>
          {one?.kind === "image" && (
            <Row label="">
              <span className="pe-align">
                <button type="button" onClick={() => onPickImage(one.id)}>사진 바꾸기</button>
                <button type="button" onClick={() => onEditImage(one)}>AI 로 고치기</button>
              </span>
            </Row>
          )}
        </Group>
      )}

      {shapes.length > 0 && (
        <Group title="도형">
          <Row label="채움">
            <ColorBox value={shared(shapes, "fill")} onChange={(v) => patch({ fill: v })} />
          </Row>
          <Row label="테두리">
            <ColorBox value={shared(shapes, "stroke") ?? ""} allowNone onChange={(v) => patch({ stroke: v })} />
            <NumberBox value={shared(shapes, "strokeWidth") ?? 0} step={0.2} min={0} onChange={(v) => patch({ strokeWidth: v })} suffix="mm" />
          </Row>
          <Row label="모서리">
            <NumberBox value={shared(shapes, "radius") ?? 0} min={0} onChange={(v) => patch({ radius: v })} suffix="mm" />
          </Row>
        </Group>
      )}

      <Group title="순서">
        <Row label="">
          <span className="pe-align">
            {one && (
              <>
                <button type="button" onClick={() => dispatch({ type: "order", id: one.id, to: "front" })}>맨 앞</button>
                <button type="button" onClick={() => dispatch({ type: "order", id: one.id, to: "forward" })}>앞으로</button>
                <button type="button" onClick={() => dispatch({ type: "order", id: one.id, to: "backward" })}>뒤로</button>
                <button type="button" onClick={() => dispatch({ type: "order", id: one.id, to: "back" })}>맨 뒤</button>
              </>
            )}
          </span>
        </Row>
        <Row label="">
          <span className="pe-align">
            <button type="button" onClick={() => patch({ locked: !shared(selectedElements, "locked") })}>
              {shared(selectedElements, "locked") ? "잠금 풀기" : "잠그기"}
            </button>
            <button type="button" onClick={() => dispatch({ type: "remove", ids })}>지우기</button>
          </span>
        </Row>
      </Group>

      {elements.length === 0 && <p className="pe-hint">아직 아무것도 없습니다.</p>}
    </div>
  );
}
