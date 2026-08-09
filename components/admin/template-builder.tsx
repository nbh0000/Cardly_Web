"use client";

/**
 * 관리자용 템플릿 제작 화면.
 *
 * 정적 호스팅이라 서버에 올릴 곳이 없으므로 저장은 두 갈래입니다.
 *   · 이 브라우저에 저장 — 바로 템플릿 목록·편집기에 반영됩니다.
 *   · JSON 내보내기 — lib/published-templates.json 에 넣고 커밋하면
 *     빌드에 포함되어 모든 방문자에게 배포됩니다.
 */

import Link from "next/link";
import { useRef, useState } from "react";
import { InvitationView } from "@/components/invitation/invitation-view";
import {
  isIdTaken,
  loadStoredTemplates,
  removeCustomTemplate,
  saveCustomTemplates,
  upsertCustomTemplate,
  useCustomTemplates,
} from "@/lib/custom-templates";
import {
  CATEGORY_LABELS,
  COVER_LAYOUTS,
  createDefaultData,
  FONT_OPTIONS,
  PHOTO_TONES,
  type CoverLayout,
  type HeadingFont,
  type PhotoTone,
  type Template,
  type TemplateCategory,
} from "@/lib/invitation";

const CATEGORIES: TemplateCategory[] = [
  "minimal",
  "floral",
  "modern",
  "classic",
  "photo",
];

/** 색 다섯 개를 한 번에 채우는 출발점 */
const PALETTES: { label: string; theme: Template["theme"] }[] = [
  {
    label: "아이보리",
    theme: { bg: "#FBF8F3", ink: "#2E2A27", sub: "#EFE7DC", accent: "#B08D80", accentSoft: "#F1E5DF" },
  },
  {
    label: "블러시",
    theme: { bg: "#F4C6CE", ink: "#2B1F23", sub: "#EBB0BA", accent: "#D01F3C", accentSoft: "#FADDE2" },
  },
  {
    label: "버건디",
    theme: { bg: "#5E1220", ink: "#F6E9DA", sub: "#7A2231", accent: "#E0BE8A", accentSoft: "#732033" },
  },
  {
    label: "세이지",
    theme: { bg: "#8FA391", ink: "#FFFFFF", sub: "#7B9080", accent: "#FFFFFF", accentSoft: "#A6B7A6" },
  },
  {
    label: "차콜",
    theme: { bg: "#141414", ink: "#F4F2EE", sub: "#242424", accent: "#CFC6B8", accentSoft: "#2C2C2C" },
  },
  {
    label: "스카이",
    theme: { bg: "#DCE5EC", ink: "#1F2A33", sub: "#C6D4DF", accent: "#4A6D89", accentSoft: "#E9F0F5" },
  },
];

const COLOR_FIELDS: { key: keyof Template["theme"]; label: string; hint: string }[] = [
  { key: "bg", label: "배경", hint: "청첩장 바탕색" },
  { key: "ink", label: "글자", hint: "본문·이름 색" },
  { key: "sub", label: "보조", hint: "사진 자리·구분선" },
  { key: "accent", label: "포인트", hint: "필기체·강조" },
  { key: "accentSoft", label: "포인트 옅게", hint: "컬러밴드 배경" },
];

function emptyTemplate(): Template {
  return {
    id: "",
    name: "",
    categories: ["minimal"],
    coverLayout: "center",
    headingFont: "serif",
    photoTone: "none",
    script: "Save the date",
    eyebrow: "WE ARE GETTING MARRIED",
    photoSeed: 0,
    theme: { ...PALETTES[0]!.theme },
  };
}

/**
 * 이름에서 주소에 쓸 id 를 만듭니다. 한글만 있는 이름이면 빈 문자열이 되고,
 * 그때는 저장하는 순간에 시각 기반 id 를 붙입니다.
 * (렌더 중에 Math.random 을 쓰면 서버와 클라이언트의 값이 달라
 *  hydration 이 어긋나므로, 무작위 값은 이벤트 안에서만 만듭니다.)
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 업로드한 사진을 캔버스로 줄여 data URL 로 만듭니다.
 * localStorage 는 몇 MB 밖에 안 되고 원본 사진은 수 MB 라, 줄이지 않으면
 * 템플릿 두어 개만 저장해도 용량이 찹니다.
 */
async function toCompactDataUrl(file: File, maxW = 900): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function TemplateBuilder() {
  const custom = useCustomTemplates();
  const [draft, setDraft] = useState<Template>(emptyTemplate);
  /** 편집 중인 기존 템플릿의 id — 새로 만드는 중이면 null */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Template>(key: K, value: Template[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setColor = (key: keyof Template["theme"], value: string) =>
    setDraft((d) => ({ ...d, theme: { ...d.theme, [key]: value } }));

  const toggleCategory = (c: TemplateCategory) =>
    setDraft((d) => {
      const on = d.categories.includes(c);
      // 최소 한 개는 남겨 둡니다 — 카테고리가 없으면 목록 필터에서 사라집니다.
      if (on && d.categories.length === 1) return d;
      return {
        ...d,
        categories: on
          ? d.categories.filter((x) => x !== c)
          : [...d.categories, c],
      };
    });

  const autoId = slugify(draft.name);
  const id = draft.id.trim() || autoId;
  const nameMissing = !draft.name.trim();
  const idClash = !!id && isIdTaken(id, editingId ?? undefined);
  const canSave = !nameMissing && !idClash;

  const save = () => {
    if (!canSave) return;
    // 한글 이름만 넣은 경우 슬러그가 비므로 여기서 붙입니다.
    const finalId = id || `custom-${Date.now().toString(36)}`;
    const next: Template = { ...draft, id: finalId, custom: true };
    // id 를 바꿔 저장하면 예전 id 의 찌꺼기가 남으므로 먼저 지웁니다.
    if (editingId && editingId !== finalId) removeCustomTemplate(editingId);
    upsertCustomTemplate(next);
    setEditingId(finalId);
    setDraft(next);
    setNotice(`'${next.name}' 저장했습니다. 템플릿 목록에서 바로 보입니다.`);
  };

  const startNew = () => {
    setDraft(emptyTemplate());
    setEditingId(null);
    setNotice("");
  };

  const edit = (t: Template) => {
    setDraft({ ...t });
    setEditingId(t.id);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (t: Template) => {
    removeCustomTemplate(t.id);
    if (editingId === t.id) startNew();
    setNotice(`'${t.name}' 삭제했습니다.`);
  };

  const exportJson = () => {
    const list = loadStoredTemplates();
    const blob = new Blob([JSON.stringify(list, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "published-templates.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice(
      `${list.length}개를 내려받았습니다. lib/published-templates.json 에 넣고 커밋하면 모든 방문자에게 배포됩니다.`,
    );
  };

  const importJson = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error("배열이 아닙니다");
      saveCustomTemplates(parsed as Template[]);
      setNotice(`${parsed.length}개를 불러왔습니다.`);
    } catch {
      setNotice("JSON 을 읽지 못했습니다. 내보낸 파일이 맞는지 확인해 주세요.");
    }
  };

  const previewData = {
    ...createDefaultData("linen"),
    templateId: id || "preview",
    coverLayout: draft.coverLayout,
    headingFont: draft.headingFont,
    photoTone: draft.photoTone,
    photoSeed: draft.photoSeed,
    coverScript: draft.script,
    coverEyebrow: draft.eyebrow ?? "WE ARE GETTING MARRIED",
    coverPhoto: draft.samplePhoto,
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
      {/* ---------------- 입력 ---------------- */}
      <div className="grid gap-7">
        <Panel title="기본 정보">
          <Row label="템플릿 이름" hint="목록에 보이는 이름입니다.">
            <input
              className="ipt"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="예: 라벤더 노트"
            />
          </Row>
          <Row
            label="아이디"
            hint={
              idClash
                ? "이미 쓰고 있는 아이디입니다."
                : "주소에 쓰입니다. 비우면 이름에서 자동으로 만듭니다."
            }
            invalid={idClash}
          >
            <input
              className="ipt"
              value={draft.id}
              onChange={(e) => set("id", e.target.value)}
              placeholder={autoId || "저장할 때 자동으로 만듭니다"}
            />
          </Row>
          <Row label="카테고리" hint="목록 필터에 쓰입니다. 여러 개 고를 수 있습니다.">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const on = draft.categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    aria-pressed={on}
                    className={`rounded-full border px-3 py-1.5 text-[0.75rem] transition-colors ${
                      on
                        ? "border-rose-deep bg-rose-deep text-white"
                        : "border-line bg-white text-ink-soft hover:border-rose"
                    }`}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                );
              })}
            </div>
          </Row>
          <Row label="배지" hint="목록 카드 왼쪽 위에 붙는 라벨입니다.">
            <Chips
              options={[
                { id: "none", label: "없음" },
                { id: "NEW", label: "NEW" },
                { id: "BEST", label: "BEST" },
              ]}
              value={draft.badge ?? "none"}
              onChange={(v) =>
                set("badge", v === "none" ? undefined : (v as "NEW" | "BEST"))
              }
            />
          </Row>
        </Panel>

        <Panel title="커버 디자인">
          <Row label="커버 레이아웃">
            <Chips
              options={COVER_LAYOUTS}
              value={draft.coverLayout}
              onChange={(v) => set("coverLayout", v as CoverLayout)}
            />
          </Row>
          <Row label="제목 글꼴">
            <Chips
              options={FONT_OPTIONS.map((f) => ({ id: f.id, label: f.label }))}
              value={draft.headingFont}
              onChange={(v) => set("headingFont", v as HeadingFont)}
            />
          </Row>
          <Row label="사진 톤" hint="커버와 갤러리 사진 전체에 걸립니다.">
            <Chips
              options={PHOTO_TONES}
              value={draft.photoTone}
              onChange={(v) => set("photoTone", v as PhotoTone)}
            />
          </Row>
          <Row label="영문 필기체 문구">
            <input
              className="ipt"
              value={draft.script}
              onChange={(e) => set("script", e.target.value)}
              placeholder="Save the date"
            />
          </Row>
          <Row label="상단 문구">
            <input
              className="ipt"
              value={draft.eyebrow ?? ""}
              onChange={(e) => set("eyebrow", e.target.value)}
              placeholder="WE ARE GETTING MARRIED"
            />
          </Row>
        </Panel>

        <Panel title="대표 사진">
          <Row
            label="사진 올리기"
            hint="올리지 않으면 아래 번호의 기본 샘플 사진이 깔립니다."
          >
            <div className="flex items-center gap-3">
              <div className="h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-sm bg-sand ring-1 ring-line">
                {draft.samplePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.samplePhoto}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center text-[0.625rem] text-hint">
                    없음
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-[0.75rem] text-ink hover:border-rose"
                >
                  사진 선택
                </button>
                {draft.samplePhoto && (
                  <button
                    type="button"
                    onClick={() => set("samplePhoto", undefined)}
                    className="text-[0.6875rem] text-muted underline"
                  >
                    지우기
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) set("samplePhoto", await toCompactDataUrl(f));
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </Row>
          <Row
            label={`기본 샘플 사진 · ${draft.photoSeed + 1}번`}
            hint="사진을 올리지 않았을 때 쓰이는 내장 사진입니다."
          >
            <input
              type="range"
              min={0}
              max={21}
              value={draft.photoSeed}
              onChange={(e) => set("photoSeed", Number(e.target.value))}
              className="w-full accent-rose-deep"
            />
          </Row>
        </Panel>

        <Panel title="색상">
          <Row label="팔레트에서 시작" hint="다섯 색을 한 번에 채웁니다.">
            <div className="flex flex-wrap gap-1.5">
              {PALETTES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => set("theme", { ...p.theme })}
                  className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pr-3 pl-1.5 text-[0.75rem] text-ink-soft hover:border-rose"
                >
                  <span
                    className="h-4 w-4 rounded-full ring-1 ring-line"
                    style={{ background: p.theme.accent }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </Row>
          {COLOR_FIELDS.map((f) => (
            <Row key={f.key} label={f.label} hint={f.hint}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.theme[f.key]}
                  onChange={(e) => setColor(f.key, e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-sm border border-line bg-white p-1"
                />
                <input
                  className="ipt font-mono"
                  value={draft.theme[f.key]}
                  onChange={(e) => setColor(f.key, e.target.value)}
                />
              </div>
            </Row>
          ))}
        </Panel>

        {/* ---------------- 저장 ---------------- */}
        <div className="grid gap-3 rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className="rounded-full bg-rose-deep px-5 py-2.5 text-[0.8125rem] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {editingId ? "변경사항 저장" : "이 브라우저에 저장"}
            </button>
            <button
              type="button"
              onClick={startNew}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-[0.8125rem] text-ink hover:border-rose"
            >
              새로 만들기
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-[0.8125rem] text-ink hover:border-rose"
            >
              JSON 내보내기
            </button>
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-[0.8125rem] text-ink hover:border-rose"
            >
              JSON 불러오기
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await importJson(f);
                e.target.value = "";
              }}
            />
          </div>
          {nameMissing && (
            <p className="text-[0.75rem] text-muted">
              템플릿 이름을 입력하면 저장할 수 있습니다.
            </p>
          )}
          {notice && (
            <p className="text-[0.75rem] text-rose-deep">{notice}</p>
          )}
        </div>

        {/* ---------------- 저장된 템플릿 ---------------- */}
        <Panel title={`내가 만든 템플릿 · ${custom.length}개`}>
          {custom.length === 0 ? (
            <p className="text-[0.8125rem] text-muted">
              아직 없습니다. 위에서 만들어 저장해 보세요.
            </p>
          ) : (
            <ul className="grid gap-2">
              {custom.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-md border border-line bg-white p-2.5"
                >
                  <span
                    className="h-11 w-9 shrink-0 overflow-hidden rounded-sm ring-1 ring-line"
                    style={{ background: t.theme.bg }}
                  >
                    {t.samplePhoto && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.samplePhoto}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-[0.875rem] text-ink">
                      {t.name}
                    </span>
                    <span className="block truncate text-[0.6875rem] tracking-wide text-hint uppercase">
                      {t.id}
                    </span>
                  </span>
                  <Link
                    href={`/editor/custom/?id=${encodeURIComponent(t.id)}`}
                    className="rounded-full border border-line px-3 py-1.5 text-[0.75rem] text-ink-soft hover:border-rose"
                  >
                    편집기
                  </Link>
                  <button
                    type="button"
                    onClick={() => edit(t)}
                    className="rounded-full border border-line px-3 py-1.5 text-[0.75rem] text-ink-soft hover:border-rose"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(t)}
                    className="rounded-full border border-line px-3 py-1.5 text-[0.75rem] text-muted hover:border-rose-deep hover:text-rose-deep"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* ---------------- 미리보기 ---------------- */}
      <aside className="lg:sticky lg:top-28">
        <p className="mb-3 text-[0.75rem] tracking-[0.12em] text-hint uppercase">
          Live preview
        </p>
        <div className="iv-stage overflow-hidden rounded-phone bg-white p-2 shadow-lift ring-1 ring-line">
          <div className="h-[34rem] overflow-y-auto overscroll-contain rounded-[1.5rem]">
            <InvitationView
              template={{ ...draft, id: id || "preview" }}
              data={previewData}
              live={false}
            />
          </div>
        </div>
        <p className="mt-3 text-[0.75rem] text-muted">
          입력하는 대로 바로 반영됩니다. 스크롤해서 아래 섹션까지 확인해 보세요.
        </p>
      </aside>
    </div>
  );
}

/* ---------------- 작은 조각들 ---------------- */

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft sm:p-6">
      <h2 className="font-serif text-[1.0625rem] text-ink">{title}</h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  invalid,
  children,
}: {
  label: string;
  hint?: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[0.8125rem] text-ink">{label}</span>
      {children}
      {hint && (
        <span
          className={`text-[0.6875rem] ${invalid ? "text-rose-deep" : "text-muted"}`}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={o.id === value}
          className={`rounded-full border px-3 py-1.5 text-[0.75rem] transition-colors ${
            o.id === value
              ? "border-rose-deep bg-rose-deep text-white"
              : "border-line bg-white text-ink-soft hover:border-rose"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
