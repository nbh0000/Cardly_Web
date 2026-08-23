"use client";

/**
 * 편집기와 계정을 잇는 고리.
 *
 * 청첩장 편집기와 초대장 만들기는 화면이 전혀 다르지만, 저장과 발행에서
 * 하는 일은 같습니다 — 로그인했으면 계정에 넣고, 안 했으면 이 브라우저에
 * 넣고, 사진은 저장하는 순간 올리고, 발행하면 주소를 받아 옵니다. 그
 * 공통부분을 여기 한 곳에 둡니다.
 *
 * ── 자동 저장 ──
 * 값이 바뀌고 2.5 초가 지나면 저장합니다. 글자를 칠 때마다 보내면 요청이
 * 수십 개가 되고, 다 치고 나서 저장하면 «저장했다» 는 확신이 생기지 않습니다.
 * 사람이 손을 멈추는 시점이 저장 시점입니다.
 *
 * ── 사진 ──
 * 편집기 안의 사진은 blob: 주소입니다. 저장할 때마다 «아직 안 올라간 것만»
 * 올리고, 올라간 주소로 편집기 값을 바꿔 줍니다. 그래서 두 번째 저장부터는
 * 사진을 다시 올리지 않습니다.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { backendEnabled } from "@/lib/backend/client";
import { useSession } from "@/lib/backend/auth";
import {
  createDoc,
  getDoc,
  publishDoc,
  saveDoc,
  type DocKind,
  type DocRow,
  type PublishResult,
} from "@/lib/backend/docs";
import { materializePhotos } from "@/lib/backend/photos";

/* 값이 바뀌지 않는 스토어 — 브라우저에서만 읽는 값에 씁니다. */
const subscribeNever = () => () => {};

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface DocStore<T> {
  /** 로그인해서 계정에 저장할 수 있는 상태인지 */
  online: boolean;
  doc: DocRow | null;
  loading: boolean;
  state: SaveState;
  savedAt: string | null;
  error: string | null;
  /** 지금 값을 계정에 저장합니다(사진 업로드 포함) */
  save: () => Promise<DocRow | null>;
  /** 저장한 뒤 주소를 받아 옵니다 */
  publish: () => Promise<PublishResult | null>;
  /** 불러온 문서의 내용 — 편집기가 이 값으로 상태를 채웁니다 */
  loaded: { doc: DocRow; data: T } | null;
}

export interface DocShape<T> {
  kind: DocKind;
  data: T;
  /** 목록에 보여 줄 한 줄 */
  title: (data: T) => string;
  /** 청첩장 템플릿 id / 초대장 디자인 id */
  design: (data: T) => string;
  /** 예식일·행사일 — 결제한 링크의 기한을 여기서 잽니다 */
  eventDate: (data: T) => string | null;
  /** 사진을 올린 뒤 바뀐 값을 편집기에 돌려줍니다 */
  onNormalized?: (data: T) => void;
  /** 자동 저장을 켤지 — 미리보기 화면에서는 끕니다 */
  autosave?: boolean;
}

export function useDocStore<T>(shape: DocShape<T>): DocStore<T> {
  const session = useSession();
  const online = backendEnabled && Boolean(session);

  const [doc, setDoc] = useState<DocRow | null>(null);
  const [loaded, setLoaded] = useState<{ doc: DocRow; data: T } | null>(null);
  const [state, setState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* 주소의 ?doc= 은 브라우저에서만 읽습니다. 서버 그림(정적 HTML)에서는
     언제나 null 이어야 첫 그림이 어긋나지 않습니다. */
  const paramId = useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).get("doc"),
    () => null,
  );

  /* 최신 값을 ref 로 들고 있습니다 — 자동 저장 타이머가 옛 값을 보내면
     방금 친 글자가 사라집니다. 그리기 도중이 아니라 그리고 난 뒤에
     채웁니다(그리는 중에 ref 를 건드리면 화면과 어긋납니다). */
  const latest = useRef(shape.data);
  const shapeRef = useRef(shape);
  useEffect(() => {
    latest.current = shape.data;
    shapeRef.current = shape;
  });

  /* 주소에 ?doc= 이 있으면 그 문서를 이어서 고칩니다. */
  useEffect(() => {
    if (!online || !paramId) return;

    let alive = true;
    getDoc(paramId)
      .then((row) => {
        if (!alive || !row) return;
        setDoc(row);
        setLoaded({ doc: row, data: row.data as T });
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "문서를 읽지 못했습니다."),
      );
    return () => {
      alive = false;
    };
  }, [online, paramId]);

  /* «불러오는 중» 은 따로 상태로 들지 않습니다 — 주소에 아이디가 있는데
     아직 문서가 없으면 그것이 곧 불러오는 중입니다. */
  const loading = Boolean(online && paramId && !doc && !error);

  const persist = useCallback(async (): Promise<DocRow | null> => {
    const s = shapeRef.current;
    if (!backendEnabled) return null;

    setState("saving");
    setError(null);
    try {
      /* 문서가 없으면 먼저 하나 만듭니다 — 사진 경로에 문서 아이디가
         들어가므로 순서를 바꿀 수 없습니다. */
      let row = doc;
      if (!row) {
        row = await createDoc({
          kind: s.kind,
          title: s.title(latest.current),
          designId: s.design(latest.current),
          data: latest.current,
          eventDate: s.eventDate(latest.current),
        });
        setDoc(row);
      }

      const normalized = await materializePhotos(latest.current, row.id);
      if (normalized !== latest.current) {
        latest.current = normalized;
        s.onNormalized?.(normalized);
      }

      await saveDoc(row.id, {
        title: s.title(normalized),
        designId: s.design(normalized),
        data: normalized,
        eventDate: s.eventDate(normalized),
      });

      setState("saved");
      setSavedAt(
        new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      );
      return row;
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
      return null;
    }
  }, [doc]);

  /* 자동 저장 — 손을 멈추면 저장합니다. */
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!online || shape.autosave === false) return;
    // 아직 아무것도 만들지 않은 상태에서 빈 문서를 만들지 않도록,
    // 이미 문서가 있을 때만 자동으로 저장합니다.
    if (!doc) return;

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void persist();
    }, 2500);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [shape.data, shape.autosave, online, doc, persist]);

  const publish = useCallback(async (): Promise<PublishResult | null> => {
    const row = await persist();
    if (!row) return null;
    try {
      return await publishDoc(row.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "발행하지 못했습니다.");
      return null;
    }
  }, [persist]);

  return { online, doc, loading, state, savedAt, error, save: persist, publish, loaded };
}
