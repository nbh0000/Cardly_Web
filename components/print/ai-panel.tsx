"use client";

/**
 * AI 패널 — 다섯 가지를 한 자리에.
 *
 * 만들어 준 결과를 곧바로 종이에 얹지 않습니다. 먼저 목록으로 보여 주고,
 * 사용자가 고른 것만 들어갑니다. 자동으로 얹으면 마음에 들지 않을 때
 * 되돌리는 일이 «AI 를 한 번 더 부르는» 일이 되고, 그건 돈이 듭니다.
 *
 * 크레딧은 부르기 전에 보여 줍니다. 누른 뒤에 «크레딧이 없습니다» 를
 * 만나는 것과, 누르기 전에 «5 크레딧이 듭니다» 를 읽는 것은 다릅니다.
 */

import { useEffect, useState } from "react";
import { AI_COST, AiError, aiEditImage, aiImage, aiReady, aiText, aiBalance, type AiTask } from "@/lib/print/ai";
import { newImage, newText } from "@/lib/print/model";
import type { EditorStore } from "@/lib/print/store";
import { startCreditCheckout } from "@/lib/backend/payments";
import { CREDIT_PACKS, formatPrice, type CreditPack } from "@/lib/plan";
import type { ImageElement, TextElement } from "@/lib/print/types";

type Mode = "write" | "fix" | "art" | "photo";

const TASKS: { value: AiTask; label: string }[] = [
  { value: "headline", label: "큰 문구" },
  { value: "body", label: "본문" },
  { value: "menu", label: "메뉴 이름" },
];

export function AiPanel({
  store,
  editing,
  onDoneEditing,
}: {
  store: EditorStore;
  /** 인쇄물 속 사진을 고치러 들어온 경우 */
  editing: ImageElement | null;
  onDoneEditing: () => void;
}) {
  const { state, dispatch, selectedElements } = store;
  const doc = state.doc;
  const ready = aiReady();

  /* 사진을 고치러 들어왔으면 그 칸에서 시작합니다. 값이 바뀔 때 상태를
     다시 맞추는 대신, 부르는 쪽이 key 를 바꿔 이 패널을 새로 세웁니다 —
     효과 안에서 상태를 고치면 화면이 두 번 그려집니다. */
  const [mode, setMode] = useState<Mode>(editing ? "photo" : "write");
  const [task, setTask] = useState<AiTask>("headline");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [outOfCredit, setOutOfCredit] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);

  const selectedText = selectedElements.find((e): e is TextElement => e.kind === "text") ?? null;

  useEffect(() => {
    if (!ready.ok) return;
    aiBalance()
      .then(setBalance)
      .catch(() => setBalance(null));
  }, [ready.ok]);

  if (!ready.ok) {
    return (
      <div className="pe-panel">
        <p className="pe-hint">{ready.reason}</p>
        <p className="pe-hint">
          로그인하면 체험 크레딧 20개를 드립니다. 문구 만들기는 1개, 그림 만들기는 5개를 씁니다.
        </p>
      </div>
    );
  }

  const run = async () => {
    setBusy(true);
    setError(null);
    setLines([]);
    setImage(null);
    try {
      if (mode === "write") {
        const res = await aiText(prompt || "가게를 새로 엽니다", task);
        setLines(res.lines);
        setBalance(res.balance);
      } else if (mode === "fix") {
        if (!selectedText) throw new AiError("고칠 글자를 먼저 골라 주세요.");
        const res = await aiText(selectedText.text, prompt.includes("줄") ? "shorten" : "polish");
        setLines(res.lines);
        setBalance(res.balance);
      } else if (mode === "art") {
        const res = await aiImage(prompt, { widthMm: doc.width, heightMm: doc.height });
        setImage(res.url);
        setBalance(res.balance);
      } else {
        if (!editing) throw new AiError("고칠 사진을 먼저 골라 주세요.");
        const res = await aiEditImage(prompt || "배경을 깨끗한 흰색으로 바꿔 주세요", editing.src);
        setImage(res.url);
        setBalance(res.balance);
      }
    } catch (e) {
      setError(e instanceof AiError ? e.message : "요청이 실패했습니다.");
      if (e instanceof AiError && e.outOfCredit) setOutOfCredit(true);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 크레딧 사기.
   *
   * 결제창까지만 엽니다. 실제로 크레딧이 올라가는 것은 결제가 승인된 뒤
   * 서버가 하는 일입니다(mark_order_paid). 브라우저가 «샀다» 고 말하는
   * 것만으로는 아무 일도 일어나지 않습니다.
   */
  const buyCredits = async (pack: CreditPack) => {
    setBuying(pack.id);
    setError(null);
    try {
      await startCreditCheckout(pack);
    } catch (e) {
      setError(e instanceof Error ? e.message : "결제창을 열지 못했습니다.");
      setBuying(null);
    }
  };

  const putText = (text: string) => {
    if (selectedText) {
      dispatch({ type: "patch", ids: [selectedText.id], patch: { text } });
      return;
    }
    dispatch({
      type: "add",
      elements: [
        newText({
          text,
          x: doc.safe + 4,
          y: doc.safe + 4,
          w: Math.max(40, doc.width - (doc.safe + 4) * 2),
          h: Math.max(10, doc.height * 0.08),
          size: Math.max(10, Math.round(doc.width * 0.09)),
          weight: 700,
          side: state.side,
        }),
      ],
    });
  };

  const cost = mode === "write" || mode === "fix" ? AI_COST.text : AI_COST.image;

  return (
    <div className="pe-panel">
      <div className="pe-ai-modes">
        {(
          [
            ["write", "문구 만들기"],
            ["fix", "문구 다듬기"],
            ["art", "배경 그림"],
            ["photo", "사진 고치기"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            className={mode === m ? "is-on" : undefined}
            onClick={() => {
              setMode(m);
              setLines([]);
              setImage(null);
              setError(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "write" && (
        <div className="pe-ai-tasks">
          {TASKS.map((t) => (
            <button
              key={t.value}
              type="button"
              className={task === t.value ? "is-on" : undefined}
              onClick={() => setTask(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {mode === "fix" && !selectedText && (
        <p className="pe-hint">종이에서 고칠 글자를 먼저 고르세요.</p>
      )}
      {mode === "fix" && selectedText && (
        <p className="pe-hint pe-quote">{selectedText.text.slice(0, 80)}</p>
      )}
      {mode === "photo" && !editing && (
        <p className="pe-hint">사진을 고른 뒤 «AI 로 고치기» 를 누르면 여기로 옵니다.</p>
      )}

      <textarea
        className="pe-ai-input"
        rows={3}
        value={prompt}
        placeholder={
          mode === "write"
            ? "무엇을 알리는 인쇄물인가요? 예) 3월에 여는 동네 도자기 공방, 주말 원데이 클래스"
            : mode === "fix"
              ? "«짧게» 라고 적으면 줄이고, 비워 두면 다듬기만 합니다"
              : mode === "art"
                ? "어떤 그림이 필요한가요? 예) 창가에 놓인 마른 꽃, 아침 햇빛, 사진처럼"
                : "사진을 어떻게 고칠까요? 예) 배경을 흰색으로 지워 주세요"
        }
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="pe-ai-run">
        <button type="button" className="pe-btn pe-btn-solid" disabled={busy} onClick={run}>
          {busy ? "만드는 중…" : "만들기"}
        </button>
        <span className="pe-ai-cost">
          {cost} 크레딧{balance !== null && ` · 남은 크레딧 ${balance}`}
        </span>
      </div>

      {error && <p className="pe-error">{error}</p>}

      {(outOfCredit || (balance !== null && balance < AI_COST.image)) && (
        <section className="pe-credits">
          <p className="pe-credits-title">크레딧 채우기</p>
          {CREDIT_PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              className="pe-credit-pack"
              disabled={buying !== null}
              onClick={() => void buyCredits(pack)}
            >
              <span>
                <em>{pack.credits}개</em>
                {pack.note}
              </span>
              <b>{buying === pack.id ? "여는 중…" : formatPrice(pack.price)}</b>
            </button>
          ))}
          <p className="pe-credits-foot">
            크레딧은 계정에 쌓이고 기한이 없습니다. 잔액이 남아 있어도 하루 40번까지 씁니다.
          </p>
        </section>
      )}

      {lines.length > 0 && (
        <ul className="pe-ai-results">
          {lines.map((line, i) => (
            <li key={i}>
              <button type="button" onClick={() => putText(line)}>
                {line}
              </button>
            </li>
          ))}
        </ul>
      )}

      {image && (
        <div className="pe-ai-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" />
          <div className="pe-align">
            {mode === "photo" && editing ? (
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "patch", ids: [editing.id], patch: { src: image } });
                  onDoneEditing();
                }}
              >
                이 사진으로 바꾸기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "background", value: { image, imageOpacity: 1 } })}
                >
                  배경으로 깔기
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "add",
                      elements: [
                        newImage(image, {
                          x: doc.safe,
                          y: doc.safe,
                          w: doc.width * 0.5,
                          h: doc.width * 0.5,
                          side: state.side,
                        }),
                      ],
                    })
                  }
                >
                  종이에 넣기
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <p className="pe-hint">
        만든 그림은 내 저장소에 남습니다. 마음에 들지 않으면 다시 만들면 되고, 그때마다 크레딧이 듭니다.
      </p>
    </div>
  );
}
