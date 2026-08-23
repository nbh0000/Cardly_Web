"use client";

/**
 * 접힌 초대장 아래에 붙는 하객 응답 — 참석 여부와 방명록.
 *
 * 청첩장은 길게 내려 읽는 페이지라 이 칸들이 본문 안에 들어가지만, 초대장은
 * 카드 한 장이라 안에 넣을 자리가 없습니다. 그래서 카드 아래에 둡니다.
 * 카드는 카드대로 온전히 두고, 응답은 «봉투 밖» 에 두는 셈입니다.
 *
 * 무료로 발행한 초대장에는 아예 나오지 않습니다(위에서 걸러 부릅니다).
 */

import { useEffect, useState } from "react";
import {
  listGuestbook,
  submitGuestbook,
  submitRsvp,
  type GuestbookEntry,
} from "@/lib/backend/guests";

const INPUT =
  "w-full min-h-[44px] rounded-md border border-line bg-white px-3.5 py-2.5 text-body text-ink outline-none transition-colors placeholder:text-hint focus:border-rose";

export function GuestExtras({
  slug,
  demo,
  askRsvp,
}: {
  slug: string;
  /** 샘플 링크 — 화면은 같지만 아무것도 남기지 않습니다 */
  demo?: boolean;
  askRsvp: boolean;
}) {
  return (
    <div className="mx-auto mt-block grid max-w-narrow gap-10">
      {askRsvp && <RsvpBox slug={slug} demo={demo} />}
      <GuestbookBox slug={slug} demo={demo} />
    </div>
  );
}

function RsvpBox({ slug, demo }: { slug: string; demo?: boolean }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <section className="rounded-lg border border-line bg-white p-6 text-center">
        <p className="font-serif text-h3 text-ink">전해 드렸습니다</p>
        <p className="mt-2 text-caption text-ink-soft">
          {demo ? "샘플이라 실제로 저장되지는 않았습니다." : "고맙습니다. 그날 뵙겠습니다."}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="font-serif text-h3 text-ink">참석 여부</h2>
      <p className="mt-2 text-caption text-ink-soft">
        준비하는 데 큰 도움이 됩니다. 한 줄만 남겨 주세요.
      </p>

      <form
        className="mt-5 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get("name") ?? "").trim();
          if (!name) return;
          if (demo) {
            setSent(true);
            return;
          }
          setSending(true);
          setError(null);
          submitRsvp(slug, {
            name,
            attending: fd.get("att") !== "no",
            party: Number(fd.get("party") ?? 1) || 1,
            message: String(fd.get("message") ?? "").trim(),
          })
            .then(() => setSent(true))
            .catch((e: unknown) =>
              setError(e instanceof Error ? e.message : "전달하지 못했습니다."),
            )
            .finally(() => setSending(false));
        }}
      >
        <label className="block">
          <span className="text-caption text-ink">성함</span>
          <input className={`${INPUT} mt-2`} name="name" maxLength={40} required />
        </label>

        <fieldset className="grid gap-2">
          <legend className="text-caption text-ink">참석하시나요</legend>
          <div className="flex gap-4">
            <label className="flex min-h-[44px] items-center gap-2 text-body text-ink">
              <input type="radio" name="att" value="yes" defaultChecked className="h-5 w-5 accent-[var(--color-rose-deep)]" />
              참석합니다
            </label>
            <label className="flex min-h-[44px] items-center gap-2 text-body text-ink">
              <input type="radio" name="att" value="no" className="h-5 w-5 accent-[var(--color-rose-deep)]" />
              어렵습니다
            </label>
          </div>
        </fieldset>

        <label className="block">
          <span className="text-caption text-ink">함께 오시는 인원 (본인 포함)</span>
          <input
            className={`${INPUT} mt-2`}
            type="number"
            name="party"
            min={1}
            max={20}
            defaultValue={1}
          />
        </label>

        <label className="block">
          <span className="text-caption text-ink">전하실 말씀 (선택)</span>
          <textarea className={`${INPUT} mt-2`} name="message" rows={2} maxLength={300} />
        </label>

        {error && <p className="text-[0.8125rem] text-rose-deep">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "보내는 중…" : "참석 여부 전하기"}
        </button>
      </form>
    </section>
  );
}

function GuestbookBox({ slug, demo }: { slug: string; demo?: boolean }) {
  const [notes, setNotes] = useState<GuestbookEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) return;
    let alive = true;
    listGuestbook(slug)
      .then((rows) => alive && setNotes(rows))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [slug, demo]);

  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="font-serif text-h3 text-ink">축하 한마디</h2>

      {notes.length > 0 && (
        <ul className="mt-5 grid gap-4">
          {notes.map((n) => (
            <li key={n.id} className="border-b border-line-soft pb-4 last:border-0 last:pb-0">
              <p className="text-caption text-ink">{n.name}</p>
              <p className="mt-1 text-body whitespace-pre-wrap text-ink-soft">{n.message}</p>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-5 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          const name = String(fd.get("name") ?? "").trim();
          const message = String(fd.get("message") ?? "").trim();
          if (!name || !message) return;

          if (demo) {
            setNotes((prev) => [
              { id: `demo-${prev.length}`, name, message, created_at: new Date().toISOString() },
              ...prev,
            ]);
            form.reset();
            return;
          }

          setSending(true);
          setError(null);
          submitGuestbook(slug, name, message)
            .then(() => listGuestbook(slug))
            .then((rows) => {
              setNotes(rows);
              form.reset();
            })
            .catch((e: unknown) =>
              setError(e instanceof Error ? e.message : "남기지 못했습니다."),
            )
            .finally(() => setSending(false));
        }}
      >
        <label className="block">
          <span className="text-caption text-ink">이름</span>
          <input className={`${INPUT} mt-2`} name="name" maxLength={20} required />
        </label>
        <label className="block">
          <span className="text-caption text-ink">글</span>
          <textarea className={`${INPUT} mt-2`} name="message" rows={3} maxLength={500} required />
        </label>
        {error && <p className="text-[0.8125rem] text-rose-deep">{error}</p>}
        <button type="submit" className="btn btn-ghost bg-white" disabled={sending}>
          {sending ? "남기는 중…" : "남기기"}
        </button>
      </form>
    </section>
  );
}
