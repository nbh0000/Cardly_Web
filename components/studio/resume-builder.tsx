"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type FontId,
  fontFamily,
  fontGroupsFor,
  fontStack,
  toFontId,
} from "@/lib/fonts";
import {
  canvasToBlob,
  captureCanvas,
  escapeHtml,
  readImageFile,
  saveBlob,
  sheetToPdfBlob,
} from "@/lib/studio/export";
import {
  DEFAULT_RESUME_TEMPLATE,
  ENTRY_FIELD_LABEL,
  ENTRY_SECTIONS,
  type EntrySection,
  emptyEntry,
  RESUME_BLOCK_LABEL,
  RESUME_BLOCKS,
  RESUME_TEMPLATES,
  type ResumeBlockId,
  type ResumeData,
  type ResumeTemplate,
  SAMPLE_RESUME,
  SECTION_HEADING,
} from "@/lib/studio/resume-templates";
import { clearDraft } from "@/lib/studio/storage";
import {
  Field,
  MM,
  ToolButton,
  useDraft,
  usePointerDrag,
  useStageFit,
} from "./kit";
import {
  type BlockLayout,
  EMPTY_BLOCK,
  type ResumeLayout,
  ResumeSheet,
} from "./resume-sheet";
import { ICON, PanelHead, StudioShell, type StudioSection } from "./shell";

const KEY = "cardly-resume-v2";

/* 이력서는 장식 글꼴을 내보내지 않습니다 — 읽는 사람이 서류로 보는 문서라
   또렷한 고딕·명조만 고를 수 있게 둡니다. */
const FONT_GROUPS = fontGroupsFor("resume");

/**
 * 저장 형식. 지원처가 요구하는 형식이 제각각이라 다섯 가지를 모두 둡니다.
 * PDF·이미지는 지금 보고 있는 A4 조판을 그대로 뜨고, Word·HTML·TXT 는
 * 입력한 글을 문서로 다시 짭니다. TXT 는 채용 시스템이 기계로 읽는 경우에
 * 씁니다 — 조판은 사라지지만 글자는 확실히 전달됩니다.
 */
const FORMATS: [string, string, string, string][] = [
  ["pdf", "PDF 문서", "application/pdf", "pdf"],
  ["docx", "Word 문서", "application/msword", "doc"],
  ["html", "HTML 문서", "text/html", "html"],
  ["txt", "텍스트 문서", "text/plain", "txt"],
  ["png", "이미지", "image/png", "png"],
];

const SECTIONS: StudioSection[] = [
  { id: "template", label: "템플릿", icon: ICON.template },
  { id: "person", label: "인적사항", icon: ICON.person },
  { id: "experience", label: "경력", icon: ICON.work },
  { id: "projects", label: "프로젝트", icon: ICON.project },
  { id: "education", label: "학력", icon: ICON.school },
  { id: "certificates", label: "자격·어학", icon: ICON.badge },
  { id: "skills", label: "기술", icon: ICON.skills },
  { id: "save", label: "저장", icon: ICON.save },
];

function blankLayout(): ResumeLayout {
  return Object.fromEntries(
    RESUME_BLOCKS.map((id) => [id, { ...EMPTY_BLOCK }]),
  ) as ResumeLayout;
}

type Draft = {
  templateId: string;
  font: string;
  photo: string;
  layout: ResumeLayout;
  data: ResumeData;
};

export function ResumeBuilder() {
  const sheetRef = useRef<HTMLElement>(null);
  const [section, setSection] = useState("template");
  const [template, setTemplate] = useState<ResumeTemplate>(
    DEFAULT_RESUME_TEMPLATE,
  );
  const [font, setFont] = useState<FontId>("sans");
  const [photo, setPhoto] = useState("");
  const [layout, setLayout] = useState<ResumeLayout>(blankLayout);
  const [data, setData] = useState<ResumeData>(SAMPLE_RESUME);
  const [selected, setSelected] = useState<ResumeBlockId | null>(null);
  const [format, setFormat] = useState("pdf");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [layoutFilter, setLayoutFilter] = useState("all");

  // 좁은 화면에서는 0.55 배 아래로 줄이지 않고 가로로 스크롤해서 봅니다.
  const [stageRef, stage] = useStageFit(210, 297, {
    maxScale: 1,
    minScale: 0.55,
    padding: 32,
  });

  const restore = useCallback((draft: Draft) => {
    const found = RESUME_TEMPLATES.find((t) => t.id === draft.templateId);
    if (found) setTemplate(found);
    if (draft.font) setFont(toFontId(draft.font));
    if (typeof draft.photo === "string") setPhoto(draft.photo);
    if (draft.layout) setLayout({ ...blankLayout(), ...draft.layout });
    if (draft.data) setData({ ...SAMPLE_RESUME, ...draft.data });
  }, []);

  const snapshot: Draft = useMemo(
    () => ({ templateId: template.id, font, photo, layout, data }),
    [template.id, font, photo, layout, data],
  );
  useDraft<Draft>(KEY, snapshot, restore);

  /* 시트는 A4 한 장에 고정돼 있어 넘친 내용은 잘립니다.
     조판이 끝난 다음 프레임에 재어 보고 미리 알려 줍니다. */
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() =>
      setOverflow(el.scrollHeight > el.clientHeight + 2),
    );
    return () => cancelAnimationFrame(id);
  }, [data, layout, template, photo, font]);

  /* -------------------- 블록 이동 -------------------- */

  const patchBlock = useCallback(
    (id: ResumeBlockId, patch: Partial<BlockLayout>) =>
      setLayout((current) => ({
        ...current,
        [id]: { ...(current[id] ?? EMPTY_BLOCK), ...patch },
      })),
    [],
  );

  const dragOrigin = useRef<{ id: ResumeBlockId; x: number; y: number } | null>(
    null,
  );

  const startDrag = usePointerDrag({
    boundsRef: sheetRef as React.RefObject<HTMLElement | null>,
    onMove: (dx, dy) => {
      const origin = dragOrigin.current;
      if (!origin) return;
      patchBlock(origin.id, {
        x: Math.max(-35, Math.min(35, origin.x + dx)),
        y: Math.max(-35, Math.min(35, origin.y + dy)),
      });
    },
  });

  const onBlockPointerDown = (e: React.PointerEvent, id: ResumeBlockId) => {
    const spot = layout[id] ?? EMPTY_BLOCK;
    dragOrigin.current = { id, x: spot.x, y: spot.y };
    setSelected(id);
    startDrag(e);
  };

  /* -------------------- 항목 편집 -------------------- */

  const patchEntry = (
    key: EntrySection,
    id: string,
    patch: Partial<{ org: string; role: string; period: string; bullets: string }>,
  ) =>
    setData((d) => ({
      ...d,
      [key]: d[key].map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const addEntry = (key: EntrySection) =>
    setData((d) => ({
      ...d,
      [key]: [...d[key], emptyEntry(`${key}-${Date.now().toString(36)}`)],
    }));

  const removeEntry = (key: EntrySection, id: string) =>
    setData((d) => ({ ...d, [key]: d[key].filter((e) => e.id !== id) }));

  const moveEntry = (key: EntrySection, index: number, delta: number) =>
    setData((d) => {
      const list = [...d[key]];
      const next = index + delta;
      if (next < 0 || next >= list.length) return d;
      [list[index], list[next]] = [list[next], list[index]];
      return { ...d, [key]: list };
    });

  /* -------------------- 완성도 -------------------- */

  const { score, advice } = useMemo(() => {
    const bullets = data.experience
      .concat(data.projects)
      .flatMap((e) => e.bullets.split("\n"))
      .filter((l) => l.trim());
    const withNumbers = bullets.filter((l) => /\d/.test(l)).length;

    const value = Math.min(
      100,
      (data.name.trim() ? 8 : 0) +
        (data.title.trim() ? 8 : 0) +
        (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email) ? 10 : 0) +
        (data.phone.trim() ? 6 : 0) +
        (data.links.trim() ? 6 : 0) +
        (data.summary.trim().length >= 60 ? 12 : data.summary.trim() ? 6 : 0) +
        Math.min(20, bullets.length * 4) +
        Math.min(15, withNumbers * 5) +
        (data.education.some((e) => e.org.trim()) ? 7 : 0) +
        (data.skills.split(",").filter((s) => s.trim()).length >= 4 ? 8 : 0),
    );

    const tips: string[] = [];
    if (!withNumbers)
      tips.push("성과 문장에 숫자를 하나라도 넣으면 근거가 분명해집니다.");
    if (data.summary.trim().length < 60)
      tips.push("소개는 두세 문장으로, 반복해 해결해 온 문제를 적으세요.");
    if (!data.links.trim())
      tips.push("포트폴리오나 깃허브 주소를 넣으면 확인 경로가 생깁니다.");
    if (data.experience.some((e) => e.org.trim() && !e.period.trim()))
      tips.push("경력에 기간을 적어야 공백기가 오해되지 않습니다.");

    return { score: value, advice: tips };
  }, [data]);

  /* -------------------- 내보내기 -------------------- */

  const filename = (ext: string) =>
    `${(data.name || "resume").replace(/\s+/g, "")}_이력서.${ext}`;

  /**
   * 조판 없이 글자만 남기는 판.
   *
   * 채용 시스템이 파일을 기계로 훑는 경우 표와 段이 오히려 방해가 됩니다.
   * 기간은 줄 끝이 아니라 괄호 안에 넣어, 줄바꿈이 달라져도 어느 경력의
   * 기간인지 잃지 않게 했습니다.
   */
  const documentText = () => {
    const lines: string[] = [];
    const heading = (key: string) =>
      SECTION_HEADING[key]![template.english ? 1 : 0];

    lines.push(data.name + (data.nameEn ? ` (${data.nameEn})` : ""));
    if (data.title) lines.push(data.title);
    const contact = [data.email, data.phone, data.links].filter(Boolean);
    if (contact.length) lines.push(contact.join("  |  "));

    if (data.summary.trim()) {
      lines.push("", heading("summary"), "-".repeat(24));
      lines.push(...data.summary.split("\n").filter((l) => l.trim()));
    }

    for (const key of ENTRY_SECTIONS) {
      const rows = data[key].filter(
        (e) => e.org.trim() || e.role.trim() || e.bullets.trim(),
      );
      if (!rows.length) continue;
      lines.push("", heading(key), "-".repeat(24));
      for (const e of rows) {
        const head = [e.org, e.role].filter(Boolean).join(" · ");
        lines.push(e.period ? `${head} (${e.period})` : head);
        for (const bullet of e.bullets.split("\n").filter((l) => l.trim())) {
          lines.push(`  - ${bullet.trim()}`);
        }
      }
    }

    if (data.skills.trim()) {
      lines.push("", heading("skills"), "-".repeat(24));
      lines.push(
        data.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(", "),
      );
    }
    return lines.join("\r\n");
  };

  const documentHtml = () => {
    const entries = (key: EntrySection) =>
      data[key]
        .filter((e) => e.org.trim() || e.role.trim() || e.bullets.trim())
        .map(
          (e) => `<div class="entry"><div class="row"><span><b>${escapeHtml(
            e.org,
          )}</b>${e.role ? ` · ${escapeHtml(e.role)}` : ""}</span><span class="period">${escapeHtml(
            e.period,
          )}</span></div>${
            e.bullets.trim()
              ? `<ul>${e.bullets
                  .split("\n")
                  .filter((l) => l.trim())
                  .map((l) => `<li>${escapeHtml(l)}</li>`)
                  .join("")}</ul>`
              : ""
          }</div>`,
        )
        .join("");

    const section = (key: EntrySection) => {
      const body = entries(key);
      if (!body) return "";
      return `<section><h2>${escapeHtml(
        SECTION_HEADING[key][template.english ? 1 : 0],
      )}</h2>${body}</section>`;
    };

    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${escapeHtml(
      data.name,
    )} 이력서</title><style>
@page{size:A4;margin:18mm}
*{box-sizing:border-box}
body{max-width:174mm;margin:0 auto;color:#23201d;font-family:${fontFamily(font).print};line-height:1.6;font-size:10.5pt}
header{display:flex;align-items:flex-end;gap:18px;padding-bottom:12px;border-bottom:2px solid ${template.accent};margin-bottom:18px}
h1{margin:0;font-size:24pt;letter-spacing:-.02em}
header .title{margin:4px 0 0;color:${template.accent};font-size:11pt}
.contact{margin-left:auto;text-align:right;font-size:9.5pt;color:#5b5751}
.contact div+div{margin-top:2px}
section{margin-top:20px}
h2{margin:0 0 10px;color:${template.accent};font-size:9.5pt;letter-spacing:.14em;text-transform:uppercase;border-bottom:1px solid #e5dfd7;padding-bottom:4px}
.entry+.entry{margin-top:12px}
.row{display:flex;justify-content:space-between;align-items:baseline;gap:16px}
.period{color:#6f6862;font-size:9.5pt;white-space:nowrap}
ul{margin:5px 0 0;padding-left:16px}
li{margin:0 0 2px;font-size:10pt}
.skills span{display:inline-block;padding:3px 8px;margin:0 4px 4px 0;background:${template.soft};color:${template.accent};font-size:9.5pt}
p{margin:0 0 5px}
</style></head><body>
<header><div><h1>${escapeHtml(data.name)}</h1>${
      data.nameEn
        ? `<div style="color:#6f6862;font-size:10pt">${escapeHtml(data.nameEn)}</div>`
        : ""
    }<p class="title">${escapeHtml(data.title)}</p></div>
<div class="contact">${[data.email, data.phone, data.links]
      .filter(Boolean)
      .map((v) => `<div>${escapeHtml(v)}</div>`)
      .join("")}</div></header>
${
  data.summary.trim()
    ? `<section><h2>${escapeHtml(
        SECTION_HEADING.summary[template.english ? 1 : 0],
      )}</h2>${data.summary
        .split("\n")
        .map((l) => `<p>${escapeHtml(l)}</p>`)
        .join("")}</section>`
    : ""
}
${ENTRY_SECTIONS.map(section).join("")}
${
  data.skills.trim()
    ? `<section><h2>${escapeHtml(
        SECTION_HEADING.skills[template.english ? 1 : 0],
      )}</h2><div class="skills">${data.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `<span>${escapeHtml(s)}</span>`)
        .join("")}</div></section>`
    : ""
}
</body></html>`;
  };

  const save = async () => {
    const el = sheetRef.current;
    if (!el || busy) return;
    setBusy(true);
    setMessage("");
    setSelected(null);
    try {
      const meta = FORMATS.find((f) => f[0] === format)!;
      const [, description, mime, ext] = meta;
      const picker = { description, mime, extension: ext };
      let done: boolean;

      if (format === "pdf") {
        done = await saveBlob(await sheetToPdfBlob(el), filename("pdf"), picker);
      } else if (format === "png") {
        const canvas = await captureCanvas(el, 2.5);
        done = await saveBlob(await canvasToBlob(canvas), filename("png"), picker);
      } else if (format === "html") {
        done = await saveBlob(
          new Blob([documentHtml()], { type: `${mime};charset=utf-8` }),
          filename("html"),
          picker,
        );
      } else if (format === "txt") {
        // BOM 을 붙여야 메모장이 한글을 깨뜨리지 않고 엽니다.
        done = await saveBlob(
          new Blob(["﻿", documentText()], {
            type: `${mime};charset=utf-8`,
          }),
          filename("txt"),
          picker,
        );
      } else {
        done = await saveBlob(
          new Blob(
            [
              "﻿",
              documentHtml().replace(
                '<html lang="ko">',
                '<html lang="ko" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">',
              ),
            ],
            { type: `${mime};charset=utf-8` },
          ),
          filename("doc"),
          picker,
        );
      }
      // 저장 창을 닫았을 때와 실제로 저장했을 때를 구분해 알려 줍니다.
      setMessage(done ? "저장했습니다." : "저장을 취소했습니다.");
    } catch {
      setMessage(
        "파일을 만들지 못했습니다. 사진 크기를 줄이거나 다른 형식으로 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  };

  /* -------------------- 패널 -------------------- */

  const layoutIds = useMemo(
    () => Array.from(new Set(RESUME_TEMPLATES.map((t) => t.layout))),
    [],
  );
  const visible = useMemo(
    () =>
      layoutFilter === "all"
        ? RESUME_TEMPLATES
        : RESUME_TEMPLATES.filter((t) => t.layout === layoutFilter),
    [layoutFilter],
  );

  const entryPanel = (key: EntrySection) => {
    const labels = ENTRY_FIELD_LABEL[key];
    return (
      <>
        <PanelHead
          title={SECTION_HEADING[key][0]}
          note="비워 두면 이력서에도 나오지 않습니다."
          action={<ToolButton onClick={() => addEntry(key)}>＋ 추가</ToolButton>}
        />
        <div className="space-y-4">
          {data[key].map((entry, index) => (
            <div
              key={entry.id}
              className="rounded-md border border-line bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[0.6875rem] text-hint">{index + 1}번째</span>
                <div className="flex gap-1">
                  <ToolButton
                    disabled={index === 0}
                    onClick={() => moveEntry(key, index, -1)}
                    aria-label="위로"
                  >
                    ↑
                  </ToolButton>
                  <ToolButton
                    disabled={index === data[key].length - 1}
                    onClick={() => moveEntry(key, index, 1)}
                    aria-label="아래로"
                  >
                    ↓
                  </ToolButton>
                  <ToolButton
                    onClick={() => removeEntry(key, entry.id)}
                    aria-label="삭제"
                  >
                    ✕
                  </ToolButton>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label={labels.org}>
                    <input
                      className="ipt"
                      value={entry.org}
                      onChange={(e) =>
                        patchEntry(key, entry.id, { org: e.target.value })
                      }
                    />
                  </Field>
                  <Field label={labels.role}>
                    <input
                      className="ipt"
                      value={entry.role}
                      onChange={(e) =>
                        patchEntry(key, entry.id, { role: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field label={labels.period} hint="예: 2021.03 – 2024.08">
                  <input
                    className="ipt"
                    value={entry.period}
                    onChange={(e) =>
                      patchEntry(key, entry.id, { period: e.target.value })
                    }
                  />
                </Field>
                <Field label={labels.bullets}>
                  <textarea
                    className="ipt"
                    rows={3}
                    value={entry.bullets}
                    onChange={(e) =>
                      patchEntry(key, entry.id, { bullets: e.target.value })
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
          {data[key].length === 0 ? (
            <button
              type="button"
              onClick={() => addEntry(key)}
              className="w-full rounded-md border border-dashed border-line py-6 text-[0.8125rem] text-muted transition-colors hover:border-rose hover:text-rose-deep"
            >
              ＋ 첫 항목 추가하기
            </button>
          ) : null}
        </div>
      </>
    );
  };

  const panel = (() => {
    if (section === "template")
      return (
        <>
          <PanelHead
            title="템플릿"
            note={`${RESUME_TEMPLATES.length}종 · 누르면 바로 반영됩니다`}
            action={
              <select
                value={layoutFilter}
                onChange={(e) => setLayoutFilter(e.target.value)}
                className="ipt w-auto py-1 text-[0.6875rem]"
                aria-label="레이아웃으로 거르기"
              >
                <option value="all">전체</option>
                {layoutIds.map((id) => (
                  <option key={id} value={id}>
                    {
                      RESUME_TEMPLATES.find((t) => t.layout === id)!.name.split(
                        " ",
                      )[1]
                    }
                  </option>
                ))}
              </select>
            }
          />
          <div className="grid grid-cols-4 gap-2.5">
            {visible.map((t) => (
              <label className="pick" key={t.id} title={t.name}>
                <input
                  type="radio"
                  name="resume-template"
                  checked={template.id === t.id}
                  onChange={() => setTemplate(t)}
                />
                <span
                  className="rthumb"
                  data-l={t.layout}
                  style={
                    {
                      "--ac": t.accent,
                      "--sf": t.soft,
                      "--pp": t.paper,
                    } as React.CSSProperties
                  }
                >
                  <i />
                  <em />
                </span>
                <span className="pick-name">{t.name}</span>
              </label>
            ))}
          </div>
          <div className="mt-6">
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

    if (section === "person")
      return (
        <>
          <PanelHead title="인적사항" note="이력서 맨 위에 들어갑니다." />
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line bg-white px-3 py-3 transition-colors hover:border-rose">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) =>
                  setPhoto((await readImageFile(e.target.files?.[0])) ?? "")
                }
              />
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt="올린 증명사진"
                  className="h-14 w-[2.625rem] rounded-xs object-cover"
                />
              ) : (
                <span className="grid h-14 w-[2.625rem] place-items-center rounded-xs bg-sand text-[0.625rem] text-muted">
                  3×4
                </span>
              )}
              <span className="text-[0.75rem] text-ink-soft">
                증명사진 올리기
                <span className="mt-0.5 block text-[0.6875rem] text-hint">
                  블라인드 채용이면 넣지 않아도 됩니다
                </span>
              </span>
              {photo ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPhoto("");
                  }}
                  className="ml-auto text-[0.6875rem] text-muted hover:text-rose-deep"
                >
                  제거
                </button>
              ) : null}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Field label="이름">
                <input
                  className="ipt"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </Field>
              <Field label="영문 이름">
                <input
                  className="ipt"
                  value={data.nameEn}
                  onChange={(e) => setData({ ...data, nameEn: e.target.value })}
                />
              </Field>
            </div>
            <Field label="지원 직무" hint="채용 공고에 적힌 명칭 그대로">
              <input
                className="ipt"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="이메일">
                <input
                  className="ipt"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                />
              </Field>
              <Field label="전화번호">
                <input
                  className="ipt"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                />
              </Field>
            </div>
            <Field label="링크" hint="깃허브·포트폴리오 등, 가운뎃점(·)으로 구분">
              <input
                className="ipt"
                value={data.links}
                onChange={(e) => setData({ ...data, links: e.target.value })}
              />
            </Field>
            <Field label="소개" hint="반복해 해결해 온 문제를 두세 문장으로">
              <textarea
                className="ipt"
                rows={4}
                value={data.summary}
                onChange={(e) => setData({ ...data, summary: e.target.value })}
              />
            </Field>
          </div>
        </>
      );

    if (ENTRY_SECTIONS.includes(section as EntrySection))
      return entryPanel(section as EntrySection);

    if (section === "skills")
      return (
        <>
          <PanelHead
            title="기술"
            note="쉼표로 구분하면 태그로 나뉩니다."
          />
          <Field label="기술 스택">
            <textarea
              className="ipt"
              rows={4}
              value={data.skills}
              onChange={(e) => setData({ ...data, skills: e.target.value })}
            />
          </Field>
        </>
      );

    return (
      <>
        <PanelHead title="저장" note="편집 내용은 이 브라우저에 자동 저장됩니다." />
        <div className="space-y-5">
          <div className="rounded-md border border-line bg-white p-4">
            <div className="flex items-end justify-between">
              <span className="text-[0.75rem] text-ink-soft">서류 점검 점수</span>
              <b className="font-serif text-2xl text-ink">
                {score}
                <small className="text-[0.75rem] text-hint">/100</small>
              </b>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-rose-deep transition-[width] duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
            <ul className="mt-3 space-y-1">
              {(advice.length
                ? advice
                : ["핵심 항목이 모두 채워졌습니다. 문장을 짧게 다듬어 보세요."]
              ).map((tip) => (
                <li key={tip} className="text-[0.75rem] text-muted">
                  · {tip}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.6875rem] text-hint">
              채용 결과를 보장하지 않는 자체 점검 지표입니다.
            </p>
          </div>

          <Field label="파일 형식">
            <select
              className="ipt"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {FORMATS.map(([value, label, , ext]) => (
                <option key={value} value={value}>
                  {label} (.{ext})
                </option>
              ))}
            </select>
          </Field>

          {message ? (
            <p className="text-[0.75rem] text-rose-deep">{message}</p>
          ) : null}

          <p className="text-[0.75rem] text-muted">
            입력한 내용과 사진은 서버로 보내지 않고 이 브라우저 안에서만
            처리됩니다.
          </p>

          {/* 되돌릴 수 없는 동작이라 한 번 더 묻습니다. */}
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.75rem] text-ink">
                작성한 내용이 모두 지워집니다. 계속할까요?
              </span>
              <ToolButton
                onClick={() => {
                  clearDraft(KEY);
                  setData(SAMPLE_RESUME);
                  setPhoto("");
                  setLayout(blankLayout());
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
              처음부터 다시 쓰기
            </ToolButton>
          )}
        </div>
      </>
    );
  })();

  const selectedBlock = selected ? (layout[selected] ?? EMPTY_BLOCK) : null;
  const hidden = RESUME_BLOCKS.filter((id) => layout[id]?.hidden);

  return (
    <StudioShell
      sections={SECTIONS}
      active={section}
      onSelect={setSection}
      panel={panel}
      previewTitle="이력서 미리보기"
      previewNote="A4 · 실제 인쇄 크기"
      actions={
        <button
          type="button"
          className="rounded-md bg-ink px-4 py-2 text-[0.75rem] text-ivory transition-transform active:translate-y-px disabled:opacity-50"
          onClick={save}
          disabled={busy}
        >
          {busy ? "만드는 중…" : "파일로 저장"}
        </button>
      }
      toolbar={
        <div className="space-y-2">
          {/* A4 한 장을 넘기면 아래가 잘립니다. 저장하기 전에 알려 줍니다. */}
          {overflow ? (
            <p className="rounded-md border border-rose-mist bg-rose-veil px-3 py-2 text-[0.75rem] text-rose-deep">
              내용이 A4 한 장을 넘어 아래가 잘립니다. 오래된 항목을 줄이거나
              블록 크기를 낮춰 주세요.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-ivory px-3 py-2">
          <span className="mr-auto text-[0.6875rem] text-muted">
            {selected
              ? `${RESUME_BLOCK_LABEL[selected]} 선택됨 — 끌어서 옮기세요`
              : "블록을 누르면 위치와 크기를 조절할 수 있습니다"}
          </span>
          <label className="flex items-center gap-2 text-[0.6875rem] text-ink-soft">
            크기
            <input
              type="range"
              min={70}
              max={140}
              value={selectedBlock?.size ?? 100}
              disabled={!selected}
              onChange={(e) =>
                selected && patchBlock(selected, { size: +e.target.value })
              }
            />
          </label>
          <ToolButton
            disabled={!selected}
            onClick={() => selected && patchBlock(selected, { hidden: true })}
          >
            숨기기
          </ToolButton>
          {hidden.map((id) => (
            <ToolButton key={id} onClick={() => patchBlock(id, { hidden: false })}>
              {RESUME_BLOCK_LABEL[id]} 되살리기
            </ToolButton>
          ))}
          <ToolButton
            onClick={() => {
              setLayout(blankLayout());
              setSelected(null);
            }}
          >
            배치 초기화
          </ToolButton>
          </div>
        </div>
      }
    >
      <div ref={stageRef} className="grid place-items-center">
        <div
          style={{
            width: stage.width,
            height: stage.height,
            boxShadow: "0 14px 34px rgb(46 42 39 / 0.14)",
          }}
        >
          <div
            data-fit
            style={{
              transform: `scale(${stage.scale})`,
              transformOrigin: "top left",
              width: 210 * MM,
            }}
          >
            <ResumeSheet
              ref={sheetRef}
              template={template}
              data={data}
              photo={photo}
              font={fontStack(font)}
              layout={layout}
              selected={selected}
              onBlockPointerDown={onBlockPointerDown}
              onBlockSelect={setSelected}
            />
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
