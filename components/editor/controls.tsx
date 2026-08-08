"use client";

import { useId, useRef, useState, type ReactNode } from "react";

/* ============================================================
   에디터 폼 프리미티브
   ============================================================ */

export function Accordion({
  title,
  desc,
  defaultOpen,
  children,
}: {
  title: string;
  desc?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <section className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span>
          <span className="block font-serif text-[0.9375rem] text-ink">
            {title}
          </span>
          {desc && (
            <span className="mt-0.5 block text-[0.6875rem] text-muted">
              {desc}
            </span>
          )}
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-rose-deep transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          ⌄
        </span>
      </button>
      {open && <div className="grid gap-4 pb-6">{children}</div>}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[0.75rem] text-ink-soft">{label}</span>
      {children}
      {hint && <span className="text-[0.6875rem] text-muted">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[0.8125rem] text-ink placeholder:text-hint focus-visible:border-rose focus-visible:outline-none";

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "tel" | "date" | "time" | "url";
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} resize-y leading-relaxed`}
    />
  );
}

export function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      {/* <label for> 는 button 을 가리킬 수 없어 눌러도 아무 일이 없었습니다.
          설명 영역도 스위치를 누르는 것과 똑같이 동작하도록 직접 연결합니다. */}
      <span
        onClick={() => onChange(!checked)}
        className="cursor-pointer select-none"
      >
        <span id={id} className="block text-[0.8125rem] text-ink">
          {label}
        </span>
        {desc && (
          <span className="mt-0.5 block text-[0.6875rem] text-muted">
            {desc}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-rose-deep" : "bg-sand"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-[left] duration-200 ${
            checked ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-1.5">
      {label && <span className="text-[0.75rem] text-ink-soft">{label}</span>}
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
    </div>
  );
}

const ACCENTS = [
  "#B08D80",
  "#8A6558",
  "#A6606A",
  "#C08E82",
  "#A98E63",
  "#8A9A7B",
  "#7E8C99",
  "#9E958B",
  "#6F6A78",
  "#2E2A27",
];

export function ColorPicker({
  value,
  onChange,
  onReset,
}: {
  value: string;
  onChange: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-[0.75rem] text-ink-soft">포인트 색상</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {ACCENTS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={c}
            aria-pressed={value.toLowerCase() === c.toLowerCase()}
            style={{ background: c }}
            className={`h-7 w-7 rounded-full ring-offset-2 ring-offset-cream transition-shadow ${
              value.toLowerCase() === c.toLowerCase()
                ? "ring-2 ring-ink"
                : "ring-1 ring-ink/10"
            }`}
          />
        ))}
        <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full ring-1 ring-ink/10">
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "conic-gradient(#e5534b,#e5a23b,#d8cf4a,#5bb85b,#4aa8d8,#6a5bd8,#c25bd8,#e5534b)",
            }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="직접 선택"
          />
        </label>
        <button
          type="button"
          onClick={onReset}
          className="ml-1 text-[0.6875rem] text-muted underline underline-offset-2 hover:text-rose-deep"
        >
          기본값
        </button>
      </div>
    </div>
  );
}

/* ---------- 이미지 업로드 ---------- */

export function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="grid gap-2">
      <span className="text-[0.75rem] text-ink-soft">{label}</span>
      <div className="flex items-center gap-3">
        <div className="h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-sand ring-1 ring-line">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full place-items-center text-[0.625rem] text-hint">
              없음
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[0.75rem] text-ink hover:border-rose"
          >
            사진 선택
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-[0.6875rem] text-muted underline underline-offset-2"
            >
              삭제
            </button>
          )}
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(URL.createObjectURL(f));
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function MultiImageUpload({
  label,
  values,
  onChange,
  max = 30,
}: {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const next = [...values];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.75rem] text-ink-soft">{label}</span>
        <span className="text-[0.6875rem] text-muted">
          {values.length} / {max}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {values.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="group relative aspect-square overflow-hidden rounded-sm bg-sand ring-1 ring-line"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/55 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                onClick={() => move(i, -1)}
                className="px-1.5 py-0.5 text-[0.625rem] text-white"
                aria-label="앞으로"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => onChange(values.filter((_, k) => k !== i))}
                className="px-1.5 py-0.5 text-[0.625rem] text-white"
                aria-label="삭제"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                className="px-1.5 py-0.5 text-[0.625rem] text-white"
                aria-label="뒤로"
              >
                ›
              </button>
            </div>
          </div>
        ))}

        {values.length < max && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="grid aspect-square place-items-center rounded-sm border border-dashed border-line text-lg text-hint hover:border-rose hover:text-rose-deep"
            aria-label="사진 추가"
          >
            +
          </button>
        )}
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          const urls = files.map((f) => URL.createObjectURL(f));
          onChange([...values, ...urls].slice(0, max));
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ---------- 반복 항목 ---------- */

export function Repeater({
  items,
  onAdd,
  addLabel,
  children,
}: {
  items: { id: string }[];
  onAdd: () => void;
  addLabel: string;
  children: (id: string, index: number) => ReactNode;
}) {
  return (
    <div className="grid gap-3">
      {items.map((it, i) => (
        <div
          key={it.id}
          className="grid gap-2.5 rounded-md bg-white p-3 ring-1 ring-line"
        >
          {children(it.id, i)}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="rounded-sm border border-dashed border-line py-2.5 text-[0.75rem] text-ink-soft hover:border-rose hover:text-rose-deep"
      >
        + {addLabel}
      </button>
    </div>
  );
}

export function RowActions({ onRemove }: { onRemove: () => void }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onRemove}
        className="text-[0.6875rem] text-muted underline underline-offset-2 hover:text-rose-deep"
      >
        삭제
      </button>
    </div>
  );
}
