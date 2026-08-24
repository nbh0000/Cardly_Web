"use client";

/**
 * 템플릿 목록 — 업종·스타일·색으로 거릅니다.
 *
 * 여덟 장이면 눈으로 훑어도 되지만, 갈래를 넘나들며 «우리 가게에 맞는 것»
 * 을 찾을 때는 거르기가 있어야 합니다. 축을 셋으로 제한한 이유는 넷째
 * 축부터는 아무도 쓰지 않으면서 화면만 차지하기 때문입니다.
 *
 * 거르기 단추는 «이 목록에 실제로 있는 것» 만 세웁니다. 눌러도 결과가
 * 없는 단추는 사용자에게 고장으로 읽힙니다.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { TemplateThumb } from "@/components/print/thumb";
import { facetsOf, filterTemplates } from "@/lib/print/templates";
import {
  INDUSTRIES,
  PALETTES,
  STYLES,
  industryLabel,
  styleLabel,
} from "@/lib/print/taxonomy";
import type { IndustryId, PaletteId, StyleId } from "@/lib/print/taxonomy";
import type { PrintTemplate } from "@/lib/print/types";

/** 카드 안 그림이 들어갈 상자. 좁은 화면에서도 넘치지 않는 크기입니다 */
const BOX = { w: 208, h: 176 };

export function TemplateGallery({ templates }: { templates: PrintTemplate[] }) {
  const [industry, setIndustry] = useState<IndustryId | null>(null);
  const [style, setStyle] = useState<StyleId | null>(null);
  const [palette, setPalette] = useState<PaletteId | null>(null);

  const facets = useMemo(() => facetsOf(templates), [templates]);
  const shown = useMemo(
    () => filterTemplates(templates, { industry, style, palette }),
    [templates, industry, style, palette],
  );

  const clear = () => {
    setIndustry(null);
    setStyle(null);
    setPalette(null);
  };
  const dirty = industry || style || palette;

  return (
    <div>
      <div className="pg-filters">
        <Row label="업종">
          <Chip on={!industry} onClick={() => setIndustry(null)}>
            전체
          </Chip>
          {INDUSTRIES.filter((t) => facets.industries.includes(t.id)).map((t) => (
            <Chip
              key={t.id}
              on={industry === t.id}
              onClick={() => setIndustry(industry === t.id ? null : t.id)}
            >
              {t.label}
            </Chip>
          ))}
        </Row>

        <Row label="스타일">
          <Chip on={!style} onClick={() => setStyle(null)}>
            전체
          </Chip>
          {STYLES.filter((t) => facets.styles.includes(t.id)).map((t) => (
            <Chip key={t.id} on={style === t.id} onClick={() => setStyle(style === t.id ? null : t.id)}>
              {t.label}
            </Chip>
          ))}
        </Row>

        <Row label="색">
          <Chip on={!palette} onClick={() => setPalette(null)}>
            전체
          </Chip>
          {PALETTES.filter((t) => facets.palettes.includes(t.id)).map((t) => (
            <Chip
              key={t.id}
              on={palette === t.id}
              onClick={() => setPalette(palette === t.id ? null : t.id)}
            >
              {t.label}
            </Chip>
          ))}
        </Row>
      </div>

      <p className="pg-count">
        {shown.length}장
        {dirty && (
          <button type="button" className="pg-clear" onClick={clear}>
            거르기 지우기
          </button>
        )}
      </p>

      {shown.length === 0 ? (
        <p className="pg-empty">고른 조건에 맞는 템플릿이 없습니다. 조건을 하나 지워 보세요.</p>
      ) : (
        <ul className="pg-grid">
          {shown.map((t) => (
            <li key={t.id}>
              <Link href={`/print/t/${t.id}`} className="pg-card">
                <span className="pg-art">
                  <TemplateThumb template={t} box={BOX} />
                </span>
                <span className="pg-body">
                  <span className="pg-name">{t.name}</span>
                  <span className="pg-note">{t.note}</span>
                  <span className="pg-tags">
                    <em>{industryLabel(t.industry)}</em>
                    <em>{styleLabel(t.style)}</em>
                    {t.doc.duplex && t.doc.elements.some((e) => e.side === "back") && <em>양면</em>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pg-row">
      <span className="pg-row-label">{label}</span>
      <div className="pg-chips">{children}</div>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={`pg-chip${on ? " is-on" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
