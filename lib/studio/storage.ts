/**
 * 편집 중인 내용은 브라우저에만 저장합니다. 서버로 보내지 않으므로
 * 이력서의 개인정보나 명함의 연락처가 밖으로 나가지 않습니다.
 *
 * 정적 내보내기(output: export)로 빌드하면 페이지가 서버에서 미리
 * 렌더되므로, localStorage 를 useState 초기화 함수에서 바로 읽으면
 * 빌드가 깨집니다. 항상 마운트 이후(useEffect)에만 읽으세요.
 */

export function readDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // 저장 공간이 가득 차도 편집 자체는 계속할 수 있어야 합니다.
    return false;
  }
}

export function clearDraft(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* 무시 */
  }
}
