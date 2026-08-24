"use client";

/**
 * 브라우저에서만 읽을 수 있는 값들.
 *
 * 정적 배포라 모든 페이지가 빌드 때 한 번 그려집니다. 그 순간에는 주소의
 * 물음표 뒤도, 지금 시각도 없습니다. 그걸 렌더 도중에 읽으면 서버 그림과
 * 브라우저 그림이 어긋나고(hydration), 무엇보다 «빌드한 날» 이 그대로
 * 굳어 버립니다 — 남은 날짜가 영영 틀린 숫자가 됩니다.
 *
 * useSyncExternalStore 로 «서버에서는 없음, 브라우저에서만 있음» 을
 * 명시합니다. 이 파일의 값들은 모두 첫 그림에서 비어 있다가 브라우저에서
 * 채워집니다.
 */

import { useSyncExternalStore } from "react";

/* 값이 스스로 바뀌지 않는 스토어. 주소와 시각은 우리가 다시 읽을 때만
   달라지므로 구독할 것이 없습니다. */
const subscribeNever = () => () => {};

/** 주소의 ?이름= 값. 서버 그림에서는 null 입니다. */
export function useQueryParam(name: string): string | null {
  return useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}

/** 지금 경로. 서버 그림에서는 빈 문자열입니다. */
export function usePathname(): string {
  return useSyncExternalStore(
    subscribeNever,
    () => window.location.pathname,
    () => "",
  );
}

/**
 * 지금 시각(epoch ms). 서버 그림에서는 0 이라, «며칠 남았습니다» 같은
 * 계산은 브라우저에서만 값이 나옵니다.
 */
export function useNow(): number {
  return useSyncExternalStore(
    subscribeNever,
    () => Date.now(),
    () => 0,
  );
}

/**
 * 브라우저에 붙었는지.
 *
 * 브라우저 저장소에서 이어 만들던 것을 꺼내야 하는 화면에 씁니다. 렌더
 * 도중에 localStorage 를 읽으면 서버 그림(빈 문서)과 브라우저 그림(이어
 * 만들던 문서)이 어긋나므로, 붙은 뒤에 한 번 더 그리게 합니다.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
