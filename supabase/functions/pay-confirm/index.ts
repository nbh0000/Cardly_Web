/**
 * 결제 승인 — 돈이 실제로 들어왔는지 확인하는 유일한 자리.
 *
 * 브라우저는 결제창을 띄우고 결과 화면으로 돌아올 뿐입니다. "결제됐다" 는
 * 브라우저의 말은 아무 효력이 없습니다. 여기서 토스에 직접 승인을 요청하고,
 * 토스가 알려 준 금액이 우리가 만들어 둔 주문 금액과 같을 때만 프리미엄을
 * 켭니다.
 *
 * 확인하는 것 셋:
 *   ① 주문번호가 우리 표에 있는가            (없으면 남이 만든 주문)
 *   ② 토스가 말한 금액 = 우리 주문의 금액인가 (결제창 금액 조작 방지)
 *   ③ 승인 응답이 DONE 인가                  (미완결 결제 방지)
 *
 * 같은 주문이 두 번 들어와도(사용자가 새로고침, 웹훅과 콜백이 겹침)
 * mark_order_paid 가 한 번만 처리합니다.
 *
 * 배포:
 *   supabase functions deploy pay-confirm --no-verify-jwt
 *   supabase secrets set TOSS_SECRET_KEY=test_sk_…
 *
 * --no-verify-jwt 인 이유: 결제창에서 돌아온 직후라 토큰이 만료돼 있을 수
 * 있습니다. 대신 주문번호를 아는 사람만 부를 수 있고, 그 번호는 주문을
 * 만든 사람에게만 돌아갑니다.
 */

import { CORS, fail, json, rpc, selectOne, tossConfigured, tossFetch } from "../_shared/lib.ts";

interface OrderRow {
  order_code: string;
  amount: number;
  status: string;
  doc_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return fail("POST 로 불러 주세요.", 405);

  if (!tossConfigured()) {
    return fail("결제 키가 설정되지 않았습니다. 관리자에게 알려 주세요.", 503);
  }

  let payload: { orderId?: string; paymentKey?: string; amount?: number };
  try {
    payload = await req.json();
  } catch {
    return fail("요청을 읽지 못했습니다.");
  }

  const { orderId, paymentKey, amount } = payload;
  if (!orderId || !paymentKey || typeof amount !== "number") {
    return fail("주문번호·결제키·금액이 모두 필요합니다.");
  }

  // ① 우리 표에 있는 주문인가
  const order = await selectOne<OrderRow>(
    "orders",
    `order_code=eq.${encodeURIComponent(orderId)}&select=order_code,amount,status,doc_id`,
  );
  if (!order) return fail("없는 주문입니다.", 404);

  if (order.status === "paid") {
    return json({ ok: true, already: true });
  }

  // ② 브라우저가 말한 금액이 주문 금액과 같은가 (토스에도 다시 확인합니다)
  if (order.amount !== amount) {
    await rpc("mark_order_failed", {
      p_order_code: orderId,
      p_reason: `금액 불일치: 요청 ${amount} / 주문 ${order.amount}`,
    });
    return fail("결제 금액이 주문과 다릅니다.", 409);
  }

  // ③ 토스에 승인 요청 — 여기서 실제로 돈이 빠집니다
  const { ok, body } = await tossFetch("/v1/payments/confirm", {
    method: "POST",
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!ok || body.status !== "DONE") {
    const reason = body.message ?? body.status ?? "승인 실패";
    await rpc("mark_order_failed", { p_order_code: orderId, p_reason: reason });
    return fail(reason, 402);
  }

  if (body.totalAmount !== order.amount) {
    await rpc("mark_order_failed", {
      p_order_code: orderId,
      p_reason: `승인 금액 불일치: ${body.totalAmount}`,
    });
    return fail("승인된 금액이 주문과 다릅니다.", 409);
  }

  const result = await rpc<{ ok: boolean; doc_id?: string }>("mark_order_paid", {
    p_order_code: orderId,
    p_payment_key: paymentKey,
    p_amount: body.totalAmount,
    p_method: body.method ?? "",
    p_receipt_url: body.receipt?.url ?? "",
  });

  return json({
    ok: true,
    docId: result.doc_id ?? order.doc_id,
    method: body.method ?? "",
    receiptUrl: body.receipt?.url ?? "",
    approvedAt: body.approvedAt ?? null,
  });
});
