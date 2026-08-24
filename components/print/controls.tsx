"use client";

/**
 * 편집기 오른쪽 패널이 쓰는 작은 조작 부품들.
 *
 * 따로 빼 둔 이유는 «값이 여러 개 선택됐을 때» 를 한 자리에서 다루기
 * 위해서입니다. 글자 셋을 고르고 크기를 바꾸면 셋 다 바뀌어야 하고, 셋의
 * 크기가 서로 다르면 칸은 비어 있어야 합니다. 이 규칙을 부품마다 따로
 * 쓰면 어딘가는 반드시 빠집니다.
 */

import type { ReactNode } from "react";

/** 값이 모두 같으면 그 값을, 다르면 undefined 를 돌려줍니다 */
export function shared<T, K extends keyof T>(list: T[], key: K): T[K] | undefined {
  if (list.length === 0) return undefined;
  const first = list[0]![key];
  return list.every((e) => e[key] === first) ? first : undefined;
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="pe-row">
      <span className="pe-row-label">{label}</span>
      <span className="pe-row-body">{children}</span>
    </label>
  );
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pe-group">
      <h3 className="pe-group-title">{title}</h3>
      {children}
    </section>
  );
}

export function NumberBox({
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <span className="pe-number">
      <input
        type="number"
        value={value === undefined ? "" : Math.round(value * 100) / 100}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
      />
      {suffix && <em>{suffix}</em>}
    </span>
  );
}

export function ColorBox({
  value,
  onChange,
  allowNone,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  allowNone?: boolean;
}) {
  return (
    <span className="pe-color">
      <input
        type="color"
        value={value && value.startsWith("#") ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        className="pe-color-hex"
        value={value ?? ""}
        placeholder={allowNone ? "없음" : "#000000"}
        onChange={(e) => onChange(e.target.value)}
      />
    </span>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { value: T; label: string; title?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <span className="pe-seg">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title ?? o.label}
          className={value === o.value ? "is-on" : undefined}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <span className="pe-slider">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <em>{value === undefined ? "—" : Math.round(value)}</em>
    </span>
  );
}
