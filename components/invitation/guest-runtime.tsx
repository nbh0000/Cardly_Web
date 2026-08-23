"use client";

import { createContext } from "react";

/**
 * "지금 이 청첩장은 하객이 보고 있다" 는 사실.
 *
 * 같은 <InvitationView /> 가 세 자리에서 쓰입니다 — 편집기 미리보기,
 * 템플릿 구경, 그리고 발행된 링크. 앞의 둘에서는 참석 여부와 방명록이
 * 견본이어야 하고(누가 눌러도 아무 데도 안 남아야 합니다), 마지막에서만
 * 진짜로 서버에 남아야 합니다.
 *
 * 그 차이를 컴포넌트 트리 위쪽에서 한 번 정해 두면, 폼을 그리는 코드는
 * 자기가 어느 자리에 있는지 몰라도 됩니다. 값이 null 이면 견본입니다.
 */
export interface GuestRuntime {
  /** 발행된 문서의 주소 — 서버 함수에 이 값을 넘깁니다 */
  slug: string;
  /** 결제한 문서인지. 무료 문서는 참석 여부·방명록이 잠깁니다 */
  premium: boolean;
  /** 샘플 링크 — 화면은 진짜와 같지만 아무것도 남기지 않습니다 */
  demo?: boolean;
}

export const GuestContext = createContext<GuestRuntime | null>(null);
