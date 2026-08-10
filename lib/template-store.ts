"use client";

/**
 * 템플릿 저장소 — 브라우저 저장(localStorage) 과 DB(Supabase) 두 가지 뒷단을
 * 같은 얼굴로 감쌉니다.
 *
 * 환경변수가 없으면 지금까지처럼 브라우저에만 저장되고, 채워지면 자동으로
 * DB 모드가 됩니다. 화면 쪽 코드는 어느 쪽인지 몰라도 되도록 여기서만
 * 갈라집니다.
 */

import { useCallback, useEffect, useState } from "react";
import {
  CHANGED_EVENT,
  loadStoredTemplates,
  notifyChanged,
  PUBLISHED_TEMPLATES,
  removeCustomTemplate,
  upsertCustomTemplate,
} from "@/lib/custom-templates";
import { registerCustomTemplates, type Template } from "@/lib/invitation";
import {
  dbEnabled,
  remove as dbRemove,
  selectAll,
  signedIn,
  upsert,
} from "@/lib/supabase";

export type StoreMode = "db" | "local";

export function storeMode(): StoreMode {
  return dbEnabled ? "db" : "local";
}

/** DB 모드에서 쓰기가 가능한 상태인지 (= 관리자로 로그인했는지) */
export function canWrite(): boolean {
  return dbEnabled ? signedIn() : true;
}

interface TemplateRow {
  id: string;
  name: string;
  payload: Template;
}

/**
 * 화면에 보여줄 템플릿 목록.
 * 커밋되어 배포된 것 + (DB 모드면) DB, (아니면) 이 브라우저에 저장된 것.
 */
export async function fetchTemplates(): Promise<Template[]> {
  const byId = new Map<string, Template>();
  for (const t of PUBLISHED_TEMPLATES) byId.set(t.id, { ...t, custom: true });

  if (dbEnabled) {
    try {
      for (const row of await selectAll<TemplateRow>("templates")) {
        byId.set(row.id, { ...row.payload, id: row.id, custom: true });
      }
    } catch (e) {
      // DB 가 잠깐 안 되더라도 배포된 템플릿은 계속 보여야 합니다.
      console.error("[daon] 템플릿을 DB 에서 읽지 못했습니다", e);
    }
  } else {
    for (const t of loadStoredTemplates()) byId.set(t.id, { ...t, custom: true });
  }

  const list = [...byId.values()];
  registerCustomTemplates(list);
  return list;
}

export async function putTemplate(t: Template): Promise<void> {
  if (dbEnabled) {
    await upsert("templates", { id: t.id, name: t.name, payload: t });
    notifyChanged();
    return;
  }
  upsertCustomTemplate(t);
}

export async function dropTemplate(id: string): Promise<void> {
  if (dbEnabled) {
    await dbRemove("templates", "id", id);
    notifyChanged();
    return;
  }
  removeCustomTemplate(id);
}

/**
 * 템플릿 목록을 읽어 렌더러 레지스트리에 등록하고 돌려줍니다.
 *
 * 첫 렌더에서는 빈 배열입니다. 서버가 만든 HTML 에는 커스텀 템플릿이 없어,
 * 여기서 바로 채우면 hydration 이 어긋납니다.
 */
export function useTemplates(): {
  templates: Template[];
  loading: boolean;
  reload: () => void;
} {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // 상태 변경은 모두 응답이 온 뒤에 합니다. 호출 즉시 setState 하면
  // effect 본문에서 동기적으로 상태가 바뀌어 렌더가 연쇄됩니다.
  const reload = useCallback(() => {
    let alive = true;
    void fetchTemplates()
      .then((list) => {
        if (!alive) return;
        setTemplates(list);
        setLoading(false);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const stop = reload();
    window.addEventListener(CHANGED_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      stop();
      window.removeEventListener(CHANGED_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);

  return { templates, loading, reload };
}
