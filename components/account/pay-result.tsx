"use client";

/**
 * 결제창에서 돌아온 자리.
 *
 * 토스가 성공 주소로 붙여 보내는 값(paymentKey·orderId·amount)을 그대로
 * 서버에 넘겨 «정말 결제됐는지» 확인받습니다. 이 화면이 하는 판단은
 * 하나도 없습니다 — 브라우저가 결제 성공을 스스로 인정하면 주소창을
 * 고칠 줄 아는 사람 모두에게 무료가 됩니다.
 *
 * 새로고침해도 안전합니다. 서버가 이미 처리한 주문은 «이미 됨» 으로
 * 답하고 두 번 승인하지 않습니다.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueryParam } from "@/lib/backend/browser";
import { confirmPayment } from "@/lib/backend/payments";

type State =
  | { step: "confirming" }
  | { step: "done"; docId?: string; receiptUrl?: string }
  | { step: "failed"; message: string };

export function PayComplete() {
  const orderId = useQueryParam("orderId");
  const paymentKey = useQueryParam("paymentKey");
  const amount = Number(useQueryParam("amount") ?? 0);
  /* 주소에 값이 없는 것은 브라우저에서만 판정할 수 있습니다. 첫 그림에서는
     아직 주소를 못 읽었을 뿐이라 «확인 중» 으로 둡니다. */
  const ready = orderId !== null || paymentKey !== null;
  /* 주소에 값이 빠져 있는 것은 그리는 도중에 이미 아는 사실이라 상태로
     들지 않습니다. */
  const incomplete = ready && (!orderId || !paymentKey || !amount);
  const [state, setState] = useState<State>({ step: "confirming" });

  useEffect(() => {
    if (!ready || incomplete || !orderId || !paymentKey) return;

    confirmPayment({ orderId, paymentKey, amount })
      .then((r) => setState({ step: "done", docId: r.docId, receiptUrl: r.receiptUrl }))
      .catch((e: unknown) =>
        setState({
          step: "failed",
          message: e instanceof Error ? e.message : "승인하지 못했습니다.",
        }),
      );
  }, [ready, incomplete, orderId, paymentKey, amount]);

  if (incomplete) {
    return (
      <Box title="결제를 확인하지 못했습니다">
        <p className="text-caption text-ink-soft">결제 정보가 주소에 없습니다.</p>
        <Link href="/account" className="btn btn-ghost mt-7 bg-white">
          내 카드함으로
        </Link>
      </Box>
    );
  }

  if (state.step === "confirming") {
    return (
      <Box title="결제를 확인하고 있습니다">
        <p className="text-caption text-ink-soft">
          창을 닫지 말고 잠시만 기다려 주세요.
        </p>
      </Box>
    );
  }

  if (state.step === "failed") {
    return (
      <Box title="결제를 확인하지 못했습니다">
        <p className="text-caption text-ink-soft">{state.message}</p>
        <p className="mt-3 text-[0.75rem] text-muted">
          돈이 빠져나갔는데 프리미엄이 켜지지 않았다면 help@cardly.kr 로 주문번호와
          함께 알려 주세요. 확인해서 바로 처리해 드립니다.
        </p>
        <Link href="/account" className="btn btn-ghost mt-7 bg-white">
          내 카드함으로
        </Link>
      </Box>
    );
  }

  return (
    <Box title="프리미엄이 켜졌습니다">
      <p className="text-caption text-ink-soft">
        링크 기한이 늘어나고 하단 표기가 사라졌습니다. 참석 여부와 방명록도
        지금부터 받습니다.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Link
          href={state.docId ? `/account/doc/?id=${state.docId}` : "/account"}
          className="btn btn-primary"
        >
          링크 보러 가기
        </Link>
        {state.receiptUrl && (
          <a href={state.receiptUrl} target="_blank" rel="noreferrer" className="btn btn-ghost bg-white">
            영수증
          </a>
        )}
      </div>
    </Box>
  );
}

export function PayFail() {
  const message = useQueryParam("message") || "결제가 완료되지 않았습니다.";

  return (
    <Box title="결제가 취소되었습니다">
      <p className="text-caption text-ink-soft">{message}</p>
      <p className="mt-3 text-[0.75rem] text-muted">
        돈은 빠져나가지 않았습니다. 무료 링크는 그대로 열려 있습니다.
      </p>
      <Link href="/account" className="btn btn-ghost mt-7 bg-white">
        내 카드함으로
      </Link>
    </Box>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-narrow rounded-lg border border-line bg-white p-8 text-center">
      <p className="font-serif text-h2 text-ink">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
