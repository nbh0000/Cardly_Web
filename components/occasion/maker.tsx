"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ClosedCard } from "@/components/occasion/fold";
import { FoldedCard } from "@/components/occasion/folded-card";
import { DESIGNS, findDesign } from "@/lib/occasion/designs";
import { OCCASIONS } from "@/lib/occasion/occasions";
import { encodeInvite } from "@/lib/occasion/share";
import { LIMITS, type InviteData } from "@/lib/occasion/types";

/* ════════════════════════════════════════════════════════════
   만들고 보내는 화면 — 세 걸음

     ① 디자인 고르기 → ② 내용 채우기 → ③ 보내기

   개편 전에는 한 화면에 카드·디자인 목록·입력칸이 전부 세로로 쌓여
   있었습니다. 무엇부터 해야 하는지가 화면에 안 적혀 있으면 사람은 위에서
   아래로 다 훑고 나서야 시작합니다. 걸음을 나누면 «지금 할 일» 이 하나가
   됩니다.

   미리보기는 받는 사람 화면과 같은 컴포넌트(FoldedCard)입니다. 복제하면
   반드시 한쪽만 고쳐지는 날이 옵니다.

   서버가 없으므로 내용은 주소 뒤에 실려 나갑니다(lib/occasion/share).
   가입도 결제도 없고, 적은 글이 이 브라우저 밖으로 나가는 때는 «링크를
   직접 보낼 때» 뿐입니다.
   ════════════════════════════════════════════════════════════ */

const DRAFT_KEY = "cardly:occasion:draft";
const subscribeNever = () => () => {};

function useOrigin(): string {
  return useSyncExternalStore(
    subscribeNever,
    () => window.location.origin,
    () => "https://cardly.kr",
  );
}

function useCanShare(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => typeof navigator !== "undefined" && !!navigator.share,
    () => false,
  );
}

const STEPS = ["디자인", "내용", "보내기"] as const;
type Step = 0 | 1 | 2;

/* ── 입력 한 칸 ──────────────────────────────────────────────
   글자 수 상한을 화면에 적습니다. maxLength 만 걸어 두면 사용자는 왜 더
   안 써지는지 모른 채 키를 계속 누릅니다. */

function Field({
  label,
  hint,
  value,
  max,
  children,
}: {
  label: string;
  hint?: string;
  value?: string;
  max?: number;
  children: React.ReactNode;
}) {
  const over = max !== undefined && value !== undefined && value.length > max * 0.9;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-caption text-ink">{label}</span>
        {max !== undefined && value !== undefined && (
          <span
            className={`text-[0.6875rem] tabular-nums ${
              over ? "text-rose-deep" : "text-muted"
            }`}
          >
            {value.length} / {max}
          </span>
        )}
      </span>
      {hint && <span className="mt-0.5 block text-[0.75rem] text-muted">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

const INPUT =
  "w-full min-h-[44px] rounded-md border border-line bg-white px-3.5 py-2.5 text-body text-ink outline-none transition-colors placeholder:text-hint focus:border-rose";

export function Maker({ initial }: { initial: InviteData }) {
  const [data, setData] = useState<InviteData>(initial);
  const [step, setStep] = useState<Step>(0);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  /** 마지막으로 저장한 시각 — 저장했다는 것을 눈에 보이게 합니다 */
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const restored = useRef(false);

  const origin = useOrigin();
  const canShare = useCanShare();
  const design = findDesign(data.d) ?? DESIGNS[0]!;

  const link = useMemo(
    () => `${origin}/invitation-card/v/${data.d}/?c=${encodeInvite(data)}`,
    [origin, data],
  );

  /* 적다 만 초안을 되살립니다. 효과가 아니라 ref 로 하는 것은 첫 그림과
     브라우저 그림이 어긋나지 않게 하려는 것입니다. 디자인이 달라도
     되살립니다 — 힘들게 쓴 글이 디자인을 바꿨다는 이유로 날아가면
     안 됩니다. */
  const restore = useCallback((el: HTMLDivElement | null) => {
    if (!el || restored.current) return;
    restored.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<InviteData>;
      if (saved && typeof saved === "object") {
        setData((d) => ({ ...d, ...saved, d: findDesign(saved.d) ? saved.d! : d.d }));
      }
    } catch {
      /* 저장소를 막아 둔 브라우저도 있습니다. 없으면 없는 대로 씁니다. */
    }
  }, []);

  const set = useCallback(
    <K extends keyof InviteData>(k: K, v: InviteData[K]) => {
      setData((d) => {
        const next = { ...d, [k]: v };
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
          setSavedAt(
            new Date().toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
        } catch {
          /* 저장이 막혀 있어도 편집은 계속됩니다. */
        }
        return next;
      });
    },
    [],
  );

  /** 글자 수를 넘겨 붙여 넣어도 상한에서 끊습니다 */
  const setText = useCallback(
    (k: keyof typeof LIMITS, v: string) => set(k, v.slice(0, LIMITS[k])),
    [set],
  );

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(link).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => {},
    );
  }, [link]);

  const share = useCallback(() => {
    navigator
      .share?.({
        title: data.title.replace(/\n/g, " "),
        text: `${data.title.replace(/\n/g, " ")} — 초대합니다`,
        url: link,
      })
      .catch(() => {});
  }, [data.title, link]);

  /* 걸음을 옮기면 맨 위로 — 아래에 머문 채 바뀌면 무엇이 바뀌었는지
     보이지 않습니다. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const smsBody = `${data.title.replace(/\n/g, " ")}\n초대합니다. 아래 링크를 눌러 카드를 열어 보세요.\n${link}`;

  return (
    <div ref={restore} className="pb-32">
      {/* ── 걸음 표시 ── */}
      <nav className="border-b border-line bg-ivory/92 sticky top-16 z-30 backdrop-blur md:top-20">
        <ol className="shell flex items-center gap-2 py-3">
          {STEPS.map((label, i) => {
            const state = i === step ? "on" : i < step ? "done" : "todo";
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(i as Step)}
                  aria-current={state === "on" ? "step" : undefined}
                  className={`flex min-h-[44px] flex-1 items-center gap-2 rounded-md px-3 text-caption transition-colors ${
                    state === "on"
                      ? "bg-rose-veil text-rose-deep"
                      : state === "done"
                        ? "text-ink-soft hover:bg-sand"
                        : "text-muted hover:bg-sand"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.6875rem] ${
                      state === "todo"
                        ? "bg-sand text-muted"
                        : "bg-rose-deep text-white"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ── ① 디자인 고르기 ── */}
      {step === 0 && (
        <section className="pt-block">
          <div className="shell">
            <h2 className="font-serif text-h2 text-ink">어떤 카드로 보낼까요</h2>
            <p className="mt-2 text-caption text-ink-soft">
              나중에 바꿔도 적어 둔 내용은 그대로 남습니다.
            </p>
          </div>

          {OCCASIONS.map((o) => (
            <div key={o.id} className="mt-block">
              <div className="shell">
                <p className="text-[0.6875rem] tracking-[0.22em] text-muted uppercase">
                  {o.en} · {o.label}
                </p>
              </div>
              <ul className="oc-grid shell mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {DESIGNS.filter((d) => d.occasion === o.id).map((d) => {
                  const on = d.id === data.d;
                  return (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => {
                          set("d", d.id);
                          setStep(1);
                        }}
                        aria-pressed={on}
                        className={`block w-full rounded-md p-2 text-left transition-colors ${
                          on ? "bg-rose-mist" : "hover:bg-sand"
                        }`}
                      >
                        <ClosedCard design={d} data={data} />
                        <span
                          className={`mt-2 block text-center text-[0.75rem] ${
                            on ? "text-rose-deep" : "text-ink-soft"
                          }`}
                        >
                          {d.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ── ② 내용 채우기 ── */}
      {step === 1 && (
        <div className="shell pt-block lg:grid lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-12">
          <section>
            <h2 className="font-serif text-h2 text-ink">내용</h2>
            <p className="mt-2 text-caption text-ink-soft">
              표지 · 인사말 · 일정이 각각 카드의 한 면입니다. 고친 자리는 옆
              카드에 바로 반영됩니다.
            </p>

            <div className="mt-block grid gap-5">
              <Field
                label="표지 윗줄"
                hint="영문 한 줄. 비워도 됩니다."
                value={data.eyebrow}
                max={LIMITS.eyebrow}
              >
                <input
                  className={INPUT}
                  value={data.eyebrow}
                  maxLength={LIMITS.eyebrow}
                  onChange={(e) => setText("eyebrow", e.target.value)}
                  placeholder="Birthday"
                />
              </Field>

              <Field
                label="표지 큰 글씨"
                hint="줄을 바꾸면 카드에서도 바뀝니다."
                value={data.title}
                max={LIMITS.title}
              >
                <textarea
                  className={`${INPUT} min-h-[5.5rem] resize-y font-serif`}
                  value={data.title}
                  maxLength={LIMITS.title}
                  onChange={(e) => setText("title", e.target.value)}
                  rows={2}
                />
              </Field>

              <Field
                label="초대하는 사람"
                hint="이니셜 표지에서는 이 이름의 첫 글자가 쓰입니다."
                value={data.host}
                max={LIMITS.host}
              >
                <input
                  className={INPUT}
                  value={data.host}
                  maxLength={LIMITS.host}
                  onChange={(e) => setText("host", e.target.value)}
                  placeholder="박지우"
                />
              </Field>

              <Field
                label="초대 글"
                hint="카드를 열면 왼쪽 면에 실립니다."
                value={data.message}
                max={LIMITS.message}
              >
                <textarea
                  className={`${INPUT} min-h-[9rem] resize-y`}
                  value={data.message}
                  maxLength={LIMITS.message}
                  onChange={(e) => setText("message", e.target.value)}
                  rows={6}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="날짜">
                  <input
                    type="date"
                    className={INPUT}
                    value={data.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                </Field>
                <Field label="시각">
                  <input
                    type="time"
                    className={INPUT}
                    value={data.time}
                    onChange={(e) => set("time", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="장소 이름" value={data.place} max={LIMITS.place}>
                <input
                  className={INPUT}
                  value={data.place}
                  maxLength={LIMITS.place}
                  onChange={(e) => setText("place", e.target.value)}
                  placeholder="연남동 술집 목요일"
                />
              </Field>

              <Field
                label="주소"
                hint="이 주소로 «길 찾기» 단추가 만들어집니다."
                value={data.address}
                max={LIMITS.address}
              >
                <input
                  className={INPUT}
                  value={data.address}
                  maxLength={LIMITS.address}
                  onChange={(e) => setText("address", e.target.value)}
                  placeholder="서울 마포구 성미산로 161-4"
                />
              </Field>

              <Field
                label="안내 한 줄"
                hint="주차, 드레스코드 같은 것. 비우면 칸이 사라집니다."
                value={data.note}
                max={LIMITS.note}
              >
                <input
                  className={INPUT}
                  value={data.note}
                  maxLength={LIMITS.note}
                  onChange={(e) => setText("note", e.target.value)}
                />
              </Field>

              <Field
                label="연락처"
                hint="비우면 «전화하기» 단추가 사라집니다."
                value={data.phone}
                max={LIMITS.phone}
              >
                <input
                  type="tel"
                  inputMode="tel"
                  className={INPUT}
                  value={data.phone}
                  maxLength={LIMITS.phone}
                  onChange={(e) => setText("phone", e.target.value)}
                  placeholder="010-0000-0000"
                />
              </Field>

              <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--color-rose-deep)]"
                  checked={data.rsvp}
                  onChange={(e) => set("rsvp", e.target.checked)}
                />
                <span className="text-body text-ink">
                  «참석 알리기» 단추 넣기
                  <span className="block text-[0.75rem] text-muted">
                    누르면 위 연락처로 문자가 작성됩니다.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* 옆에 붙는 미리보기 — 받는 사람 화면과 같은 컴포넌트입니다 */}
          <aside className="mt-block lg:sticky lg:top-36 lg:mt-0 lg:self-start">
            <p className="mb-4 text-center text-[0.75rem] tracking-[0.2em] text-muted">
              받는 사람에게 이렇게 보입니다
            </p>
            {/* key 를 걸어 디자인을 바꿀 때마다 닫힌 상태에서 다시 시작합니다.
                화살표 키는 끕니다 — 입력칸을 오가는 키와 부딪칩니다. */}
            <FoldedCard
              key={data.d}
              data={data}
              design={design}
              keyboard={false}
              actions={false}
            />
          </aside>
        </div>
      )}

      {/* ── ③ 보내기 ── */}
      {step === 2 && (
        <section className="shell pt-block">
          <h2 className="text-center font-serif text-h2 text-ink">
            받는 사람 화면 그대로입니다
          </h2>
          <p className="mt-2 text-center text-caption text-ink-soft">
            표지를 눌러 카드를 열어 보세요. 이대로 나갑니다.
          </p>

          <div className="mt-block">
            <FoldedCard data={data} design={design} />
          </div>

          <div className="mx-auto mt-block grid max-w-narrow gap-2">
            {canShare && (
              <button type="button" className="btn btn-primary" onClick={share}>
                카카오톡 · 메시지로 보내기
              </button>
            )}
            <a
              className="btn btn-ghost bg-white"
              href={`sms:?&body=${encodeURIComponent(smsBody)}`}
            >
              문자로 보내기
            </a>
            <button type="button" className="btn btn-ghost bg-white" onClick={copy}>
              {copied ? "복사했습니다" : "링크 복사"}
            </button>
            <p className="mt-2 break-all rounded-md bg-cream px-3 py-2.5 font-mono text-[0.6875rem] leading-relaxed text-muted">
              {link}
            </p>
          </div>
        </section>
      )}

      {/* ── 아래 고정 줄 — 저장 표시와 다음 걸음 ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/92 backdrop-blur">
        <div className="shell flex items-center gap-3 py-3">
          <p
            className="min-w-0 flex-1 truncate text-[0.75rem] text-muted"
            aria-live="polite"
          >
            {savedAt ? `${savedAt} 자동 저장됨` : "적는 대로 이 브라우저에 저장됩니다"}
          </p>
          {step > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm bg-white"
              onClick={() => setStep((s) => (s - 1) as Step)}
            >
              이전
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              className="btn btn-primary shrink-0"
              onClick={() => setStep((s) => (s + 1) as Step)}
            >
              {step === 0 ? "내용 채우기" : "미리 보고 보내기"}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary shrink-0"
              onClick={() => setSending(true)}
            >
              보내는 방법
            </button>
          )}
        </div>
      </div>

      {sending && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setSending(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="초대장 보내기"
            className="relative w-full max-w-narrow rounded-t-xl bg-white p-6 shadow-lift sm:rounded-xl"
          >
            <h3 className="font-serif text-h2 text-ink">보내기</h3>
            <p className="mt-2 text-caption text-ink-soft">
              내용이 링크 안에 통째로 들어 있습니다. 이 링크를 받은 사람은
              가입 없이 카드를 열어 봅니다.
            </p>

            <div className="mt-6 grid gap-2">
              {canShare && (
                <button type="button" className="btn btn-primary" onClick={share}>
                  카카오톡 · 메시지로 보내기
                </button>
              )}
              <a
                className="btn btn-ghost bg-white"
                href={`sms:?&body=${encodeURIComponent(smsBody)}`}
              >
                문자로 보내기
              </a>
              <button type="button" className="btn btn-ghost bg-white" onClick={copy}>
                {copied ? "복사했습니다" : "링크 복사"}
              </button>
              {/* Link 가 아니라 a 입니다 — 받는 사람이 링크를 눌렀을 때와
                  똑같이 «새로 여는» 것이어야 미리보기 값을 합니다. */}
              <a className="btn btn-ghost bg-white" href={link}>
                받는 사람 화면으로 열어 보기
              </a>
            </div>

            <button
              type="button"
              className="mt-4 min-h-[44px] w-full text-caption text-muted"
              onClick={() => setSending(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
