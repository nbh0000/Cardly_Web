/**
 * 토스페이먼츠 웹훅.
 *
 * 결제창에서 돌아오는 길에 사용자가 브라우저를 닫아 버리면 승인 요청이
 * 영영 오지 않습니다. 그런 결제를 건져 내는 자리입니다.
 *
 * 웹훅 본문은 인터넷에서 오는 남의 말이므로 그대로 믿지 않습니다. 본문에서
 * 가져오는 것은 «주문번호와 결제키» 뿐이고, 상태와 금액은 토스 API 에
 * 다시 물어서 확인합니다. 그래서 본문을 위조해도 실제 결제가 없으면
 * 아무 일도 일어나지 않습니다.
 *
 * 배포:
 *   supabase functions deploy pay-webhook --no-verify-jwt
 * 토스 개발자센터 > 웹훅 에 아래 주소를 등록하세요.
 *   https://<프로젝트>.functions.supabase.co/pay-webhook
 */

import { CORS, fail, json, rpc, selectOne, tossConfigured, tossFetch } from "../_shared/lib.ts";

interface OrderRow {
  order_code: string;
  amount: number;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return fail("POST 로 불러 주세요.", 405);
  if (!tossConfigured()) return fail("결제 키가 없습니다.", 503);

  let body: { eventType?: string; data?: { orderId?: string; paymentKey?: string; status?: string } };
  try {
    body = await req.json();
  } catch {
    return fail("본문을 읽지 못했습니다.");
  }

  const orderId = body.data?.orderId;
  const paymentKey = body.data?.paymentKey;
  if (!orderId || !paymentKey) return json({ ok: true, skipped: "no-order" });

  const order = await selectOne<OrderRow>(
    "orders",
    `order_code=eq.${encodeURIComponent(orderId)}&select=order_code,amount,status`,
  );
  // 우리 주문이 아니면 조용히 넘어갑니다 — 재시도를 부르지 않도록 200 입니다.
  if (!order) return json({ ok: true, skipped: "unknown-order" });
  if (order.status === "paid") return json({ ok: true, already: true });

  // 본문을 믿지 않고 토스에 다시 물어봅니다.
  const { ok, body: payment } = await tossFetch(
    `/v1/payments/${encodeURIComponent(paymentKey)}`,
  );
  if (!ok) return json({ ok: true, skipped: "lookup-failed" });

  if (payment.status === "DONE") {
    if (payment.totalAmount !== order.amount) {
      await rpc("mark_order_failed", {
        p_order_code: orderId,
        p_reason: `웹훅 금액 불일치: ${payment.totalAmount}`,
      });
      return json({ ok: true, mismatch: true });
    }
    await rpc("mark_order_paid", {
      p_order_code: orderId,
      p_payment_key: paymentKey,
      p_amount: payment.totalAmount,
      p_method: payment.method ?? "",
      p_receipt_url: payment.receipt?.url ?? "",
    });
    return json({ ok: true, paid: true });
  }

  if (payment.status === "CANCELED" || payment.status === "ABORTED" || payment.status === "EXPIRED") {
    await rpc("mark_order_failed", {
      p_order_code: orderId,
      p_reason: payment.failure?.message ?? payment.status,
    });
  }

  return json({ ok: true, status: payment.status });
});
