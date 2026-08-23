"use client";

/**
 * 문서 한 건의 관리 화면 — 발행 · 링크 · 결제 · 하객 응답.
 *
 * 주소가 /account/doc/?id=… 인 것은 정적 배포이기 때문입니다. /account/<id>
 * 처럼 경로에 아이디를 넣으려면 그 아이디마다 HTML 이 미리 있어야 하는데,
 * 사람이 문서를 만들 때마다 사이트를 다시 구울 수는 없습니다. 물음표 뒤는
 * 정적 호스팅도 그대로 넘겨 줍니다.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useNow, useQueryParam } from "@/lib/backend/browser";
import { SharePanel } from "@/components/publish/share-panel";
import {
  closeDoc,
  docUrl,
  getDoc,
  publishDoc,
  type DocRow,
} from "@/lib/backend/docs";
import {
  deleteGuestbookEntry,
  deleteRsvp,
  listGuestbookAll,
  listRsvps,
  summarize,
  type GuestbookRow,
  type RsvpRow,
} from "@/lib/backend/guests";
import { paymentsEnabled, startCheckout } from "@/lib/backend/payments";
import { formatPrice, PAID_GRACE_DAYS, PRICES } from "@/lib/plan";

export function DocPanel() {
  const id = useQueryParam("id");
  const now = useNow();
  const [doc, setDoc] = useState<DocRow | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const reload = useCallback(() => {
    if (!id) return;
    getDoc(id)
      .then(setDoc)
      .catch((e: unknown) => {
        setDoc(null);
        setError(e instanceof Error ? e.message : "문서를 읽지 못했습니다.");
      });
  }, [id]);

  useEffect(reload, [reload]);

  if (id === null) return <p className="text-caption text-muted">불러오는 중입니다…</p>;
  if (doc === undefined) return <p className="text-caption text-muted">불러오는 중입니다…</p>;
  if (!doc) {
    return (
      <div className="rounded-lg border border-line bg-white p-7 text-center">
        <p className="font-serif text-h3 text-ink">문서를 찾지 못했습니다</p>
        {error && <p className="mt-3 text-caption text-muted">{error}</p>}
        <Link href="/account" className="btn btn-ghost mt-6 bg-white">
          내 카드함으로
        </Link>
      </div>
    );
  }

  const what = doc.kind === "wedding" ? "청첩장" : "초대장";
  const published = doc.status === "published" && Boolean(doc.slug);
  const url = doc.slug ? docUrl(doc.kind, doc.slug) : "";

  const publish = () => {
    setBusy(true);
    setError(null);
    publishDoc(doc.id)
      .then(() => {
        setJustPublished(true);
        reload();
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "발행하지 못했습니다."),
      )
      .finally(() => setBusy(false));
  };

  const upgrade = () => {
    setBusy(true);
    setError(null);
    startCheckout(doc)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "결제창을 열지 못했습니다."),
      )
      .finally(() => setBusy(false));
  };

  return (
    <div className="grid gap-block">
      <header>
        <span className="eyebrow">{doc.kind === "wedding" ? "모바일 청첩장" : "초대장"}</span>
        <h1 className="mt-4 font-serif text-h1 text-ink">{doc.title || "제목 없음"}</h1>
        <p className="mt-3 text-caption text-ink-soft">
          {doc.plan === "premium" ? "프리미엄" : "무료"} ·{" "}
          {published ? expiryLine(doc, now) : "아직 발행하지 않았습니다"}
        </p>
      </header>

      {error && <p className="text-body text-rose-deep">{error}</p>}

      {/* ── 발행 ── */}
      {!published ? (
        <section className="rounded-lg border border-line bg-white p-6 sm:p-7">
          <h2 className="font-serif text-h3 text-ink">링크 발행</h2>
          <p className="mt-3 text-body text-ink-soft">
            누르면 이 {what}의 주소가 만들어집니다. 무료 발행은 7일 동안 열려
            있고, 하단에 Cardly 표기가 붙습니다. 결제하면 행사일 +
            {PAID_GRACE_DAYS}일까지 열리고 표기가 사라집니다.
          </p>
          <button type="button" className="btn btn-primary mt-6" onClick={publish} disabled={busy}>
            {busy ? "발행하는 중…" : "무료로 발행하기"}
          </button>
        </section>
      ) : (
        <section className="rounded-lg border border-line bg-white p-6 sm:p-7">
          <h2 className="font-serif text-h3 text-ink">보내기</h2>
          <div className="mt-5">
            <SharePanel
              url={url}
              slug={doc.slug ?? ""}
              title={doc.title || `Cardly ${what}`}
              description={shareDescription(doc)}
              fresh={justPublished}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-line-soft pt-5">
            <button
              type="button"
              className="text-[0.75rem] text-muted underline underline-offset-2 hover:text-ink"
              onClick={() => {
                if (!window.confirm("링크를 닫으면 하객이 더 이상 볼 수 없습니다.")) return;
                setBusy(true);
                closeDoc(doc.id)
                  .then(reload)
                  .finally(() => setBusy(false));
              }}
            >
              링크 닫기
            </button>
          </div>
        </section>
      )}

      {/* ── 결제 ── */}
      {doc.plan === "free" && (
        <section className="rounded-lg bg-ink p-6 text-ivory sm:p-7">
          <h2 className="font-serif text-h3">프리미엄으로 올리기</h2>
          <p className="mt-3 text-caption text-ivory/75">
            링크를 행사일 +{PAID_GRACE_DAYS}일까지 열어 두고, 하단 표기를
            지웁니다. 참석 여부 집계와 방명록이 열립니다.
            {doc.kind === "wedding" && " 갤러리 사진도 무제한이 됩니다."}
          </p>
          <p className="mt-5 font-serif text-h1">{formatPrice(PRICES[doc.kind])}</p>
          <p className="mt-1 text-[0.75rem] text-ivory/60">
            이 {what} 하나에 한 번만 · 구독이 아닙니다
          </p>

          {paymentsEnabled ? (
            <button
              type="button"
              className="press mt-6 rounded-full bg-ivory px-6 py-3 text-[0.875rem] text-ink"
              onClick={upgrade}
              disabled={busy}
            >
              {busy ? "결제창을 여는 중…" : "결제하고 프리미엄으로"}
            </button>
          ) : (
            <p className="mt-6 text-[0.75rem] text-ivory/60">
              결제 준비가 끝나면 이 자리에서 바로 올릴 수 있습니다.
            </p>
          )}
        </section>
      )}

      {/* ── 하객 응답 ── */}
      {published && doc.plan === "premium" && <Responses doc={doc} />}
      {published && doc.plan === "free" && (
        <p className="text-caption text-muted">
          참석 여부와 방명록은 프리미엄에서 열립니다.
        </p>
      )}
    </div>
  );
}

function Responses({ doc }: { doc: DocRow }) {
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [notes, setNotes] = useState<GuestbookRow[]>([]);

  const reload = useCallback(() => {
    listRsvps(doc.id).then(setRsvps).catch(() => undefined);
    listGuestbookAll(doc.id).then(setNotes).catch(() => undefined);
  }, [doc.id]);

  useEffect(reload, [reload]);

  const sum = summarize(rsvps);

  return (
    <div className="grid gap-block">
      <section>
        <h2 className="font-serif text-h2 text-ink">참석 여부</h2>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          {[
            ["참석", `${sum.attending}명`],
            ["동행 포함", `${sum.heads}명`],
            ["불참", `${sum.absent}명`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-white px-4 py-5 text-center">
              <dt className="text-[0.75rem] text-muted">{label}</dt>
              <dd className="mt-1.5 font-serif text-h2 text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {rsvps.length === 0 ? (
          <p className="mt-5 text-caption text-muted">아직 응답이 없습니다.</p>
        ) : (
          <ul className="mt-5 grid gap-2">
            {rsvps.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-line bg-white px-4 py-3"
              >
                <span className="text-body text-ink">{r.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.6875rem] ${
                    r.attending ? "bg-rose-veil text-rose-deep" : "bg-sand text-muted"
                  }`}
                >
                  {r.attending ? `참석 ${r.party}명` : "불참"}
                </span>
                {r.side && <span className="text-[0.75rem] text-muted">{r.side}</span>}
                {r.message && <span className="text-[0.75rem] text-muted">{r.message}</span>}
                <button
                  type="button"
                  className="ml-auto text-[0.75rem] text-muted underline underline-offset-2 hover:text-ink"
                  onClick={() => {
                    void deleteRsvp(r.id).then(reload);
                  }}
                >
                  지우기
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-h2 text-ink">방명록</h2>
        {notes.length === 0 ? (
          <p className="mt-5 text-caption text-muted">아직 남긴 글이 없습니다.</p>
        ) : (
          <ul className="mt-5 grid gap-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-md border border-line bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-body text-ink">{n.name}</span>
                  <span className="text-[0.75rem] text-muted">
                    {new Date(n.created_at).toLocaleDateString("ko-KR")}
                  </span>
                  <button
                    type="button"
                    className="ml-auto text-[0.75rem] text-muted underline underline-offset-2 hover:text-ink"
                    onClick={() => {
                      if (!window.confirm("이 글을 지울까요?")) return;
                      void deleteGuestbookEntry(n.id).then(reload);
                    }}
                  >
                    지우기
                  </button>
                </div>
                <p className="mt-1.5 text-body whitespace-pre-wrap text-ink-soft">{n.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function shareDescription(doc: DocRow): string {
  const data = doc.data as Record<string, unknown>;
  const parts =
    doc.kind === "wedding"
      ? [data.date, data.time, data.venueName]
      : [data.date, data.time, data.place];
  return parts.filter((v) => typeof v === "string" && v).join(" · ");
}

/** 남은 기간. now 를 밖에서 받는 것은 «지금» 을 그리는 도중에 읽으면
    빌드한 날짜가 굳어 버리기 때문입니다(lib/backend/browser). */
function expiryLine(doc: DocRow, now: number): string {
  if (!doc.expires_at) return "기한 없음";
  if (!now) return "";
  const left = Math.ceil((new Date(doc.expires_at).getTime() - now) / 86_400_000);
  if (left <= 0) return "기간이 지나 닫혔습니다";
  return `${left}일 남았습니다`;
}
