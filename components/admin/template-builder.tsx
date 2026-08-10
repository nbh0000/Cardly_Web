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
import { useRef, useState, useSyncExternalStore } from "react";
import { InvitationView } from "@/components/invitation/invitation-view";
import {
  isIdTaken,
  loadStoredTemplates,
  saveCustomTemplates,
} from "@/lib/custom-templates";
import {
  canWrite,
  dropTemplate,
  putTemplate,
  storeMode,
  useTemplates,
} from "@/lib/template-store";
import { signIn, signOut } from "@/lib/supabase";
import { extractFromFigma, type FigmaExtract } from "@/lib/figma-css";
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

/** 값이 바뀌지 않는 스토어 — 최초 스냅샷만 필요할 때 씁니다. */
const subscribeNever = () => () => {};

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
  const { templates: custom, reload } = useTemplates();
  const [draft, setDraft] = useState<Template>(emptyTemplate);
  /** 편집 중인 기존 템플릿의 id — 새로 만드는 중이면 null */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  /* 저장 위치가 DB 인지 이 브라우저인지.
     mode 는 빌드 시점에 정해지는 환경변수라 서버·클라이언트가 같습니다.
     로그인 여부는 localStorage 라 서버에서 알 수 없으므로, 서버 스냅샷은
     "아직 못 쓴다"로 두고 브라우저에서 실제 값을 읽습니다. */
  const mode = storeMode();
  const initialWritable = useSyncExternalStore(
    subscribeNever,
    canWrite,
    () => mode === "local",
  );
  const [authed, setAuthed] = useState<boolean | null>(null);
  const writable = authed ?? initialWritable;
  const setWritable = (v: boolean) => setAuthed(v);

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
  const idClash = !!id && isIdTaken(id, custom, editingId ?? undefined);
  const canSave = !nameMissing && !idClash && writable;

  const save = async () => {
    if (!canSave) return;
    // 한글 이름만 넣은 경우 슬러그가 비므로 여기서 붙입니다.
    const finalId = id || `custom-${Date.now().toString(36)}`;
    const next: Template = { ...draft, id: finalId, custom: true };
    try {
      // id 를 바꿔 저장하면 예전 id 의 찌꺼기가 남으므로 먼저 지웁니다.
      if (editingId && editingId !== finalId) await dropTemplate(editingId);
      await putTemplate(next);
    } catch (e) {
      setNotice(`저장하지 못했습니다 — ${(e as Error).message}`);
      return;
    }
    setEditingId(finalId);
    setDraft(next);
    reload();
    setNotice(
      mode === "db"
        ? `'${next.name}' 저장했습니다. 모든 방문자에게 바로 보입니다.`
        : `'${next.name}' 저장했습니다. 이 브라우저의 템플릿 목록에 보입니다.`,
    );
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

  const remove = async (t: Template) => {
    try {
      await dropTemplate(t.id);
    } catch (e) {
      setNotice(`삭제하지 못했습니다 — ${(e as Error).message}`);
      return;
    }
    if (editingId === t.id) startNew();
    reload();
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
        <StoreStatus
          mode={mode}
          writable={writable}
          onAuthChange={() => {
            setWritable(canWrite());
            reload();
          }}
        />

        <FigmaImport
          onApply={(next) =>
            setDraft((d) => ({
              ...d,
              theme: next.theme ?? d.theme,
              headingFont: next.headingFont ?? d.headingFont,
            }))
          }
        />

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

/* ---------------- 저장 위치 ---------------- */

/**
 * 지금 저장이 어디로 가는지 알려주고, DB 모드면 관리자 로그인을 받습니다.
 *
 * anon 키만으로는 테이블에 쓸 수 없도록 RLS 를 걸어 두었기 때문에
 * (supabase/schema.sql), 저장하려면 로그인이 필요합니다.
 */
function StoreStatus({
  mode,
  writable,
  onAuthChange,
}: {
  mode: "db" | "local";
  writable: boolean;
  onAuthChange: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (mode === "local") {
    return (
      <div className="rounded-lg border border-line bg-white p-5 text-[0.8125rem] leading-relaxed text-ink-soft">
        <b className="text-ink">저장 위치 · 이 브라우저</b>
        <p className="mt-1.5">
          지금은 만든 템플릿이 이 브라우저에만 남습니다. 데이터베이스를 연결하면
          저장하는 즉시 모든 방문자에게 반영됩니다 —{" "}
          <code className="rounded bg-cream px-1.5 py-0.5 text-[0.75rem]">
            supabase/schema.sql
          </code>{" "}
          의 안내를 따르세요.
        </p>
      </div>
    );
  }

  if (writable) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white p-5 text-[0.8125rem] text-ink-soft">
        <b className="text-ink">저장 위치 · 데이터베이스</b>
        <span>관리자로 로그인되어 있습니다. 저장하면 바로 반영됩니다.</span>
        <button
          type="button"
          onClick={() => {
            signOut();
            onAuthChange();
          }}
          className="ml-auto rounded-full border border-line px-3 py-1.5 text-[0.75rem] hover:border-rose"
        >
          로그아웃
        </button>
      </div>
    );
  }

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim(), password);
      setPassword("");
      onAuthChange();
    } catch (e) {
      setError(`로그인하지 못했습니다 — ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="관리자 로그인">
      <p className="text-[0.8125rem] leading-relaxed text-ink-soft">
        데이터베이스가 연결되어 있습니다. 템플릿을 저장하려면 로그인하세요.
        계정은 Supabase 대시보드의 Authentication &gt; Users 에서 만듭니다.
      </p>
      <Row label="이메일">
        <input
          className="ipt"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Row>
      <Row label="비밀번호">
        <input
          className="ipt"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
        />
      </Row>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={busy || !email || !password}
          className="rounded-full bg-ink px-5 py-2.5 text-[0.8125rem] text-ivory disabled:opacity-40"
        >
          {busy ? "확인 중…" : "로그인"}
        </button>
        {error && <span className="text-[0.75rem] text-rose-deep">{error}</span>}
      </div>
    </Panel>
  );
}

/* ---------------- 피그마에서 가져오기 ---------------- */

/**
 * 피그마 Dev Mode 의 'Copy as code' 결과를 붙여넣으면 색과 글꼴을 뽑아
 * 아래 항목들을 채웁니다.
 *
 * 배치(좌표)는 가져오지 않습니다. 이 코드베이스의 커버는 절대 좌표가 아니라
 * 커버 레이아웃 10종 중 하나 + 테마 변수로 그려지기 때문입니다. 좌표를 그대로
 * 옮기면 글자 크기 조절·다크 테마·반응형이 전부 깨집니다.
 */
function FigmaImport({ onApply }: { onApply: (r: FigmaExtract) => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<FigmaExtract | null>(null);

  const parse = (value: string) => {
    setText(value);
    setResult(value.trim() ? extractFromFigma(value) : null);
  };

  const apply = () => {
    if (result?.theme) onApply(result);
  };

  return (
    <Panel title="피그마에서 가져오기">
      <Row
        label="Dev Mode 코드 붙여넣기"
        hint="피그마에서 프레임 선택 → Dev Mode → Copy as code. CSS·React 어느 쪽이든 됩니다."
      >
        <textarea
          className="ipt font-mono"
          rows={5}
          value={text}
          onChange={(e) => parse(e.target.value)}
          placeholder={"background: #F4C6CE;\ncolor: #2B1F23;\nfont-family: Playfair Display;"}
        />
      </Row>

      {result && (
        <>
          <Row label={`찾은 색 ${result.colors.length}개`}>
            <div className="flex flex-wrap gap-1.5">
              {result.colors.slice(0, 12).map((c) => (
                <span
                  key={c.hex}
                  title={`${c.hex} · ${c.count}회`}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pr-2.5 pl-1.5 text-[0.6875rem] text-ink-soft"
                >
                  <span
                    className="h-4 w-4 rounded-full ring-1 ring-line"
                    style={{ background: c.hex }}
                  />
                  {c.hex}
                </span>
              ))}
            </div>
          </Row>

          {result.fontFamily && (
            <p className="text-[0.75rem] text-muted">
              글꼴 <b className="text-ink">{result.fontFamily}</b> →{" "}
              {result.headingFont === "serif" ? "명조" : "고딕"}으로 봅니다.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={apply}
              disabled={!result.theme}
              className="rounded-full bg-ink px-5 py-2.5 text-[0.8125rem] text-ivory disabled:opacity-40"
            >
              색·글꼴 적용하기
            </button>
            {!result.theme && (
              <span className="text-[0.75rem] text-muted">
                색이 두 개 이상 있어야 배치할 수 있습니다.
              </span>
            )}
          </div>

          <p className="text-[0.6875rem] leading-relaxed text-muted">
            배치(좌표)는 가져오지 않습니다. 커버 모양은 아래 &lsquo;커버
            레이아웃&rsquo;에서 고르시고, 원하는 구성이 목록에 없으면 프레임
            이미지를 주시면 새로 만들어 드립니다.
          </p>
        </>
      )}
    </Panel>
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
