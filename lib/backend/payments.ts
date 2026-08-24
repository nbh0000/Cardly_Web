"use client";

/**
 * 결제 — 토스페이먼츠 단건 결제.
 *
 * 브라우저가 하는 일은 «결제창을 띄우고 결과 화면으로 돌아오는» 것까지입니다.
 * 결제가 실제로 됐는지는 서버(Supabase Edge Function)가 토스에 직접 물어
 * 확인하고, 프리미엄을 켜는 것도 서버입니다. 브라우저가 성공했다고 말하는
 * 것만으로는 아무 일도 일어나지 않습니다 — 그렇지 않으면 개발자 도구를
 * 열 줄 아는 사람 모두에게 무료가 됩니다.
 *
 * 금액도 브라우저가 정하지 않습니다. 주문을 만들 때 데이터베이스 트리거가
 * 요금표와 대조하고(order_price), 승인할 때 엣지 함수가 토스가 알려 준
 * 금액과 다시 대조합니다.
 */

import {
  BackendError,
  backendEnabled,
  callFunction,
  currentSession,
  insert,
  select,
} from "@/lib/backend/client";
import type { DocKind, DocRow } from "@/lib/backend/docs";
import { PRICES, type CreditPack } from "@/lib/plan";

export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";

/** 결제를 실제로 받을 수 있는 상태인지 */
export const paymentsEnabled = Boolean(backendEnabled && TOSS_CLIENT_KEY);

export interface OrderRow {
  id: string;
  /** 크레딧 주문에는 문서가 없습니다 */
  doc_id: string | null;
  /** 'doc' 문서 하나 · 'credits' AI 크레딧 묶음 */
  product?: "doc" | "credits";
  credits?: number | null;
  order_code: string;
  order_name: string;
  amount: number;
  status: "ready" | "paid" | "failed" | "canceled";
  method: string | null;
  receipt_url: string | null;
  created_at: string;
  paid_at: string | null;
}

const COLUMNS =
  "id,doc_id,product,credits,order_code,order_name,amount,status,method,receipt_url,created_at,paid_at";

export async function listOrders(): Promise<OrderRow[]> {
  if (!backendEnabled) return [];
  return select<OrderRow>("orders", `select=${COLUMNS}&order=created_at.desc`);
}

export async function ordersFor(docId: string): Promise<OrderRow[]> {
  return select<OrderRow>("orders", `select=${COLUMNS}&doc_id=eq.${docId}&order=created_at.desc`);
}

function orderCode(kind: DocKind): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `cardly-${kind}-${stamp}-${rand}`;
}

const KIND_LABEL: Record<DocKind, string> = {
  wedding: "모바일 청첩장",
  occasion: "초대장",
  print: "인쇄물",
};

function orderName(doc: DocRow): string {
  const what = KIND_LABEL[doc.kind] ?? "Cardly";
  const who = doc.title.trim();
  return who ? `${what} — ${who}`.slice(0, 100) : `Cardly ${what}`;
}

/* ── 토스 SDK ────────────────────────────────────────────────
   결제창은 토스가 띄웁니다. 스크립트는 결제 단추를 누른 사람에게만
   받게 합니다 — 청첩장을 보러 온 하객 수백 명에게 결제 SDK 를 내려
   보내는 것은 낭비입니다.                                          */

interface TossPaymentsSdk {
  payment(options: { customerKey: string }): {
    requestPayment(options: Record<string, unknown>): Promise<void>;
  };
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsSdk;
  }
}

let sdkPromise: Promise<TossPaymentsSdk> | null = null;

function loadSdk(): Promise<TossPaymentsSdk> {
  sdkPromise ??= new Promise((resolve, reject) => {
    if (window.TossPayments) {
      resolve(window.TossPayments(TOSS_CLIENT_KEY));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v2/standard";
    script.onload = () => {
      if (window.TossPayments) resolve(window.TossPayments(TOSS_CLIENT_KEY));
      else reject(new Error("결제 모듈을 불러오지 못했습니다."));
    };
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("결제 모듈을 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window === "undefined" ? "https://cardly.kr" : window.location.origin)
  );
}

/**
 * 결제창 열기.
 *
 * 주문을 먼저 서버에 만들어 두고 그 번호로 결제창을 엽니다. 순서가 반대이면
 * 결제는 됐는데 우리 쪽에 주문이 없는 상태가 생깁니다.
 */
export async function startCheckout(doc: DocRow): Promise<void> {
  const session = currentSession();
  if (!session) throw new BackendError("로그인이 필요합니다.", 401);
  if (!paymentsEnabled) throw new BackendError("결제 준비가 아직 끝나지 않았습니다.", 503);

  const amount = PRICES[doc.kind];
  const code = orderCode(doc.kind);

  await insert<OrderRow>("orders", {
    owner: session.user.id,
    doc_id: doc.id,
    order_code: code,
    order_name: orderName(doc),
    amount,
    status: "ready",
  });

  const sdk = await loadSdk();
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const payment = sdk.payment({ customerKey: session.user.id });

  await payment.requestPayment({
    method: "CARD",
    amount: { currency: "KRW", value: amount },
    orderId: code,
    orderName: orderName(doc),
    successUrl: `${siteOrigin()}${base}/pay/complete/`,
    failUrl: `${siteOrigin()}${base}/pay/fail/`,
    customerEmail: session.user.email ?? undefined,
    customerName: session.user.name ?? undefined,
    card: { useEscrow: false, flowMode: "DEFAULT", useCardPoint: false, useAppCardOnly: false },
  });
}

/**
 * AI 크레딧 사기.
 *
 * 문서에 붙지 않는 유일한 주문입니다. 그래서 doc_id 가 비어 있고, 대신
 * product 와 credits 가 채워집니다. 금액이 맞는지는 데이터베이스가
 * credit_price() 로 다시 봅니다.
 */
export async function startCreditCheckout(pack: CreditPack): Promise<void> {
  const session = currentSession();
  if (!session) throw new BackendError("로그인이 필요합니다.", 401);
  if (!paymentsEnabled) throw new BackendError("결제 준비가 아직 끝나지 않았습니다.", 503);

  const code = `cardly-credits-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const name = `AI 크레딧 ${pack.credits}개`;

  await insert<OrderRow>("orders", {
    owner: session.user.id,
    doc_id: null,
    product: "credits",
    credits: pack.credits,
    order_code: code,
    order_name: name,
    amount: pack.price,
    status: "ready",
  });

  const sdk = await loadSdk();
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const payment = sdk.payment({ customerKey: session.user.id });

  await payment.requestPayment({
    method: "CARD",
    amount: { currency: "KRW", value: pack.price },
    orderId: code,
    orderName: name,
    successUrl: `${siteOrigin()}${base}/pay/complete/`,
    failUrl: `${siteOrigin()}${base}/pay/fail/`,
    customerEmail: session.user.email ?? undefined,
    customerName: session.user.name ?? undefined,
    card: { useEscrow: false, flowMode: "DEFAULT", useCardPoint: false, useAppCardOnly: false },
  });
}

export interface ConfirmResult {
  ok: boolean;
  docId?: string;
  method?: string;
  receiptUrl?: string;
  already?: boolean;
}

/**
 * 승인 — 결제창에서 돌아온 뒤 딱 한 번 부릅니다.
 *
 * 새로고침해도 같은 답이 오도록 서버가 «이미 처리됨» 을 알려 줍니다.
 */
export async function confirmPayment(params: {
  orderId: string;
  paymentKey: string;
  amount: number;
}): Promise<ConfirmResult> {
  return callFunction<ConfirmResult>("pay-confirm", params);
}
