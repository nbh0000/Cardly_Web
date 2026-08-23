"use client";

/**
 * 카카오톡으로 보내기.
 *
 * 두 갈래입니다.
 *   ① 앱 키가 있으면 카카오 SDK 로 «카드» 를 보냅니다 — 제목·설명·사진이
 *      우리가 정한 대로 붙습니다.
 *   ② 키가 없으면 링크만 보냅니다. 그래도 카카오톡은 그 주소의 <meta> 를
 *      읽어 미리보기를 만들어 줍니다. 우리가 발행 때 그 HTML 을 굽는 이유가
 *      이것입니다.
 *
 * 즉 키는 «있으면 더 좋은» 것이지 없으면 못 보내는 것이 아닙니다. 그래서
 * 키가 없다고 단추를 감추지 않습니다.
 */

const KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";

interface KakaoSdk {
  init(key: string): void;
  isInitialized(): boolean;
  Share: {
    sendDefault(options: Record<string, unknown>): void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

let loading: Promise<KakaoSdk | null> | null = null;

function loadSdk(): Promise<KakaoSdk | null> {
  if (!KEY) return Promise.resolve(null);
  loading ??= new Promise((resolve) => {
    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) window.Kakao.init(KEY);
      resolve(window.Kakao);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    // 무결성 해시는 SDK 판이 올라갈 때마다 바뀝니다. 틀린 해시를 적어 두면
    // 공유 단추가 조용히 죽으므로, 판을 고정하는 것으로 갈음합니다.
    script.onload = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) window.Kakao.init(KEY);
        resolve(window.Kakao);
      } else resolve(null);
    };
    script.onerror = () => {
      loading = null;
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loading;
}

export interface ShareCard {
  title: string;
  description: string;
  url: string;
  /** 절대 주소여야 카카오가 읽습니다 */
  imageUrl?: string;
  buttonLabel?: string;
}

/**
 * 카카오톡 공유. 성공하면 true.
 *
 * 실패하거나 키가 없으면 false 를 돌려주고, 부르는 쪽이 기본 공유 시트나
 * 링크 복사로 넘어갑니다.
 */
export async function shareToKakao(card: ShareCard): Promise<boolean> {
  const sdk = await loadSdk();
  if (!sdk) return false;
  try {
    sdk.Share.sendDefault({
      objectType: "feed",
      content: {
        title: card.title,
        description: card.description,
        imageUrl: card.imageUrl ?? "",
        link: { mobileWebUrl: card.url, webUrl: card.url },
      },
      buttons: [
        {
          title: card.buttonLabel ?? "열어 보기",
          link: { mobileWebUrl: card.url, webUrl: card.url },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

/** 기본 공유 시트 → 링크 복사 순으로 물러납니다 */
export async function shareAnyhow(card: ShareCard): Promise<"kakao" | "share" | "copy" | "none"> {
  if (await shareToKakao(card)) return "kakao";

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: card.title, text: card.description, url: card.url });
      return "share";
    } catch {
      /* 사용자가 취소했을 수도 있습니다 — 복사까지 가지 않습니다 */
      return "none";
    }
  }

  try {
    await navigator.clipboard.writeText(card.url);
    return "copy";
  } catch {
    return "none";
  }
}
