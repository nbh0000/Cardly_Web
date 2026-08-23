"use client";

/**
 * 하객이 링크로 여는 화면.
 *
 * 이 컴포넌트가 하는 일은 «주소 하나로 문서를 받아 와 그리는» 것뿐입니다.
 * 로그인은 없습니다 — 링크를 아는 사람이면 누구나 열립니다. 그 대신 주소가
 * 추측 불가능한 무작위 열 글자이고, 서버는 슬러그 하나로만 답합니다.
 *
 * ── 왜 내용을 정적 HTML 에 굽지 않는가 ──
 * 정적 HTML 에 내용을 박아 두면 발행 뒤 고친 것이 반영되지 않고, 기한이
 * 지나거나 발행을 거둬도 페이지가 그대로 남습니다. 그래서 HTML 에는
 * 카카오톡 미리보기용 <meta> 만 굽고(빌드가 합니다), 내용은 열 때마다
 * 받아 옵니다. 하객이 보는 것은 언제나 지금 상태입니다.
 *
 * 샘플(sample)은 예외입니다. 서버 없이도 열려야 하므로 값을 그대로 안고
 * 있습니다.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { GuestContext } from "@/components/invitation/guest-runtime";
import { InvitationView } from "@/components/invitation/invitation-view";
import { FoldedCard } from "@/components/occasion/folded-card";
import { GuestExtras } from "@/components/publish/guest-extras";
import { ShareBar } from "@/components/invitation/share-bar";
import { backendEnabled } from "@/lib/backend/client";
import { fetchPublicDoc, type DocKind, type DocPlan } from "@/lib/backend/docs";
import { createDefaultData, getTemplate, type InvitationData } from "@/lib/invitation";
import { findDesign } from "@/lib/occasion/designs";
import type { InviteData } from "@/lib/occasion/types";

/** 빌드가 알고 있는 값 — 샘플에만 있습니다 */
export interface SeedDoc {
  kind: DocKind;
  designId: string;
  plan: DocPlan;
  data: unknown;
  demo: true;
}

type Screen =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "closed" }
  | {
      kind: "ready";
      docKind: DocKind;
      designId: string;
      plan: DocPlan;
      data: unknown;
      demo: boolean;
    };

export function PublicView({
  kind,
  slug,
  seed,
}: {
  kind: DocKind;
  slug: string;
  seed?: SeedDoc;
}) {
  const [screen, setScreen] = useState<Screen>(
    /* 서버가 없는 환경에서는 기다릴 것이 없습니다 — 샘플이 아니면
       애초에 열 수 없는 주소입니다. */
    !seed && !backendEnabled
      ? { kind: "missing" }
      : seed
      ? {
          kind: "ready",
          docKind: seed.kind,
          designId: seed.designId,
          plan: seed.plan,
          data: seed.data,
          demo: true,
        }
      : { kind: "loading" },
  );

  useEffect(() => {
    if (seed || !backendEnabled) return;
    let alive = true;
    fetchPublicDoc(slug)
      .then((doc) => {
        if (!alive) return;
        if (!doc) setScreen({ kind: "missing" });
        else if (doc.state === "closed") setScreen({ kind: "closed" });
        else
          setScreen({
            kind: "ready",
            docKind: doc.kind,
            designId: doc.design_id,
            plan: doc.plan,
            data: doc.data,
            demo: false,
          });
      })
      .catch(() => alive && setScreen({ kind: "missing" }));
    return () => {
      alive = false;
    };
  }, [slug, seed]);

  if (screen.kind === "loading") {
    return (
      <div className="grid min-h-[70vh] place-items-center px-5">
        <p className="text-caption text-muted" aria-live="polite">
          {kind === "wedding" ? "청첩장을 여는 중입니다…" : "초대장을 펴는 중입니다…"}
        </p>
      </div>
    );
  }

  if (screen.kind === "closed") return <Closed kind={kind} />;
  if (screen.kind === "missing") return <Missing kind={kind} />;

  const premium = screen.plan === "premium";

  if (screen.docKind === "wedding") {
    const template = getTemplate(screen.designId);
    if (!template) return <Missing kind={kind} />;
    const data = {
      ...createDefaultData(screen.designId),
      ...(screen.data as Partial<InvitationData>),
    };

    return (
      <GuestContext value={{ slug, premium, demo: screen.demo }}>
        <div className="min-h-dvh bg-cream">
          <div className="mx-auto max-w-[26rem] md:py-10">
            <div className="iv-stage-md md:overflow-hidden md:rounded-phone md:bg-white md:p-2 md:shadow-lift md:ring-1 md:ring-line">
              <div className="md:h-[calc(100dvh-11rem)] md:overflow-y-auto md:overscroll-contain md:rounded-[1.5rem]">
                <InvitationView template={template} data={data} />
              </div>
            </div>

            <ShareBar slug={slug} />
            {!premium && <Watermark />}
          </div>
        </div>
      </GuestContext>
    );
  }

  const design = findDesign(screen.designId);
  const data = screen.data as InviteData;

  return (
    <div className="px-5 py-10 sm:py-16">
      <FoldedCard data={data} design={design} />

      {premium && <GuestExtras slug={slug} demo={screen.demo} askRsvp={data.rsvp} />}
      {!premium && <Watermark />}
    </div>
  );
}

/* ------------------------------------------------------------
   무료 발행에 붙는 표기

   광고가 아니라 출처입니다. 하객 수백 명이 보는 화면이고, 지금 이 서비스에
   사람이 들어오는 거의 유일한 길이기도 합니다. 그래서 크지 않게, 그러나
   확실히 눌리게 둡니다.
   ------------------------------------------------------------ */

function Watermark() {
  return (
    <p className="mx-auto mt-10 max-w-narrow px-4 pb-10 text-center text-[0.75rem] text-muted">
      이 초대장은{" "}
      <Link href="/" className="underline underline-offset-2">
        Cardly
      </Link>
      로 만들었어요. 가입 없이 무료로 만들 수 있습니다.
    </p>
  );
}

function Closed({ kind }: { kind: DocKind }) {
  const what = kind === "wedding" ? "청첩장" : "초대장";
  return (
    <div className="grid min-h-[70vh] place-items-center px-5">
      <div className="max-w-narrow text-center">
        <p className="font-serif text-h2 text-ink">
          이 {what}은 기간이 지나 닫혔어요
        </p>
        <p className="mt-4 text-body text-ink-soft">
          만든 분이 정한 기간이 끝났습니다. 내용이 다시 필요하시면 보내 주신
          분께 문의해 주세요.
        </p>
        <Link href="/" className="btn btn-ghost mt-8 bg-white">
          나도 만들어 보기
        </Link>
      </div>
    </div>
  );
}

function Missing({ kind }: { kind: DocKind }) {
  const what = kind === "wedding" ? "청첩장" : "초대장";
  return (
    <div className="grid min-h-[70vh] place-items-center px-5">
      <div className="max-w-narrow text-center">
        <p className="font-serif text-h2 text-ink">{what}을 찾지 못했습니다</p>
        <p className="mt-4 text-body text-ink-soft">
          링크가 중간에 잘렸을 수 있습니다. 주소 전체를 복사했는지 확인하시고,
          안 되면 보내 준 분께 다시 받아 보세요.
        </p>
        <Link href="/" className="btn btn-ghost mt-8 bg-white">
          나도 만들어 보기
        </Link>
      </div>
    </div>
  );
}
