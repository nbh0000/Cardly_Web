"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { InviteCard } from "@/components/occasion/card";
import { Cover, designStyle } from "@/components/occasion/cover";
import { DESIGNS } from "@/lib/occasion/designs";
import { OCCASIONS, sampleFor } from "@/lib/occasion/occasions";
import { encodeInvite } from "@/lib/occasion/share";
import type { InviteData } from "@/lib/occasion/types";

/* ════════════════════════════════════════════════════════════
   만들고 보내는 화면

   서버가 없으므로 내용은 주소 뒤에 실려 나갑니다(lib/occasion/share).
   그래서 가입도 결제도 없고, 적은 글이 이 브라우저 밖으로 나가는 때는
   «링크를 직접 보낼 때» 뿐입니다.

   화면 순서는 휴대폰을 기준으로 짰습니다.
     ① 카드가 먼저 보이고(항상 3D 로 열리는 그 카드입니다)
     ② 아래에서 내용을 고치고
     ③ 맨 아래 고정된 단추로 보냅니다.
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

/* ── 입력 한 칸 ── */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-caption text-ink">{label}</span>
      {hint && <span className="mt-0.5 block text-[0.75rem] text-muted">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

const INPUT =
  "w-full min-h-[44px] rounded-md border border-line bg-white px-3.5 py-2.5 text-body text-ink outline-none transition-colors placeholder:text-hint focus:border-rose";

export function Maker({ initial }: { initial: InviteData }) {
  const [data, setData] = useState<InviteData>(initial);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const restored = useRef(false);

  const origin = useOrigin();
  const canShare = useCanShare();

  const link = useMemo(
    () => `${origin}/invitation-card/v/?c=${encodeInvite(data)}`,
    [origin, data],
  );

  /* 적다 만 초안을 되살립니다. 효과(effect)가 아니라 ref 로 하는 것은
     이 저장소의 규칙(setState 를 효과 안에서 쓰지 않기) 때문이기도 하고,
     첫 그림과 브라우저 그림이 어긋나지 않게 하려는 것이기도 합니다.
     «같은 디자인의 초안» 일 때만 되살립니다 — 다른 카드를 고른 사람에게
     엉뚱한 내용을 들이밀지 않으려는 것입니다. */
  const restore = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el || restored.current) return;
      restored.current = true;
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as InviteData;
        if (saved && saved.d === initial.d) setData(saved);
      } catch {
        /* 저장소를 막아 둔 브라우저도 있습니다. 없으면 없는 대로 씁니다. */
      }
    },
    [initial.d],
  );

  const set = useCallback(<K extends keyof InviteData>(k: K, v: InviteData[K]) => {
    setData((d) => {
      const next = { ...d, [k]: v };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* 저장이 막혀 있어도 편집은 계속됩니다. */
      }
      return next;
    });
  }, []);

  /* 디자인을 바꿔도 적어 둔 내용은 그대로 둡니다. 여기서 내용까지
     갈아 끼우면 힘들게 쓴 글이 날아갑니다. */
  const pickDesign = useCallback(
    (id: string) => {
      set("d", id);
    },
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

  const smsBody = `${data.title.replace(/\n/g, " ")}\n초대합니다. 아래 링크를 눌러 카드를 열어 보세요.\n${link}`;

  return (
    <div ref={restore}>
      {/* ── ① 카드 ── */}
      <section className="bg-cream/60 pt-8 pb-10">
        <div className="shell">
          <p className="text-center text-[0.75rem] tracking-[0.2em] text-muted">
            받는 사람에게 이렇게 보입니다
          </p>
          <div className="mt-6">
            {/* key 를 걸어 디자인을 바꿀 때마다 닫힌 상태에서 다시 시작합니다 */}
            <InviteCard key={data.d} data={data} lockScroll={false} />
          </div>
        </div>
      </section>

      {/* ── ② 디자인 고르기 ── */}
      <section className="pt-block">
        <div className="shell">
          <h2 className="font-serif text-h2 text-ink">디자인</h2>
          <p className="mt-2 text-caption text-ink-soft">
            바꿔도 적어 둔 내용은 그대로 남습니다.
          </p>
        </div>

        {OCCASIONS.map((o) => (
          <div key={o.id} className="mt-8">
            <div className="shell">
              <p className="text-[0.6875rem] tracking-[0.22em] text-muted uppercase">
                {o.en} · {o.label}
              </p>
            </div>
            {/* 가로로 넘겨 고릅니다 — 휴대폰에서 세로로 길게 늘어놓으면
                고르다 지칩니다. */}
            <ul className="mt-3 flex snap-x gap-3 overflow-x-auto px-[max(1.25rem,calc((100vw-72rem)/2))] pb-2">
              {DESIGNS.filter((d) => d.occasion === o.id).map((d) => {
                const s = sampleFor(d.id, d.occasion);
                const on = d.id === data.d;
                return (
                  <li key={d.id} className="shrink-0 snap-start">
                    <button
                      type="button"
                      onClick={() => pickDesign(d.id)}
                      aria-pressed={on}
                      className={`block w-[6.5rem] rounded-md p-1.5 transition-colors ${
                        on ? "bg-rose-mist" : "hover:bg-sand"
                      }`}
                    >
                      <span
                        className="oc block aspect-[3/4] overflow-hidden shadow-card"
                        style={designStyle(d)}
                      >
                        <Cover
                          design={d}
                          eyebrow={s.eyebrow}
                          title={s.title}
                          date={s.date}
                        />
                      </span>
                      <span
                        className={`mt-2 block text-center text-[0.6875rem] ${
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

      {/* ── ③ 내용 채우기 ── */}
      <section className="mt-section">
        <div className="shell max-w-narrow">
          <h2 className="font-serif text-h2 text-ink">내용</h2>
          <p className="mt-2 text-caption text-ink-soft">
            고친 자리는 바로 위 카드에 그대로 반영됩니다.
          </p>

          <div className="mt-block grid gap-5">
            <Field label="표지 윗줄" hint="영문 한 줄. 비워도 됩니다.">
              <input
                className={INPUT}
                value={data.eyebrow}
                onChange={(e) => set("eyebrow", e.target.value)}
                placeholder="Birthday"
              />
            </Field>

            <Field label="표지 큰 글씨" hint="줄을 바꾸면 카드에서도 바뀝니다.">
              <textarea
                className={`${INPUT} min-h-[5.5rem] resize-y font-serif`}
                value={data.title}
                onChange={(e) => set("title", e.target.value)}
                rows={2}
              />
            </Field>

            <Field label="초대하는 사람">
              <input
                className={INPUT}
                value={data.host}
                onChange={(e) => set("host", e.target.value)}
                placeholder="박지우"
              />
            </Field>

            <Field label="초대 글">
              <textarea
                className={`${INPUT} min-h-[9rem] resize-y`}
                value={data.message}
                onChange={(e) => set("message", e.target.value)}
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

            <Field label="장소 이름">
              <input
                className={INPUT}
                value={data.place}
                onChange={(e) => set("place", e.target.value)}
                placeholder="연남동 술집 목요일"
              />
            </Field>

            <Field label="주소" hint="이 주소로 «길 찾기» 단추가 만들어집니다.">
              <input
                className={INPUT}
                value={data.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="서울 마포구 성미산로 161-4"
              />
            </Field>

            <Field label="안내 한 줄" hint="주차, 드레스코드 같은 것. 비우면 칸이 사라집니다.">
              <input
                className={INPUT}
                value={data.note}
                onChange={(e) => set("note", e.target.value)}
              />
            </Field>

            <Field label="연락처" hint="비우면 «전화하기» 단추가 사라집니다.">
              <input
                type="tel"
                inputMode="tel"
                className={INPUT}
                value={data.phone}
                onChange={(e) => set("phone", e.target.value)}
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
                «참석한다고 알리기» 단추 넣기
                <span className="block text-[0.75rem] text-muted">
                  누르면 위 연락처로 문자가 작성됩니다.
                </span>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* 고정 단추에 가리지 않도록 아래를 비워 둡니다 */}
      <div className="h-32" />

      {/* ── 보내기 ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/92 backdrop-blur">
        <div className="shell flex items-center gap-3 py-3">
          <p className="min-w-0 flex-1 truncate text-[0.75rem] text-muted">
            {data.title.replace(/\n/g, " ")}
          </p>
          <button
            type="button"
            className="btn btn-primary shrink-0"
            onClick={() => setSending(true)}
          >
            초대장 보내기
          </button>
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
              <a className="btn btn-ghost bg-white" href={`sms:?&body=${encodeURIComponent(smsBody)}`}>
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

            <p className="mt-5 break-all rounded-md bg-cream px-3 py-2.5 font-mono text-[0.6875rem] leading-relaxed text-muted">
              {link}
            </p>

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
