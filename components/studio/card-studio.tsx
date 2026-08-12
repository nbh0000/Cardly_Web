"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { type FontId, fontGroupsFor, fontStack, toFontId } from "@/lib/fonts";
import { asset } from "@/lib/asset";
import {
  ADDABLE,
  CARD_GROUPS,
  CARD_TEMPLATES,
  type CardCorner,
  type CardItem,
  type CardPaper,
  type CardTemplate,
  CORNER_LABEL,
  DEFAULT_CARD_TEMPLATE,
  PAPER_LABEL,
  SAMPLE_ITEMS,
  SHAPE_TYPES,
  type Slot,
} from "@/lib/studio/card-templates";
import {
  canvasToBlob,
  captureCanvas,
  readImageFile,
  saveBlob,
} from "@/lib/studio/export";
import { clearDraft } from "@/lib/studio/storage";
import {
  Field,
  MM,
  ToolButton,
  useDraft,
  useHistory,
  usePointerDrag,
  useStageFit,
} from "./kit";
import { ICON, PanelHead, StudioShell, type StudioSection } from "./shell";

const KEY = "cardly-card-v2";

const FONT_GROUPS = fontGroupsFor("card");

const SECTIONS: StudioSection[] = [
  { id: "template", label: "템플릿", icon: ICON.template },
  { id: "content", label: "내용", icon: ICON.text },
  { id: "paper", label: "종이·색", icon: ICON.palette },
  { id: "elements", label: "요소", icon: ICON.shapes },
  { id: "save", label: "저장", icon: ICON.save },
];

/** 캔버스에서 고르지 않아도 패널에서 바로 고칠 수 있는 기본 항목 */
const QUICK: [string, string][] = [
  ["company", "회사·브랜드"],
  ["name", "이름"],
  ["role", "직함"],
  ["email", "이메일"],
  ["phone", "전화번호"],
  ["website", "웹사이트"],
];

type Draft = {
  templateId: string;
  items: CardItem[];
  colors: { bg: string; text: string; accent: string };
  paper: CardPaper;
  corner: CardCorner;
  font: string;
};

export function CardStudio() {
  const cardRef = useRef<HTMLElement>(null);
  const [section, setSection] = useState("template");
  const [template, setTemplate] = useState<CardTemplate>(DEFAULT_CARD_TEMPLATE);
  const [items, setItems] = useState<CardItem[]>(SAMPLE_ITEMS);
  const [colors, setColors] = useState({
    bg: DEFAULT_CARD_TEMPLATE.bg,
    text: DEFAULT_CARD_TEMPLATE.text,
    accent: DEFAULT_CARD_TEMPLATE.accent,
  });
  const [paper, setPaper] = useState<CardPaper>(DEFAULT_CARD_TEMPLATE.paper);
  const [corner, setCorner] = useState<CardCorner>(DEFAULT_CARD_TEMPLATE.corner);
  const [font, setFont] = useState<FontId>("sans");
  const [side, setSide] = useState<"front" | "back">("front");
  const [selected, setSelected] = useState<string | null>(null);
  const [addType, setAddType] = useState("text");
  const [showSafe, setShowSafe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [decoFilter, setDecoFilter] = useState("all");

  const [stageRef, stage] = useStageFit(90, 50, {
    maxScale: 1.9,
    minScale: 0.95,
    padding: 32,
  });
  const history = useHistory(items, setItems);

  const restore = useCallback((draft: Draft) => {
    const found = CARD_TEMPLATES.find((t) => t.id === draft.templateId);
    if (found) setTemplate(found);
    if (Array.isArray(draft.items) && draft.items.length) setItems(draft.items);
    if (draft.colors) setColors(draft.colors);
    if (draft.paper) setPaper(draft.paper);
    if (draft.corner) setCorner(draft.corner);
    if (draft.font) setFont(toFontId(draft.font));
  }, []);

  const snapshot: Draft = useMemo(
    () => ({ templateId: template.id, items, colors, paper, corner, font }),
    [template.id, items, colors, paper, corner, font],
  );
  useDraft<Draft>(KEY, snapshot, restore);

  /* -------------------- 템플릿 -------------------- */

  const applyTemplate = (t: CardTemplate) => {
    history.remember();
    setTemplate(t);
    setColors({ bg: t.bg, text: t.text, accent: t.accent });
    setPaper(t.paper);
    setCorner(t.corner);
    // 앞면 기본 요소만 템플릿이 정한 자리로 옮깁니다. 직접 추가한
    // 요소와 뒷면은 그대로 둡니다. 배치에는 글자 크기도 들어 있어,
    // 이름을 크게 앉히는 템플릿과 절제된 템플릿이 서로 다르게 읽힙니다.
    const spots: Record<string, Slot> = {
      company: t.placement.company,
      name: t.placement.name,
      role: t.placement.role,
      email: t.placement.contacts[0],
      phone: t.placement.contacts[1],
      website: t.placement.contacts[2],
    };
    setItems((list) =>
      list.map((item) => {
        const spot = item.side === "front" ? spots[item.id] : undefined;
        if (!spot) return item;
        return {
          ...item,
          x: spot[0],
          y: spot[1],
          size: spot[2] ?? 100,
          align: t.placement.align,
        };
      }),
    );
  };

  /* -------------------- 요소 -------------------- */

  const patch = useCallback(
    (id: string, next: Partial<CardItem>) =>
      setItems((list) =>
        list.map((item) => (item.id === id ? { ...item, ...next } : item)),
      ),
    [],
  );

  const dragOrigin = useRef<{ id: string; x: number; y: number } | null>(null);

  const startDrag = usePointerDrag({
    boundsRef: cardRef as React.RefObject<HTMLElement | null>,
    onMove: (dx, dy) => {
      const origin = dragOrigin.current;
      if (!origin) return;
      patch(origin.id, {
        x: Math.max(0, Math.min(96, origin.x + dx)),
        y: Math.max(0, Math.min(94, origin.y + dy)),
      });
    },
  });

  const onItemPointerDown = (e: React.PointerEvent, item: CardItem) => {
    dragOrigin.current = { id: item.id, x: item.x, y: item.y };
    history.remember();
    setSelected(item.id);
    startDrag(e);
  };

  const addItem = () => {
    const preset = ADDABLE.find(([type]) => type === addType);
    if (!preset) return;
    history.remember();
    const id = `el-${Date.now().toString(36)}`;
    setItems((list) => [
      ...list,
      {
        id,
        type: preset[0],
        text: preset[2],
        x: 40,
        y: 45,
        size: 100,
        side,
        align: template.placement.align,
      },
    ]);
    setSelected(id);
  };

  const addImage = async (file: File | undefined) => {
    const src = await readImageFile(file);
    if (!src) return;
    history.remember();
    const id = `img-${Date.now().toString(36)}`;
    setItems((list) => [
      ...list,
      { id, type: "image", text: "", src, x: 10, y: 12, size: 100, side },
    ]);
    setSelected(id);
  };

  const current = items.find((i) => i.id === selected) ?? null;
  const isShape = current ? SHAPE_TYPES.includes(current.type) : false;

  /* -------------------- 저장 -------------------- */

  const save = async (both: boolean) => {
    const el = cardRef.current;
    if (!el || busy) return;
    setBusy(true);
    setMessage("");
    setSelected(null);
    const wasSafe = showSafe;
    setShowSafe(false);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      let saved = 0;
      const shoot = async (label: string) => {
        const canvas = await captureCanvas(el, 8, true);
        const done = await saveBlob(
          await canvasToBlob(canvas),
          `명함_${label}.png`,
          { description: "PNG 이미지", mime: "image/png", extension: "png" },
        );
        if (done) saved += 1;
      };
      if (!both) {
        await shoot(side === "front" ? "앞면" : "뒷면");
      } else {
        for (const target of ["front", "back"] as const) {
          setSide(target);
          await new Promise((r) => setTimeout(r, 80));
          await shoot(target === "front" ? "앞면" : "뒷면");
        }
      }
      setMessage(
        saved > 0 ? `${saved}장을 저장했습니다.` : "저장을 취소했습니다.",
      );
    } catch {
      setMessage(
        "이미지를 만들지 못했습니다. 올린 로고 파일 크기를 줄여 보세요.",
      );
    } finally {
      setShowSafe(wasSafe);
      setBusy(false);
    }
  };

  /* -------------------- 패널 -------------------- */

  // 198종을 한 줄로 늘어놓으면 고를 수가 없어 갈래로 거릅니다.
  const visible = useMemo(
    () =>
      decoFilter === "all"
        ? CARD_TEMPLATES
        : CARD_TEMPLATES.filter((t) => t.group === decoFilter),
    [decoFilter],
  );

  const panel = (() => {
    if (section === "template")
      return (
        <>
          <PanelHead
            title="템플릿"
            note={`${CARD_TEMPLATES.length}종 · 색과 종이까지 함께 바뀝니다`}
            action={
              <select
                value={decoFilter}
                onChange={(e) => setDecoFilter(e.target.value)}
                className="ipt w-auto py-1 text-[0.6875rem]"
                aria-label="갈래로 거르기"
              >
                <option value="all">전체</option>
                {CARD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            }
          />
          <div className="grid grid-cols-3 gap-2.5">
            {visible.map((t) => (
              <button
                type="button"
                key={t.id}
                title={t.name}
                aria-pressed={template.id === t.id}
                onClick={() => applyTemplate(t)}
                className="pick"
              >
                <span
                  className="cthumb"
                  data-deco={t.deco}
                  data-align={t.placement.align}
                  style={
                    {
                      "--ac": t.accent,
                      "--bg": t.bg,
                      "--tx": t.text,
                      // 아트는 배경 사진을, 심플은 CSS 로 그린 면을 깝니다.
                      backgroundImage: t.art
                        ? `url(${asset("/" + t.art.url)})`
                        : undefined,
                      backgroundPosition: t.art?.position,
                      // 아틀라스는 4열 × 5행이라 한 칸이 카드 한 장 크기가 됩니다.
                      backgroundSize: t.art ? "400% 500%" : undefined,
                      background: t.surface,
                      borderColor: template.id === t.id ? "#8a6558" : undefined,
                      boxShadow:
                        template.id === t.id ? "0 0 0 2px #8a6558" : undefined,
                    } as React.CSSProperties
                  }
                >
                  <em />
                  <b />
                  <i />
                </span>
                <span className="pick-name">{t.name}</span>
              </button>
            ))}
          </div>
        </>
      );

    if (section === "content")
      return (
        <>
          <PanelHead
            title="내용"
            note="캔버스에서 글자를 두 번 눌러 바로 고칠 수도 있습니다."
          />
          <div className="space-y-3">
            {QUICK.map(([id, label]) => {
              const item = items.find(
                (i) => i.id === id && i.side === side,
              );
              if (!item) return null;
              return (
                <Field key={id} label={label}>
                  <input
                    className="ipt"
                    value={item.text}
                    onFocus={() => setSelected(item.id)}
                    onChange={(e) => patch(item.id, { text: e.target.value })}
                  />
                </Field>
              );
            })}
          </div>

          {current ? (
            <div className="mt-6 rounded-md border border-line bg-white p-4">
              <p className="mb-3 text-[0.75rem] text-ink">선택한 요소</p>
              {!isShape ? (
                <Field label="텍스트">
                  <input
                    className="ipt"
                    value={current.text}
                    onChange={(e) => patch(current.id, { text: e.target.value })}
                  />
                </Field>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="크기">
                  <input
                    type="range"
                    min={50}
                    max={200}
                    className="w-full"
                    value={current.size}
                    onChange={(e) => patch(current.id, { size: +e.target.value })}
                  />
                </Field>
                <Field label="글자색">
                  <input
                    type="color"
                    className="h-9 w-full cursor-pointer rounded-md border border-line bg-white"
                    value={current.color || colors.text}
                    onChange={(e) => patch(current.id, { color: e.target.value })}
                  />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ToolButton
                  onClick={() =>
                    patch(current.id, {
                      align: current.align === "center" ? "left" : "center",
                    })
                  }
                >
                  {current.align === "center" ? "왼쪽 정렬" : "가운데 정렬"}
                </ToolButton>
                <ToolButton
                  onClick={() => {
                    history.remember();
                    setItems((list) => list.filter((i) => i.id !== current.id));
                    setSelected(null);
                  }}
                >
                  삭제
                </ToolButton>
              </div>
            </div>
          ) : null}
        </>
      );

    if (section === "paper")
      return (
        <>
          <PanelHead title="종이와 색" note="포인트 색 하나만 정하는 편이 깔끔합니다." />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ["accent", "포인트"],
                  ["bg", "배경"],
                  ["text", "글자"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    type="color"
                    className="h-9 w-full cursor-pointer rounded-md border border-line bg-white"
                    value={colors[key]}
                    onChange={(e) =>
                      setColors({ ...colors, [key]: e.target.value })
                    }
                  />
                </Field>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="용지">
                <select
                  className="ipt"
                  value={paper}
                  onChange={(e) => setPaper(e.target.value as CardPaper)}
                >
                  {PAPER_LABEL.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="모서리">
                <select
                  className="ipt"
                  value={corner}
                  onChange={(e) => setCorner(e.target.value as CardCorner)}
                >
                  {CORNER_LABEL.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="글꼴">
              <select
                className="ipt"
                value={font}
                onChange={(e) => setFont(e.target.value as FontId)}
              >
                {FONT_GROUPS.map(({ group, fonts }) => (
                  <optgroup key={group} label={group}>
                    {fonts.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          </div>
        </>
      );

    if (section === "elements")
      return (
        <>
          <PanelHead
            title="요소 추가"
            note={`${side === "front" ? "앞면" : "뒷면"}에 올라갑니다.`}
          />
          <div className="space-y-4">
            <div className="flex gap-2">
              <select
                className="ipt"
                value={addType}
                onChange={(e) => setAddType(e.target.value)}
                aria-label="추가할 요소"
              >
                {ADDABLE.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-ghost btn-sm shrink-0"
                onClick={addItem}
              >
                ＋ 추가
              </button>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line bg-white px-3 py-3 text-[0.75rem] text-ink-soft transition-colors hover:border-rose">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => addImage(e.target.files?.[0])}
              />
              로고·이미지 올리기
              <span className="ml-auto text-[0.6875rem] text-hint">
                선명한 원본으로
              </span>
            </label>
            <label className="flex items-center gap-2 text-[0.75rem] text-ink-soft">
              <input
                type="checkbox"
                checked={showSafe}
                onChange={(e) => setShowSafe(e.target.checked)}
              />
              재단 안전선 보기 (사방 3mm)
            </label>
          </div>
        </>
      );

    return (
      <>
        <PanelHead title="저장" note="편집 내용은 이 브라우저에 자동 저장됩니다." />
        <div className="space-y-4">
          <p className="text-[0.8125rem] text-ink-soft">
            90 × 50 mm 실제 크기, 약 800dpi PNG 로 저장됩니다. 대부분의 온라인
            인쇄소에 그대로 넘길 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => save(false)}
              disabled={busy}
            >
              {side === "front" ? "앞면" : "뒷면"}만 저장
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => save(true)}
              disabled={busy}
            >
              앞뒤 모두 저장
            </button>
          </div>
          {message ? (
            <p className="text-[0.75rem] text-rose-deep">{message}</p>
          ) : null}

          <p className="text-[0.75rem] text-muted">
            입력한 연락처는 서버로 보내지 않고 이 브라우저 안에서만 처리됩니다.
          </p>

          {/* 되돌릴 수 없는 동작이라 한 번 더 묻습니다. */}
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.75rem] text-ink">
                만든 내용이 모두 지워집니다. 계속할까요?
              </span>
              <ToolButton
                onClick={() => {
                  clearDraft(KEY);
                  setItems(SAMPLE_ITEMS);
                  setSelected(null);
                  setConfirmReset(false);
                  setMessage("처음 상태로 되돌렸습니다.");
                }}
              >
                네, 지웁니다
              </ToolButton>
              <ToolButton onClick={() => setConfirmReset(false)}>취소</ToolButton>
            </div>
          ) : (
            <ToolButton onClick={() => setConfirmReset(true)}>
              처음부터 다시 만들기
            </ToolButton>
          )}
        </div>
      </>
    );
  })();

  return (
    <StudioShell
      sections={SECTIONS}
      active={section}
      onSelect={setSection}
      panel={panel}
      previewTitle="명함 미리보기"
      previewNote="90 × 50 mm"
      actions={
        <button
          type="button"
          className="rounded-md bg-ink px-4 py-2 text-[0.75rem] text-ivory transition-transform active:translate-y-px disabled:opacity-50"
          onClick={() => save(false)}
          disabled={busy}
        >
          {busy ? "만드는 중…" : `${side === "front" ? "앞면" : "뒷면"} 저장`}
        </button>
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-ivory px-3 py-2">
          <div className="flex rounded-full bg-cream p-0.5">
            {(["front", "back"] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setSide(value);
                  setSelected(null);
                }}
                aria-pressed={side === value}
                className={`rounded-full px-3.5 py-1 text-[0.75rem] transition-colors ${
                  side === value
                    ? "bg-white text-ink shadow-soft"
                    : "text-muted hover:text-ink"
                }`}
              >
                {value === "front" ? "앞면" : "뒷면"}
              </button>
            ))}
          </div>
          <span className="mr-auto text-[0.6875rem] text-muted">
            요소를 끌어서 옮기고, 두 번 눌러 글자를 고칩니다
          </span>
          <ToolButton disabled={!history.canUndo} onClick={history.undo}>
            ↶ 되돌리기
          </ToolButton>
          <ToolButton disabled={!history.canRedo} onClick={history.redo}>
            ↷ 다시
          </ToolButton>
        </div>
      }
    >
      <div ref={stageRef} className="grid h-full place-items-center py-4">
        <div
          style={{
            width: stage.width,
            height: stage.height,
            filter: "drop-shadow(0 12px 26px rgb(46 42 39 / 0.18))",
          }}
        >
          <div
            data-fit
            style={{
              transform: `scale(${stage.scale})`,
              transformOrigin: "top left",
              width: 90 * MM,
              height: 50 * MM,
            }}
          >
            <article
              ref={cardRef}
              className="card"
              data-paper={paper}
              data-corner={corner}
              data-deco={template.deco}
              style={
                {
                  "--ac": colors.accent,
                  "--bg": colors.bg,
                  "--tx": colors.text,
                  fontFamily: fontStack(font),
                } as React.CSSProperties
              }
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) setSelected(null);
              }}
            >
              {/* 배경 사진·CSS 면은 글자 아래 별도 층에 깔아, 색을 바꿔도
                  배경이 지워지지 않게 합니다. 뒷면에는 깔지 않습니다. */}
              {side === "front" && (template.art || template.surface) && (
                <span
                  className="card-art"
                  style={
                    template.art
                      ? {
                          backgroundImage: `url(${asset("/" + template.art.url)})`,
                          backgroundPosition: template.art.position,
                          backgroundSize: "400% 500%",
                        }
                      : { background: template.surface }
                  }
                />
              )}
              <span className="card-deco" />
              {showSafe ? <span className="card-safe" /> : null}
              {items
                .filter((item) => item.side === side)
                .map((item) => {
                  const shape = SHAPE_TYPES.includes(item.type);
                  const centered = item.align === "center";
                  return (
                    <div
                      key={item.id}
                      className={`card-el el-${item.type} ${
                        selected === item.id ? "is-on" : ""
                      }`}
                      data-align={item.align ?? "left"}
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        transform: `${centered ? "translateX(-50%) " : ""}scale(${
                          item.size / 100
                        })`,
                        color: item.color || undefined,
                      }}
                      onPointerDown={(e) => onItemPointerDown(e, item)}
                      onClick={() => setSelected(item.id)}
                      tabIndex={0}
                      role={shape ? "button" : "textbox"}
                      aria-label={
                        shape ? `${item.type} 요소` : `${item.text || "빈 텍스트"} 편집`
                      }
                      contentEditable={!shape}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const text = e.currentTarget.textContent ?? "";
                        if (text === item.text) return;
                        history.remember();
                        patch(item.id, { text });
                      }}
                    >
                      {item.type === "image" && item.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.src} alt="올린 이미지" />
                      ) : shape ? null : (
                        item.text
                      )}
                    </div>
                  );
                })}
            </article>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
