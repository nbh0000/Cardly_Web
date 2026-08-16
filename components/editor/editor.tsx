"use client";

import Link from "next/link";
import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { SectionPanel } from "@/components/editor/panels";
import { Rail, type SectionId } from "@/components/editor/rail";
import { InvitationView } from "@/components/invitation/invitation-view";
import {
  buildExport,
  downloadExport,
  suggestSlug,
} from "@/lib/export-invitation";
import { buildQrSvg } from "@/lib/qr";
import {
  TEMPLATES,
  createDefaultData,
  getTemplate,
  type InvitationData,
  type SectionKey,
} from "@/lib/invitation";

/** 값이 바뀌지 않는 스토어 — 최초 스냅샷만 필요할 때 씁니다. */
const subscribeNever = () => () => {};

/** 좌측 레일 항목 → 청첩장 섹션 앵커 */
const RAIL_TO_SECTION: Partial<Record<SectionId, SectionKey | "cover">> = {
  decor: "cover",
  design: "cover",
  image: "cover",
  opening: "cover",
  effect: "cover",
  invite: "invitation",
  groom: "invitation",
  bride: "invitation",
  couple: "couple",
  timeline: "timeline",
  album: "album",
  notice: "notice",
  wedding: "location",
  gallery: "gallery",
  account: "account",
  video: "video",
  guestbook: "guestbook",
  rsvp: "rsvp",
  snap: "snap",
  gift: "gift",
};

/** 업로드 사진(blob URL)을 모두 비운 사본 — 저장/복원 양쪽에서 씁니다. */
function stripPhotos(d: InvitationData): InvitationData {
  return {
    ...d,
    coverPhoto: undefined,
    shareImage: undefined,
    groomPhoto: undefined,
    bridePhoto: undefined,
    videoThumb: undefined,
    gallery: [],
    notices: d.notices.map((n) => ({ ...n, photo: undefined })),
    timeline: d.timeline.map((t) => ({ ...t, photo: undefined })),
    albumPages: d.albumPages.map((p) => ({ ...p, photos: [] })),
  };
}

const PRODUCT_NAV = [
  { label: "MOBILE INVITATION", href: "/templates" },
  { label: "WEDDING POSTER", href: "/templates" },
  { label: "MEAL TICKET", href: "/templates" },
];

export function Editor({ templateId }: { templateId: string }) {
  const [data, setData] = useState<InvitationData>(() =>
    createDefaultData(templateId),
  );
  const [section, setSection] = useState<SectionId>("decor");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [panelOpen, setPanelOpen] = useState(true);
  const [saved, setSaved] = useState<string | null>(null);
  /** 방금 추가된 섹션을 잠깐 강조합니다. */
  const [flash, setFlash] = useState<string | null>(null);
  /** 값이 바뀌면 오프닝 애니메이션이 다시 재생됩니다. */
  const [replay, setReplay] = useState(0);

  const storageKey = `daon:draft:wedding:${templateId}`;
  const [dismissed, setDismissed] = useState(false);

  // 서버에서는 항상 null, 클라이언트에서만 저장된 초안을 읽습니다.
  // 자동 덮어쓰기 대신 사용자가 직접 "이어서 편집"을 눌러 복원합니다.
  const draftRaw = useSyncExternalStore(
    subscribeNever,
    () => localStorage.getItem(storageKey),
    () => null,
  );

  const restore = () => {
    try {
      const parsed = JSON.parse(draftRaw ?? "") as InvitationData;
      setData(stripPhotos(parsed));
    } catch {
      /* 손상된 초안은 무시 */
    }
    setDismissed(true);
  };

  const set = useCallback(
    <K extends keyof InvitationData>(key: K, value: InvitationData[K]) =>
      setData((d) => ({ ...d, [key]: value })),
    [],
  );

  const template = getTemplate(data.templateId) ?? TEMPLATES[0]!;

  // 편집 중인 섹션이 미리보기 어디에 있는지 바로 보이도록 스크롤합니다.
  const previewRef = useRef<HTMLDivElement>(null);

  /**
   * 미리보기를 해당 섹션 앵커로 스크롤합니다.
   * 방금 켠 섹션은 아직 DOM 에 없을 수 있어 프레임을 두 번 기다립니다.
   */
  const scrollToAnchor = useCallback((key: string) => {
    const tryScroll = (retries: number) => {
      const scroller = previewRef.current;
      const target = scroller?.querySelector<HTMLElement>(`#sec-${key}`);
      if (scroller && target) {
        scroller.scrollTo({ top: Math.max(0, target.offsetTop - 8), behavior: "smooth" });
        setFlash(key);
        window.setTimeout(() => setFlash(null), 1400);
        return;
      }
      if (retries > 0) requestAnimationFrame(() => tryScroll(retries - 1));
    };
    requestAnimationFrame(() => tryScroll(3));
  }, []);

  const goToSection = useCallback(
    (id: SectionId) => {
      setSection(id);
      const key = RAIL_TO_SECTION[id];
      if (key) scrollToAnchor(key);
    },
    [scrollToAnchor],
  );

  /** 오프닝 애니메이션 다시 보기 — 미리보기를 맨 위로 올리고 재생합니다. */
  const replayOpening = useCallback(() => {
    previewRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setReplay((n) => n + 1);
  }, []);

  /** 섹션 토글을 켜거나 항목을 추가했을 때 그 위치를 보여줍니다. */
  const revealSection = useCallback(
    (key: SectionKey) => {
      // 모바일에서는 미리보기가 다른 탭이라 먼저 전환해 줍니다.
      if (window.matchMedia("(max-width: 1023px)").matches) setTab("preview");
      scrollToAnchor(key);
    },
    [scrollToAnchor],
  );

  /** 청첩장 링크 QR 을 SVG 로 만들어 내려받습니다. */
  const downloadQr = () => {
    // basePath 아래에 배포될 수도 있어 origin 만 쓰면 404 가 됩니다.
    // 현재 주소(.../editor/<id>)에서 basePath 를 그대로 떼어 씁니다.
    const base = window.location.pathname.replace(/\/editor\/.*$/, "");
    const url = `${window.location.origin}${base}/preview/${template.id}`;
    const svg = buildQrSvg(url);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${template.id}-qr.svg`;
    a.click();
    // 클릭 직후 해제하면 다운로드가 시작되기 전에 URL 이 죽을 수 있습니다.
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
  };

  /**
   * 발행용 파일 내보내기.
   * 사진은 blob: URL 이라 그대로는 남길 수 없어, 실제 픽셀을 읽어 파일에
   * 담습니다. 사진이 많으면 몇 초 걸리므로 진행 상태를 표시합니다.
   */
  const [publishing, setPublishing] = useState(false);

  const publish = async () => {
    const suggested = suggestSlug(data);
    const slug = window
      .prompt(
        "청첩장 주소를 정해주세요. /i/<주소> 로 열립니다.\n영문 소문자·숫자·하이픈만 쓸 수 있습니다.",
        suggested,
      )
      ?.trim();
    if (!slug) return;
    if (!/^[a-z0-9-]+$/.test(slug)) {
      window.alert("영문 소문자·숫자·하이픈만 쓸 수 있습니다.");
      return;
    }

    setPublishing(true);
    try {
      downloadExport(await buildExport(data, slug));
      window.alert(
        `${slug}.json 을 받았습니다.\n\n터미널에서 아래를 실행한 뒤 커밋·푸시하면 배포됩니다.\n\nnpm run invite:add -- <내려받은 파일 경로>\n\n배포 후 주소: /i/${slug}`,
      );
    } catch {
      window.alert("사진을 읽지 못했습니다. 사진을 다시 올린 뒤 시도해 주세요.");
    } finally {
      setPublishing(false);
    }
  };

  const save = () => {
    // blob: URL 은 세션이 끝나면 죽으므로 저장 대상에서 모두 제외합니다.
    const rest = stripPhotos(data);
    localStorage.setItem(storageKey, JSON.stringify(rest));
    setSaved(
      new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    );
    setTimeout(() => setSaved(null), 3000);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-cream">
      {/* ── 글로벌 헤더 ── */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-6 border-b border-line bg-ivory px-4 lg:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-lg tracking-tight text-ink">
            Cardly
            <span className="ml-1 align-super text-[0.5em] tracking-[0.24em] text-rose-deep">
              KR
            </span>
          </Link>
          <nav className="hidden items-center gap-7 xl:flex">
            {PRODUCT_NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="text-[0.6875rem] tracking-[0.12em] text-ink-soft transition-colors hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="hidden shrink-0 rounded-full bg-rose-veil px-2.5 py-1 text-[0.6875rem] whitespace-nowrap text-rose-deep transition-colors hover:bg-rose-mist sm:inline"
          >
            요금 안내
          </Link>
          {/* "+ 새로 만들기" 가 네 줄로 접히면서 높이가 105px 이 돼
              헤더(h-14 = 56px) 밖으로 삐져나가 잘리던 자리입니다.

              nowrap·shrink-0 으로 줄바꿈과 수축은 막았지만, 크롬이 이
              flex 항목의 콘텐츠 폭을 웹폰트가 바뀌기 전 기준(56px)으로
              잡아 두고 다시 계산하지 않아 글자가 알약 배경 밖으로
              비어져 나왔습니다. w-max·w-auto 를 줘도 그대로였습니다.
              그래서 글자 폭 측정에 기대지 않고 최소 폭을 직접 정합니다. */}
          <Link
            href="/templates"
            className="press hidden min-w-[6.75rem] shrink-0 items-center justify-center rounded-full bg-ink px-4 py-2 text-[0.75rem] whitespace-nowrap text-ivory sm:inline-flex"
          >
            + 새로 만들기
          </Link>
        </div>
      </header>

      {/* ── 모바일 탭 ── */}
      <div className="grid shrink-0 grid-cols-2 border-b border-line bg-ivory lg:hidden">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`py-2.5 text-[0.8125rem] transition-colors ${
              tab === t
                ? "border-b-2 border-ink text-ink"
                : "border-b-2 border-transparent text-muted"
            }`}
          >
            {t === "edit" ? "편집" : "미리보기"}
          </button>
        ))}
      </div>

      {/* 저장된 초안 알림 */}
      {draftRaw && !dismissed && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-rose-veil px-4 py-2.5 lg:px-6">
          <p className="text-[0.75rem] text-ink">
            저장해 둔 초안이 있습니다. 이어서 편집할까요?
            <span className="ml-1.5 text-muted">(사진은 다시 등록해 주세요)</span>
          </p>
          <span className="flex shrink-0 gap-2">
            <button onClick={restore} className="press rounded-full bg-ink px-3 py-1.5 text-[0.6875rem] text-ivory">
              이어서 편집
            </button>
            <button onClick={() => setDismissed(true)} className="press rounded-full border border-line bg-white px-3 py-1.5 text-[0.6875rem] text-ink-soft">
              새로 시작
            </button>
          </span>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* ── 좌측 아이콘 레일 ── */}
        <div className={tab === "edit" ? "contents" : "hidden lg:contents"}>
          <Rail active={section} onSelect={goToSection} />
        </div>

        {/* ── 편집 패널 ── */}
        <div
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto border-line bg-cream lg:max-w-[27rem] lg:flex-none lg:border-r ${
            panelOpen ? "lg:block" : "lg:hidden"
          } ${tab === "edit" ? "block" : "hidden lg:block"}`}
        >
          <div key={section} className="panel-enter px-5 py-6 lg:px-7">
            <SectionPanel
              section={section}
              data={data}
              set={set}
              setData={setData}
              onGoOrder={() => goToSection("order")}
              onReveal={revealSection}
              onReplayOpening={replayOpening}
            />
          </div>
        </div>

        {/* ── 미리보기 ── */}
        <div
          className={`relative min-h-0 flex-1 overflow-hidden bg-cream ${
            tab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          {/* 패널 접기 손잡이 */}
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-label={panelOpen ? "편집 패널 접기" : "편집 패널 펴기"}
            className="press absolute top-1/2 left-0 z-20 hidden h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-line bg-ivory text-muted hover:text-ink lg:flex"
          >
            <span className={`transition-transform duration-300 ${panelOpen ? "" : "rotate-180"}`}>
              ‹
            </span>
          </button>

          {/* 미리보기 헤더 */}
          <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-8">
            <p className="flex items-center gap-2">
              <span className="font-serif text-[0.9375rem] text-ink">청첩장 미리보기</span>
            </p>
            <div className="flex items-center gap-2">
              {saved && <span className="hidden text-[0.6875rem] text-muted sm:inline">{saved} 저장됨</span>}
              <button type="button" onClick={downloadQr} className="press hidden items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-[0.75rem] text-ink sm:flex">
                {/* 이 QR 은 내 청첩장이 아니라 템플릿 샘플 화면을 가리킵니다. */}
                <QrGlyph /> 템플릿 QR
              </button>
              <button
                type="button"
                onClick={publish}
                disabled={publishing}
                className="press rounded-md border border-line bg-white px-3 py-2 text-[0.75rem] text-ink disabled:opacity-50"
              >
                {publishing ? "만드는 중…" : "발행용 파일 내보내기"}
              </button>
              <button onClick={save} className="press rounded-md bg-ink px-4 py-2 text-[0.75rem] text-ivory">
                청첩장 저장하기
              </button>
            </div>
          </div>

          {/* 폰 프레임 */}
          <div className="flex h-[calc(100%-4rem)] items-start justify-center overflow-y-auto px-4 pb-8">
            <div className="w-full max-w-[24rem]">
              <div className="iv-stage overflow-hidden rounded-phone bg-white p-2 shadow-lift ring-1 ring-line">
                <div ref={previewRef} className="relative max-h-[calc(100dvh-13rem)] overflow-y-auto overscroll-contain rounded-[1.5rem]">
                  <InvitationView
                    template={template}
                    data={data}
                    live={false}
                    flash={flash}
                    replayKey={String(replay)}
                  />
                </div>
              </div>
              <p className="mt-3 text-center text-[0.6875rem] text-muted">
                하객이 실제로 보는 화면입니다 · 스크롤해서 확인하세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M1 1h5v5H1V1Zm1.2 1.2v2.6h2.6V2.2H2.2ZM10 1h5v5h-5V1Zm1.2 1.2v2.6h2.6V2.2h-2.6ZM1 10h5v5H1v-5Zm1.2 1.2v2.6h2.6v-2.6H2.2ZM10 10h1.6v1.6H10V10Zm3.4 0H15v1.6h-1.6V10ZM10 13.4h1.6V15H10v-1.6Zm3.4 0H15V15h-1.6v-1.6Z" />
    </svg>
  );
}
