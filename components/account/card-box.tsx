"use client";

/**
 * 내 카드함 — 만든 것 전부가 한 자리에.
 *
 * 예전에는 만든 청첩장이 «이 브라우저의 localStorage» 에만 있었습니다.
 * 그래서 폰에서 만들고 노트북에서 열면 아무것도 없었고, 브라우저 청소 한
 * 번에 사라졌습니다. 이제 계정에 있습니다.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useNow } from "@/lib/backend/browser";
import { deleteDoc, listDocs, type DocRow } from "@/lib/backend/docs";
import { listOrders, type OrderRow } from "@/lib/backend/payments";
import { formatPrice } from "@/lib/plan";
import { findCategory } from "@/lib/print/specs";

export function CardBox() {
  const [docs, setDocs] = useState<DocRow[] | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    listDocs()
      .then(setDocs)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "목록을 읽지 못했습니다."),
      );
    listOrders()
      .then(setOrders)
      .catch(() => undefined);
  }, []);

  useEffect(reload, [reload]);

  if (error) {
    return <p className="text-body text-rose-deep">{error}</p>;
  }

  if (!docs) {
    return <p className="text-caption text-muted">불러오는 중입니다…</p>;
  }

  return (
    <div className="grid gap-block">
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-serif text-h2 text-ink">내 카드함</h2>
          <div className="flex gap-2">
            <Link href="/templates" className="btn btn-ghost btn-sm bg-white">
              + 청첩장
            </Link>
            <Link href="/invitation-card" className="btn btn-ghost btn-sm bg-white">
              + 초대장
            </Link>
            <Link href="/print" className="btn btn-ghost btn-sm bg-white">
              + 인쇄물
            </Link>
          </div>
        </div>

        {docs.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-line bg-white p-8 text-center">
            <p className="text-body text-ink-soft">아직 만든 것이 없습니다.</p>
            <p className="mt-2 text-caption text-muted">
              템플릿을 고르면 여기에 쌓입니다.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-3">
            {docs.map((doc) => (
              <DocCard key={doc.id} doc={doc} onChanged={reload} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-h2 text-ink">결제 내역</h2>
        {orders.filter((o) => o.status === "paid").length === 0 ? (
          <p className="mt-4 text-caption text-muted">결제한 내역이 없습니다.</p>
        ) : (
          <ul className="mt-6 grid gap-2">
            {orders
              .filter((o) => o.status === "paid")
              .map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-line bg-white px-4 py-3"
                >
                  <span className="text-body text-ink">{o.order_name}</span>
                  <span className="text-caption text-muted">
                    {o.paid_at ? new Date(o.paid_at).toLocaleDateString("ko-KR") : ""}
                    {o.method ? ` · ${o.method}` : ""}
                  </span>
                  <span className="ml-auto text-caption text-ink">
                    {formatPrice(o.amount)}
                  </span>
                  {o.receipt_url && (
                    <a
                      href={o.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[0.75rem] text-muted underline underline-offset-2 hover:text-ink"
                    >
                      영수증
                    </a>
                  )}
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DocCard({ doc, onChanged }: { doc: DocRow; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const now = useNow();
  const what =
    doc.kind === "wedding" ? "모바일 청첩장" : doc.kind === "print" ? printLabel(doc) : "초대장";
  const editHref =
    doc.kind === "wedding"
      ? `/editor/${doc.design_id}/?doc=${doc.id}`
      : doc.kind === "print"
        ? `/print/${doc.design_id}/edit/?doc=${doc.id}`
        : `/invitation-card/make/?doc=${doc.id}`;

  /* 인쇄물은 발행하지 않습니다 — 팔린 것은 링크가 아니라 파일입니다.
     그래서 «발행하기» 자리에 아무것도 두지 않습니다. */
  const isPrint = doc.kind === "print";

  return (
    <li className="rounded-lg border border-line bg-white p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="eyebrow">{what}</span>
        <StatusBadge doc={doc} />
        {doc.plan === "premium" && (
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[0.6875rem] text-ivory">
            프리미엄
          </span>
        )}
      </div>

      <p className="mt-2 font-serif text-h3 text-ink">
        {doc.title || "제목 없음"}
      </p>
      <p className="mt-1 text-[0.75rem] text-muted">
        {expiryLine(doc, now)} · {new Date(doc.updated_at).toLocaleDateString("ko-KR")} 수정
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={editHref} className="btn btn-ghost btn-sm bg-white">
          편집
        </Link>
        {!isPrint && (
          <Link href={`/account/doc/?id=${doc.id}`} className="btn btn-ghost btn-sm bg-white">
            {doc.status === "published" ? "링크·응답 관리" : "발행하기"}
          </Link>
        )}
        <button
          type="button"
          disabled={busy}
          className="btn btn-ghost btn-sm ml-auto bg-white text-muted"
          onClick={() => {
            if (!window.confirm("지우면 되돌릴 수 없습니다. 정말 지울까요?")) return;
            setBusy(true);
            deleteDoc(doc.id)
              .then(onChanged)
              .finally(() => setBusy(false));
          }}
        >
          삭제
        </button>
      </div>
    </li>
  );
}

/** 인쇄물은 갈래가 design_id 에 들어 있습니다 */
function printLabel(doc: DocRow): string {
  return findCategory(doc.design_id)?.label ?? "인쇄물";
}

function StatusBadge({ doc }: { doc: DocRow }) {
  const now = useNow();
  const expired =
    doc.expires_at !== null && now > 0 && new Date(doc.expires_at).getTime() < now;

  if (doc.kind === "print") {
    return (
      <span className="rounded-full bg-sand px-2.5 py-0.5 text-[0.6875rem] text-ink-soft">
        {doc.plan === "premium" ? "원본 받기 가능" : "미리보기"}
      </span>
    );
  }

  const [label, tone] =
    doc.status === "draft"
      ? ["초안", "bg-sand text-ink-soft"]
      : doc.status === "closed" || expired
        ? ["닫힘", "bg-sand text-muted"]
        : ["발행됨", "bg-rose-veil text-rose-deep"];

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[0.6875rem] ${tone}`}>{label}</span>
  );
}

/** 남은 기간. «지금» 은 브라우저에서만 읽습니다(lib/backend/browser). */
function expiryLine(doc: DocRow, now: number): string {
  if (doc.kind === "print") {
    return doc.plan === "premium"
      ? "결제 완료 — 워터마크 없이 내려받을 수 있습니다"
      : "내보내면 미리보기 표시가 함께 찍힙니다";
  }
  if (doc.status === "draft") return "아직 발행하지 않았습니다";
  if (!doc.expires_at) return "기한 없음";
  if (!now) return "";

  const left = Math.ceil((new Date(doc.expires_at).getTime() - now) / 86_400_000);
  if (left <= 0) return "기간이 지나 닫혔습니다";
  if (left === 1) return "오늘까지 열려 있습니다";
  return `${left}일 남았습니다`;
}
