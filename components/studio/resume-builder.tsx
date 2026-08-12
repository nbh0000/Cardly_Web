"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
import {
  DataPanel,
  Field,
  MM,
  Panel,
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

const KEY = "cardly-resume-v2";

const FONTS: [string, string][] = [
  ['var(--font-sans), sans-serif', "고딕 (본문용)"],
  ['var(--font-serif), serif', "명조 (격식체)"],
];

const FORMATS: [string, string, string, string][] = [
  ["pdf", "PDF 문서", "application/pdf", "pdf"],
  ["docx", "Word 문서", "application/msword", "doc"],
  ["png", "이미지", "image/png", "png"],
  ["html", "HTML 문서", "text/html", "html"],
  ["txt", "텍스트", "text/plain", "txt"],
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
  const [template, setTemplate] = useState<ResumeTemplate>(
    DEFAULT_RESUME_TEMPLATE,
  );
  const [font, setFont] = useState(FONTS[0][0]);
  const [photo, setPhoto] = useState("");
  const [layout, setLayout] = useState<ResumeLayout>(blankLayout);
  const [data, setData] = useState<ResumeData>(SAMPLE_RESUME);
  const [selected, setSelected] = useState<ResumeBlockId | null>(null);
  const [format, setFormat] = useState("pdf");
  const [busy, setBusy] = useState(false);
  const [layoutFilter, setLayoutFilter] = useState<string>("all");

  // A4 는 화면보다 커서 축소만 합니다 (좌우 여백 24px 제외).
  const [stageRef, stage] = useStageFit(210, 297, { maxScale: 1, padding: 24 });

  const restore = useCallback((draft: Draft) => {
    const found = RESUME_TEMPLATES.find((t) => t.id === draft.templateId);
    if (found) setTemplate(found);
    if (draft.font) setFont(draft.font);
    if (typeof draft.photo === "string") setPhoto(draft.photo);
    if (draft.layout) setLayout({ ...blankLayout(), ...draft.layout });
    if (draft.data) setData({ ...SAMPLE_RESUME, ...draft.data });
  }, []);

  const snapshot: Draft = useMemo(
    () => ({ templateId: template.id, font, photo, layout, data }),
    [template.id, font, photo, layout, data],
  );
  useDraft<Draft>(KEY, snapshot, restore);

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

  const onDragMove = useCallback(
    (dx: number, dy: number) => {
      const origin = dragOrigin.current;
      if (!origin) return;
      patchBlock(origin.id, {
        x: Math.max(-35, Math.min(35, origin.x + dx)),
        y: Math.max(-35, Math.min(35, origin.y + dy)),
      });
    },
    [patchBlock],
  );

  const startDrag = usePointerDrag({
    boundsRef: sheetRef as React.RefObject<HTMLElement | null>,
    onMove: onDragMove,
  });

  const onBlockPointerDown = (e: React.PointerEvent, id: ResumeBlockId) => {
    const block = layout[id] ?? EMPTY_BLOCK;
    dragOrigin.current = { id, x: block.x, y: block.y };
    setSelected(id);
    startDrag(e);
  };

  /* -------------------- 항목 편집 -------------------- */

  const patchEntry = (
    section: EntrySection,
    id: string,
    patch: Partial<{ org: string; role: string; period: string; bullets: string }>,
  ) =>
    setData((d) => ({
      ...d,
      [section]: d[section].map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const addEntry = (section: EntrySection) =>
    setData((d) => ({
      ...d,
      [section]: [
        ...d[section],
        emptyEntry(`${section}-${Date.now().toString(36)}`),
      ],
    }));

  const removeEntry = (section: EntrySection, id: string) =>
    setData((d) => ({
      ...d,
      [section]: d[section].filter((e) => e.id !== id),
    }));

  const moveEntry = (section: EntrySection, index: number, delta: number) =>
    setData((d) => {
      const list = [...d[section]];
      const next = index + delta;
      if (next < 0 || next >= list.length) return d;
      [list[index], list[next]] = [list[next], list[index]];
      return { ...d, [section]: list };
    });

  /* -------------------- 완성도 점수 -------------------- */

  const score = useMemo(() => {
    const bulletCount = data.experience
      .concat(data.projects)
      .flatMap((e) => e.bullets.split("\n").filter((l) => l.trim())).length;
    // 숫자가 들어간 성과 문장은 서류에서 가장 잘 읽히는 근거입니다.
    const withNumbers = data.experience
      .concat(data.projects)
      .flatMap((e) => e.bullets.split("\n"))
      .filter((line) => /\d/.test(line) && line.trim()).length;

    return Math.min(
      100,
      (data.name.trim() ? 8 : 0) +
        (data.title.trim() ? 8 : 0) +
        (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email) ? 10 : 0) +
        (data.phone.trim() ? 6 : 0) +
        (data.links.trim() ? 6 : 0) +
        (data.summary.trim().length >= 60
          ? 12
          : data.summary.trim()
            ? 6
            : 0) +
        Math.min(20, bulletCount * 4) +
        Math.min(15, withNumbers * 5) +
        (data.education.some((e) => e.org.trim()) ? 7 : 0) +
        (data.skills.split(",").filter((s) => s.trim()).length >= 4 ? 8 : 0),
    );
  }, [data]);

  const advice = useMemo(() => {
    const tips: string[] = [];
    const bullets = data.experience
      .concat(data.projects)
      .flatMap((e) => e.bullets.split("\n"))
      .filter((l) => l.trim());
    if (!bullets.some((l) => /\d/.test(l)))
      tips.push("성과 문장에 숫자를 하나라도 넣으면 근거가 분명해집니다.");
    if (data.summary.trim().length < 60)
      tips.push("소개는 두세 문장으로, 반복해 해결해 온 문제를 적으세요.");
    if (!data.links.trim())
      tips.push("포트폴리오나 깃허브 주소를 넣으면 확인 경로가 생깁니다.");
    if (data.experience.some((e) => e.org.trim() && !e.period.trim()))
      tips.push("경력에는 기간을 함께 적어야 공백기가 오해되지 않습니다.");
    return tips;
  }, [data]);

  /* -------------------- 내보내기 -------------------- */

  const filename = (ext: string) =>
    `${(data.name || "resume").replace(/\s+/g, "")}_이력서.${ext}`;

  const documentHtml = () => {
    const entries = (key: EntrySection) =>
      data[key]
        .filter((e) => e.org.trim() || e.role.trim() || e.bullets.trim())
        .map(
          (e) => `<div class="entry">
            <div class="row"><span><b>${escapeHtml(e.org)}</b>${
              e.role ? ` · ${escapeHtml(e.role)}` : ""
            }</span><span class="period">${escapeHtml(e.period)}</span></div>
            ${
              e.bullets.trim()
                ? `<ul>${e.bullets
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((l) => `<li>${escapeHtml(l)}</li>`)
                    .join("")}</ul>`
                : ""
            }
          </div>`,
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
body{max-width:174mm;margin:0 auto;color:#23201d;font-family:"Malgun Gothic",Arial,sans-serif;line-height:1.6;font-size:10.5pt}
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
      data.nameEn ? `<div style="color:#6f6862;font-size:10pt">${escapeHtml(data.nameEn)}</div>` : ""
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

  const plainText = () => {
    const entries = (key: EntrySection, label: string) => {
      const list = data[key].filter((e) => e.org.trim() || e.bullets.trim());
      if (!list.length) return "";
      return `\n[${label}]\n${list
        .map(
          (e) =>
            `${e.org}${e.role ? ` · ${e.role}` : ""}${
              e.period ? `  (${e.period})` : ""
            }\n${e.bullets
              .split("\n")
              .filter((l) => l.trim())
              .map((l) => `  - ${l}`)
              .join("\n")}`,
        )
        .join("\n\n")}\n`;
    };
    return [
      data.name,
      data.nameEn,
      data.title,
      [data.email, data.phone, data.links].filter(Boolean).join(" · "),
      data.summary ? `\n[소개]\n${data.summary}` : "",
      entries("experience", "경력"),
      entries("projects", "프로젝트"),
      entries("education", "학력"),
      entries("certificates", "자격·어학"),
      data.skills ? `\n[기술]\n${data.skills}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const save = async () => {
    const el = sheetRef.current;
    if (!el || busy) return;
    setBusy(true);
    setSelected(null);
    try {
      const meta = FORMATS.find((f) => f[0] === format)!;
      const [, description, mime, ext] = meta;
      const picker = { description, mime, extension: ext };

      if (format === "pdf") {
        await saveBlob(await sheetToPdfBlob(el), filename("pdf"), picker);
      } else if (format === "png") {
        const canvas = await captureCanvas(el, 2.5);
        await saveBlob(await canvasToBlob(canvas), filename("png"), picker);
      } else if (format === "html") {
        await saveBlob(
          new Blob(["﻿", documentHtml()], { type: `${mime};charset=utf-8` }),
          filename("html"),
          picker,
        );
      } else if (format === "docx") {
        await saveBlob(
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
      } else {
        await saveBlob(
          new Blob(["﻿", plainText()], { type: `${mime};charset=utf-8` }),
          filename("txt"),
          picker,
        );
      }
    } finally {
      setBusy(false);
    }
  };

  /* -------------------- 화면 -------------------- */

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

  const selectedBlock = selected ? (layout[selected] ?? EMPTY_BLOCK) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
      {/* ---------------- 왼쪽: 편집 패널 ---------------- */}
      <div className="space-y-5">
        <Panel
          title={`템플릿 ${RESUME_TEMPLATES.length}종`}
          action={
            <select
              value={layoutFilter}
              onChange={(e) => setLayoutFilter(e.target.value)}
              className="ipt w-auto py-1 text-[0.6875rem]"
              aria-label="레이아웃 종류로 거르기"
            >
              <option value="all">전체</option>
              {layoutIds.map((id) => (
                <option key={id} value={id}>
                  {RESUME_TEMPLATES.find((t) => t.layout === id)!.name.split(" ")[1]}
                </option>
              ))}
            </select>
          }
        >
          <div className="grid max-h-96 grid-cols-4 gap-2.5 overflow-y-auto pr-1">
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
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="완성도">
          <div className="flex items-end justify-between">
            <span className="text-caption text-ink-soft">서류 점검 점수</span>
            <b className="font-serif text-2xl text-ink">
              {score}
              <small className="text-caption text-hint">/100</small>
            </b>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-sand">
            <div
              className="h-full rounded-full bg-rose-deep transition-[width] duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
          <ul className="mt-3 space-y-1">
            {advice.length ? (
              advice.map((tip) => (
                <li key={tip} className="text-[0.75rem] text-muted">
                  · {tip}
                </li>
              ))
            ) : (
              <li className="text-[0.75rem] text-muted">
                · 핵심 항목이 모두 채워졌습니다. 문장을 짧게 다듬어 보세요.
              </li>
            )}
          </ul>
          <p className="mt-3 text-[0.6875rem] text-hint">
            채용 결과를 보장하지 않는 자체 점검 지표입니다.
          </p>
        </Panel>

        <Panel title="인적사항">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line px-3 py-3 transition-colors hover:border-rose">
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
        </Panel>

        {ENTRY_SECTIONS.map((section) => {
          const labels = ENTRY_FIELD_LABEL[section];
          return (
            <Panel
              key={section}
              title={SECTION_HEADING[section][0]}
              action={
                <ToolButton onClick={() => addEntry(section)}>＋ 추가</ToolButton>
              }
            >
              <div className="space-y-4">
                {data[section].length === 0 ? (
                  <p className="text-[0.75rem] text-hint">
                    항목이 없습니다. 비워 두면 이력서에도 나오지 않습니다.
                  </p>
                ) : null}
                {data[section].map((entry, index) => (
                  <div
                    key={entry.id}
                    className="rounded-md border border-line-soft bg-cream/40 p-3.5"
                  >
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[0.6875rem] text-hint">
                        {index + 1}번째
                      </span>
                      <div className="flex gap-1">
                        <ToolButton
                          disabled={index === 0}
                          onClick={() => moveEntry(section, index, -1)}
                          aria-label="위로"
                        >
                          ↑
                        </ToolButton>
                        <ToolButton
                          disabled={index === data[section].length - 1}
                          onClick={() => moveEntry(section, index, 1)}
                          aria-label="아래로"
                        >
                          ↓
                        </ToolButton>
                        <ToolButton
                          onClick={() => removeEntry(section, entry.id)}
                          aria-label="삭제"
                        >
                          ✕
                        </ToolButton>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <Field label={labels.org}>
                          <input
                            className="ipt"
                            value={entry.org}
                            onChange={(e) =>
                              patchEntry(section, entry.id, { org: e.target.value })
                            }
                          />
                        </Field>
                        <Field label={labels.role}>
                          <input
                            className="ipt"
                            value={entry.role}
                            onChange={(e) =>
                              patchEntry(section, entry.id, {
                                role: e.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>
                      <Field label={labels.period} hint="예: 2021.03 – 2024.08">
                        <input
                          className="ipt"
                          value={entry.period}
                          onChange={(e) =>
                            patchEntry(section, entry.id, {
                              period: e.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label={labels.bullets}>
                        <textarea
                          className="ipt"
                          rows={3}
                          value={entry.bullets}
                          onChange={(e) =>
                            patchEntry(section, entry.id, {
                              bullets: e.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}

        <Panel title="기술">
          <Field label="기술 스택" hint="쉼표로 구분하면 태그로 나뉩니다">
            <textarea
              className="ipt"
              rows={3}
              value={data.skills}
              onChange={(e) => setData({ ...data, skills: e.target.value })}
            />
          </Field>
        </Panel>

        <DataPanel<Draft>
          storageKey={KEY}
          filename="cardly-resume-backup.json"
          snapshot={() => snapshot}
          onRestore={restore}
          onReset={() => {
            setData(SAMPLE_RESUME);
            setPhoto("");
            setLayout(blankLayout());
          }}
        />
      </div>

      {/* ---------------- 오른쪽: 미리보기 ---------------- */}
      <div className="space-y-4 lg:sticky lg:top-24">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white px-4 py-3">
          <span className="mr-auto text-[0.75rem] text-ink">
            {selected
              ? `${RESUME_BLOCK_LABEL[selected]} 선택됨 — 끌어서 옮기세요`
              : "블록을 눌러 위치와 크기를 조절할 수 있습니다"}
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
          <ToolButton
            onClick={() => {
              setLayout(blankLayout());
              setSelected(null);
            }}
          >
            배치 초기화
          </ToolButton>
          <select
            className="ipt w-auto py-1 text-[0.6875rem]"
            value={font}
            onChange={(e) => setFont(e.target.value)}
            aria-label="글꼴"
          >
            {FONTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 숨긴 블록 되살리기 */}
        {RESUME_BLOCKS.some((id) => layout[id]?.hidden) ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line-soft bg-cream/60 px-4 py-3">
            <span className="text-[0.6875rem] text-muted">숨긴 블록</span>
            {RESUME_BLOCKS.filter((id) => layout[id]?.hidden).map((id) => (
              <ToolButton key={id} onClick={() => patchBlock(id, { hidden: false })}>
                {RESUME_BLOCK_LABEL[id]} 되살리기
              </ToolButton>
            ))}
          </div>
        ) : null}

        <div ref={stageRef} className="stage grid place-items-center rounded-lg bg-sand/50 p-3">
          {/* 바깥 상자가 축소된 크기를 차지해야 아래 요소가 겹치지 않습니다. */}
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
              font={font}
              layout={layout}
              selected={selected}
              onBlockPointerDown={onBlockPointerDown}
              onBlockSelect={setSelected}
            />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white px-4 py-4">
          <div className="mr-auto">
            <p className="text-[0.8125rem] text-ink">파일로 저장</p>
            <p className="text-[0.6875rem] text-hint">
              편집 내용은 이 브라우저에 자동 저장됩니다
            </p>
          </div>
          <select
            className="ipt w-auto"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            aria-label="저장 형식"
          >
            {FORMATS.map(([value, label, , ext]) => (
              <option key={value} value={value}>
                {label} (.{ext})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={save}
            disabled={busy}
          >
            {busy ? "만드는 중…" : "저장하기 ↓"}
          </button>
        </div>
      </div>
    </div>
  );
}
