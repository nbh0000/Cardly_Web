"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { CardBook, type Step } from "@/components/card/card-book";
import { getOccasion } from "@/lib/card/designs";
import {
  clearDraft,
  createDoc,
  encodeDoc,
  loadDraft,
  saveDraft,
} from "@/lib/card/doc";
import type { CardDesign, CardDoc, Handwriting } from "@/lib/card/types";
import { fontStack, fontsFor } from "@/lib/fonts";

/* ============================================================
   카드에 쓰기

   면을 하나씩 넘기면서 그 면에 들어가는 것만 고칩니다. 청첩장
   편집기처럼 왼쪽에 스무 개 항목을 세워 두지 않는 이유는, 카드에는
   면이 넷뿐이고 각 면에 들어갈 것이 정해져 있기 때문입니다.

     앞면  : 행사 이름과 한 줄
     안쪽  : 언제·어디서·누가 + 손으로 쓴 글
     뒷면  : 오시는 길, 안내, 회신처

   쓰는 동안 이 브라우저에만 저장됩니다. 계정을 만들지 않고 쓰는
   물건이라 서버로 보낼 곳이 없고, 보낼 이유도 없습니다.
   ============================================================ */

const HAND_FONTS = fontsFor("invitation").filter((f) => f.group === "손글씨");

/** 값이 바뀌지 않는 스토어 — 최초 스냅샷만 필요할 때 씁니다. */
const subscribeNever = () => () => {};

export function CardWriter({ design }: { design: CardDesign }) {
  const [doc, setDoc] = useState<CardDoc>(() => createDoc(design.id));
  const [step, setStep] = useState<Step>(0);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /* 저장해 둔 초안이 있으면 그것으로 시작합니다.
     주소나 저장소처럼 브라우저에만 있는 값은 서버가 그린 HTML 과
     어긋나므로 useState 초기화에서 읽을 수 없습니다. 스냅샷으로 받아
     값이 바뀐 그 렌더에서 곧바로 반영합니다 — effect 에서 setState 하면
     렌더가 한 번 더 도는 낭비가 생깁니다. */
  const draftKey = useSyncExternalStore(
    subscribeNever,
    () => (loadDraft(design.id) ? design.id : ""),
    () => "",
  );
  const [restoredFrom, setRestoredFrom] = useState("");
  if (draftKey && draftKey !== restoredFrom) {
    setRestoredFrom(draftKey);
    const saved = loadDraft(design.id);
    if (saved) setDoc(saved);
  }
  const restored = restoredFrom !== "";

  /* 타이핑할 때마다 저장하면 매 글자마다 직렬화가 돕니다. 잠깐 멈출
     때 한 번만 씁니다. */
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => saveDraft(doc), 400);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [doc]);

  const set = useCallback(
    <K extends keyof CardDoc>(key: K, value: CardDoc[K]) =>
      setDoc((d) => ({ ...d, [key]: value })),
    [],
  );
  const setHand = useCallback(
    <K extends keyof Handwriting>(key: K, value: Handwriting[K]) =>
      setDoc((d) => ({ ...d, hand: { ...d.hand, [key]: value } })),
    [],
  );

  const makeLink = () => {
    const url = `${window.location.origin}/invitation-card/open/?c=${encodeDoc(doc)}`;
    setLink(url);
    setCopied(false);
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 클립보드가 막힌 브라우저 — 주소칸을 직접 고를 수 있게 두었습니다 */
    }
  };

  const reset = () => {
    clearDraft(design.id);
    setDoc(createDoc(design.id));
    setRestoredFrom("");
  };

  return (
    <div className="min-h-dvh bg-cream pb-28">
      {/* ── 머리 ── */}
      <header className="sticky top-0 z-30 border-b border-line bg-ivory/92 backdrop-blur">
        <div className="shell flex items-center justify-between gap-4 py-3">
          <Link
            href="/invitation-card"
            className="text-caption text-ink-soft hover:text-ink"
          >
            ‹ 카드 고르기
          </Link>
          <p className="truncate font-serif text-[0.9375rem] text-ink">
            {design.name}
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-caption text-muted hover:text-ink"
          >
            처음부터
          </button>
        </div>
      </header>

      <div className="shell grid gap-8 pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:pt-12">
        {/* ── 카드 ── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CardBook design={design} doc={doc} step={step} onStep={setStep} />
          <p className="mt-3 text-center text-[0.75rem] text-muted">
            받는 분 화면에서는 카드가 저절로 펴집니다
          </p>
        </div>

        {/* ── 쓰는 곳 ── */}
        <div className="grid gap-5">
          {restored && (
            <p className="rounded-lg border border-line bg-white px-4 py-3 text-caption text-ink-soft">
              전에 쓰던 내용을 이어서 열었습니다.
            </p>
          )}

          {step === 0 && (
            <Panel
              title="앞면"
              desc="카드를 받은 사람이 가장 먼저 보는 면입니다. 두 줄이면 충분합니다."
            >
              <Field label="행사 이름">
                <Text value={doc.title} onChange={(v) => set("title", v)} />
              </Field>
              <Field label="한 줄">
                <Text
                  value={doc.subtitle}
                  onChange={(v) => set("subtitle", v)}
                  placeholder="비워 두어도 됩니다"
                />
              </Field>
            </Panel>
          )}

          {step === 1 && (
            <>
              <Panel title="안쪽 왼쪽 — 행사 정보" desc="인쇄되는 면입니다.">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="날짜">
                    <input
                      type="date"
                      className="cw-input"
                      value={doc.date}
                      onChange={(e) => set("date", e.target.value)}
                    />
                  </Field>
                  <Field label="시간">
                    <input
                      type="time"
                      className="cw-input"
                      value={doc.time}
                      onChange={(e) => set("time", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="장소">
                  <Text value={doc.place} onChange={(v) => set("place", v)} />
                </Field>
                <Field label="주최">
                  <Text value={doc.host} onChange={(v) => set("host", v)} />
                </Field>
              </Panel>

              <Panel
                title="안쪽 오른쪽 — 손으로 쓰는 글"
                desc="카드에서 유일하게 자유로운 면입니다. 줄바꿈이 그대로 살아납니다."
              >
                <Field label="인사말">
                  <textarea
                    className="cw-input min-h-44 leading-relaxed"
                    value={doc.greeting}
                    onChange={(e) => set("greeting", e.target.value)}
                  />
                </Field>

                <Field label="글씨체">
                  <div className="flex flex-wrap gap-2">
                    {HAND_FONTS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setHand("font", f.id)}
                        aria-pressed={f.id === doc.hand.font}
                        style={{ fontFamily: fontStack(f.id) }}
                        className={`rounded-full border px-3.5 py-2 text-[0.875rem] transition-colors ${
                          f.id === doc.hand.font
                            ? "border-rose-deep bg-rose-deep text-white"
                            : "border-line bg-white text-ink hover:border-rose"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label={`글씨 크기 ${doc.hand.size}%`}>
                    <input
                      type="range"
                      min={70}
                      max={140}
                      step={5}
                      value={doc.hand.size}
                      onChange={(e) => setHand("size", Number(e.target.value))}
                      className="w-full accent-rose-deep"
                    />
                  </Field>
                  <Field label="정렬">
                    <div className="flex gap-2">
                      {(
                        [
                          ["left", "왼쪽"],
                          ["center", "가운데"],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setHand("align", id)}
                          aria-pressed={doc.hand.align === id}
                          className={`flex-1 rounded-md border px-3 py-2 text-caption transition-colors ${
                            doc.hand.align === id
                              ? "border-rose-deep bg-rose-veil text-ink"
                              : "border-line bg-white text-ink-soft hover:border-rose"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </Panel>
            </>
          )}

          {step === 2 && (
            <Panel
              title="뒷면"
              desc="오시는 길과 알려 둘 것. 주소를 넣으면 지도 버튼이 생깁니다."
            >
              <Field label="주소">
                <Text value={doc.address} onChange={(v) => set("address", v)} />
              </Field>
              <Field label="안내">
                <textarea
                  className="cw-input min-h-24"
                  value={doc.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="주차, 우천 시, 복장 같은 것"
                />
              </Field>
              <Field label="참석 회신받을 곳">
                <Text
                  value={doc.rsvpTo}
                  onChange={(v) => set("rsvpTo", v)}
                  placeholder="010-0000-0000 · 비우면 뒷면에 나오지 않습니다"
                />
              </Field>
            </Panel>
          )}

          <p className="text-caption text-muted">
            {getOccasion(design.occasion)?.label} 카드 · 쓰신 내용은 이
            브라우저에만 저장됩니다.
          </p>
        </div>
      </div>

      {/* ── 바닥 ── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 backdrop-blur">
        <div className="shell flex items-center justify-between gap-4 py-3">
          <div className="flex gap-1">
            {(["앞면", "안쪽", "뒷면"] as const).map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i as Step)}
                aria-pressed={i === step}
                className={`rounded-full px-3.5 py-2 text-caption transition-colors ${
                  i === step
                    ? "bg-ink text-ivory"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={makeLink} className="btn btn-primary py-3">
            링크 만들기
          </button>
        </div>
      </div>

      {link && (
        <div
          className="cm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="초대장 링크"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLink(null);
          }}
        >
          <div className="cm-panel max-w-lg p-8">
            <span className="eyebrow">Share</span>
            <h2 className="mt-3 font-serif text-h2 text-ink">
              링크가 만들어졌습니다
            </h2>
            <p className="mt-3 text-caption text-ink-soft">
              이 주소 안에 카드 내용이 통째로 들어 있습니다. 카카오톡이나
              문자에 붙여 넣으면, 받는 분 화면에서 카드가 펴집니다.
            </p>
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="cw-input mt-5 font-mono text-[0.75rem]"
            />
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={copy} className="btn btn-primary flex-1">
                {copied ? "복사했습니다" : "주소 복사"}
              </button>
              <a
                href={link}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-ghost flex-1 bg-white"
              >
                열어 보기
              </a>
            </div>
            <button
              type="button"
              onClick={() => setLink(null)}
              className="mt-6 text-caption text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 작은 조각들 ---------- */

function Panel({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="font-serif text-h3 text-ink">{title}</h2>
      <p className="mt-1.5 text-caption text-muted">{desc}</p>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.75rem] text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

function Text({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="cw-input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
