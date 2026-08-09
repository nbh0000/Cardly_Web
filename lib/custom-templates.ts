"use client";

/**
 * 관리자 페이지에서 만든 템플릿의 저장소.
 *
 * 이 사이트는 GitHub Pages 정적 호스팅이라 서버도 DB 도 없습니다. 그래서
 * "업로드"는 두 단계로 나뉩니다.
 *   1) 브라우저 저장 — localStorage 에 넣으면 그 브라우저에서는 바로
 *      템플릿 목록과 편집기에 나타납니다. 만들면서 확인하는 용도입니다.
 *   2) 배포 — 내보낸 JSON 을 lib/published-templates.json 에 넣고 커밋하면
 *      빌드에 포함되어 모든 방문자에게 보입니다.
 * 관리자 페이지는 두 단계를 모두 지원합니다.
 */

import { useEffect, useState } from "react";
import {
  registerCustomTemplates,
  TEMPLATES,
  type Template,
} from "@/lib/invitation";
import PUBLISHED from "@/lib/published-templates.json";

const KEY = "daon:custom-templates";

/** 저장소가 바뀌었음을 같은 탭의 다른 컴포넌트에 알리는 이벤트 */
const CHANGED = "daon:custom-templates-changed";

/** 커밋되어 모든 방문자에게 배포된 템플릿 */
export const PUBLISHED_TEMPLATES = PUBLISHED as Template[];

function readStored(): Template[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Template[]) : [];
  } catch {
    // 손상된 값이 있어도 사이트 전체가 멈추지는 않게 합니다.
    return [];
  }
}

/** 배포본 + 이 브라우저에 저장된 것. 같은 id 면 브라우저 쪽이 이깁니다. */
function merge(stored: Template[]): Template[] {
  const byId = new Map<string, Template>();
  for (const t of PUBLISHED_TEMPLATES) byId.set(t.id, t);
  for (const t of stored) byId.set(t.id, t);
  return [...byId.values()];
}

export function loadCustomTemplates(): Template[] {
  return merge(readStored());
}

export function saveCustomTemplates(list: Template[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  registerCustomTemplates(merge(list));
  window.dispatchEvent(new Event(CHANGED));
}

/** 이 브라우저에만 저장된 목록 (배포본 제외) */
export function loadStoredTemplates(): Template[] {
  return readStored();
}

export function upsertCustomTemplate(t: Template): void {
  const list = readStored();
  const i = list.findIndex((x) => x.id === t.id);
  if (i >= 0) list[i] = t;
  else list.push(t);
  saveCustomTemplates(list);
}

export function removeCustomTemplate(id: string): void {
  saveCustomTemplates(readStored().filter((t) => t.id !== id));
}

/** 빌트인 id 와 겹치지 않는지 */
export function isIdTaken(id: string, exceptId?: string): boolean {
  if (TEMPLATES.some((t) => t.id === id)) return true;
  return loadCustomTemplates().some((t) => t.id === id && t.id !== exceptId);
}

/**
 * 커스텀 템플릿을 읽어 렌더러 레지스트리에 등록하고 목록을 돌려줍니다.
 *
 * 첫 렌더에서는 빈 배열을 반환합니다. 서버가 만든 HTML 에는 커스텀
 * 템플릿이 없으므로, 여기서 바로 채우면 hydration 이 어긋납니다.
 */
export function useCustomTemplates(): Template[] {
  const [list, setList] = useState<Template[]>([]);

  useEffect(() => {
    const sync = () => {
      const next = loadCustomTemplates();
      registerCustomTemplates(next);
      setList(next);
    };
    sync();
    window.addEventListener(CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return list;
}
