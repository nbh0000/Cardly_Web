"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import {
  type ResumeBlockId,
  type ResumeData,
  type ResumeEntry,
  type ResumeTemplate,
  RESUME_BLOCKS,
  SECTION_HEADING,
} from "@/lib/studio/resume-templates";

export type BlockLayout = { x: number; y: number; size: number; hidden: boolean };
export type ResumeLayout = Record<ResumeBlockId, BlockLayout>;

export const EMPTY_BLOCK: BlockLayout = { x: 0, y: 0, size: 100, hidden: false };

/** 아무 것도 옮기지 않은 상태. 홈 목업처럼 «읽기만» 하는 자리에서 씁니다. */
export const FLAT_LAYOUT: ResumeLayout = Object.fromEntries(
  RESUME_BLOCKS.map((id) => [id, EMPTY_BLOCK]),
) as ResumeLayout;

const noop = () => {};

type SheetProps = {
  ref?: Ref<HTMLElement>;
  template: ResumeTemplate;
  data: ResumeData;
  /* 아래 다섯은 편집기에서만 씁니다. 홈 목업은 «그리기» 만 필요하고,
     서버 컴포넌트는 함수를 넘길 수 없습니다 — 직렬화되지 않기 때문입니다.
     그래서 전부 선택으로 두고 기본값을 여기서 정합니다. */
  photo?: string;
  font?: string;
  layout?: ResumeLayout;
  selected?: ResumeBlockId | null;
  onBlockPointerDown?: (e: React.PointerEvent, id: ResumeBlockId) => void;
  onBlockSelect?: (id: ResumeBlockId | null) => void;
};

/** 내용이 하나도 없는 섹션은 아예 그리지 않습니다. */
function hasEntries(list: ResumeEntry[]) {
  return list.some((e) => e.org.trim() || e.role.trim() || e.bullets.trim());
}

export function ResumeSheet({
  ref,
  template,
  data,
  photo = "",
  font = "sans",
  layout = FLAT_LAYOUT,
  selected = null,
  onBlockPointerDown = noop,
  onBlockSelect = noop,
}: SheetProps) {
  const heading = (key: string) =>
    SECTION_HEADING[key][template.english ? 1 : 0];

  /**
   * 블록 하나를 감싸는 껍데기.
   *
   * 컴포넌트가 아니라 그냥 함수입니다. 렌더 안에서 컴포넌트를 새로 만들면
   * 렌더마다 타입이 달라져 React 가 전부 다시 마운트해 버립니다.
   */
  const block = (id: ResumeBlockId, children: ReactNode, className = "") => {
    const spot = layout[id] ?? EMPTY_BLOCK;
    if (spot.hidden) return null;
    return (
      <div
        key={id}
        className={`sheet-block sh-b-${id} ${className} ${selected === id ? "is-on" : ""}`}
        style={{
          left: `${spot.x}%`,
          top: `${spot.y}%`,
          transform: `scale(${spot.size / 100})`,
        }}
        onPointerDown={(e) => onBlockPointerDown(e, id)}
        onClick={(e) => {
          e.stopPropagation();
          onBlockSelect(id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onBlockSelect(id);
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={selected === id}
        aria-label={`${id} 블록 선택`}
      >
        {children}
      </div>
    );
  };

  const photoBlock = () =>
    photo
      ? block(
          "photo",
          // 사용자가 올린 dataURL 이라 next/image 로 최적화할 대상이 아닙니다.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="sh-photo" src={photo} alt="증명사진" />,
        )
      : null;

  const identityBlock = () =>
    block(
      "identity",
      <>
        <h2 className="sh-name">
          {data.name}
          {data.nameEn ? <small>{data.nameEn}</small> : null}
        </h2>
        {data.title ? <p className="sh-title">{data.title}</p> : null}
      </>,
    );

  const contactBlock = () =>
    block(
      "contact",
      <>
        {data.email ? <span>{data.email}</span> : null}
        {data.phone ? <span>{data.phone}</span> : null}
        {data.links ? <span>{data.links}</span> : null}
      </>,
      "sh-contact",
    );

  const summaryBlock = () =>
    data.summary.trim()
      ? block(
          "summary",
          <>
            <h3 className="sh-h">{heading("summary")}</h3>
            {data.summary.split("\n").map((line, i) => (
              <p className="sh-summary" key={i}>
                {line}
              </p>
            ))}
          </>,
        )
      : null;

  const entriesBlock = (
    id: "experience" | "projects" | "education" | "certificates",
  ) => {
    const list = data[id];
    if (!hasEntries(list)) return null;
    return block(
      id,
      <>
        <h3 className="sh-h">{heading(id)}</h3>
        {list
          .filter((e) => e.org.trim() || e.role.trim() || e.bullets.trim())
          .map((entry) => (
            <div className="sh-entry" key={entry.id}>
              <div className="sh-entry-top">
                <div>
                  <span className="sh-entry-org">{entry.org}</span>
                  {entry.role ? (
                    <span className="sh-entry-role">{entry.role}</span>
                  ) : null}
                </div>
                {entry.period ? (
                  <span className="sh-entry-period">{entry.period}</span>
                ) : null}
              </div>
              {entry.bullets.trim() ? (
                <ul className="sh-bullets">
                  {entry.bullets
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                </ul>
              ) : null}
            </div>
          ))}
      </>,
    );
  };

  const skillsBlock = () =>
    data.skills.trim()
      ? block(
          "skills",
          <>
            <h3 className="sh-h">{heading("skills")}</h3>
            <div className="sh-skills">
              {data.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
            </div>
          </>,
        )
      : null;

  const style = {
    fontFamily: font,
    "--ac": template.accent,
    "--sf": template.soft,
    "--pp": template.paper,
    "--tx": template.ink,
  } as CSSProperties;

  const rootProps = {
    ref,
    className: `sheet sheet-${template.layout}`,
    style,
    onPointerDown: (e: React.PointerEvent) => {
      if (e.target === e.currentTarget) onBlockSelect(null);
    },
  };

  // 사이드바만 문서 구조가 다릅니다 — 좌측 컬럼에 사진·연락처·기술이 모입니다.
  if (template.layout === "sidebar") {
    return (
      <article {...rootProps}>
        <div className="sh-side">
          {photoBlock()}
          {contactBlock()}
          {skillsBlock()}
          {entriesBlock("certificates")}
        </div>
        <div className="sh-main">
          {identityBlock()}
          <div className="sh-body" style={{ marginTop: "8mm" }}>
            {summaryBlock()}
            {entriesBlock("experience")}
            {entriesBlock("projects")}
            {entriesBlock("education")}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article {...rootProps}>
      {/* 증명사진을 올리면 표제가 「좌측 사진 + 우측 인적사항」 짜임으로
          바뀝니다. 한국 이력서 표준 양식이 그렇게 되어 있습니다. */}
      <header className={`sh-head${photo ? " has-photo" : ""}`}>
        {photoBlock()}
        {identityBlock()}
        {contactBlock()}
      </header>
      <div className="sh-body">
        {summaryBlock()}
        {entriesBlock("experience")}
        {entriesBlock("projects")}
        {template.layout === "split" ? (
          <div className="sh-pair">
            {entriesBlock("education")}
            {entriesBlock("certificates")}
          </div>
        ) : (
          <>
            {entriesBlock("education")}
            {entriesBlock("certificates")}
          </>
        )}
        {skillsBlock()}
      </div>
    </article>
  );
}
