/**
 * 홈에 놓이는 결과물 목업.
 *
 * 따로 그린 그림이 아니라 **실제 렌더러를 그대로 축소한 것**입니다. 홈에서
 * 본 이력서 조판이 편집기에서 그대로 열리고, 템플릿을 하나 고치면 홈도 같이
 * 바뀝니다. 스크린샷을 붙여 두면 반드시 어느 날 화면과 어긋납니다.
 *
 * 네 조각 모두 크기를 밖에서 정합니다(부모의 폭을 따릅니다). 그래야 히어로의
 * 겹친 배치와 아래 섹션의 큰 미리보기가 같은 컴포넌트를 쓸 수 있습니다.
 */

import { InvitationView } from "@/components/invitation/invitation-view";
import { ClosedCard } from "@/components/occasion/fold";
import { asset } from "@/lib/asset";
import { createDefaultData, getTemplate } from "@/lib/invitation";
import { findDesign } from "@/lib/occasion/designs";
import { artThumb, CARD_TEMPLATES } from "@/lib/studio/card-templates";
import { RESUME_TEMPLATES } from "@/lib/studio/resume-templates";

/* 홈에 세우는 대표 한 벌. 바뀌면 여기만 고칩니다.

   청첩장은 «느와르» — 흑백 사진 한 장이 표지를 가득 채우는 판입니다.
   명함은 «그래파이트» — 브러시드 메탈 바탕에 흰 글자.
   이력서는 «클래식 + 뉴트럴» 입니다 — 이름이 가운데 서고 색면 없이
   헤어라인으로만 나뉘는 판. 예전에 세워 두었던 네이비 배너는 썸네일에서
   색 덩어리가 먼저 읽혀, 옆 칸의 결과물들과 무게가 맞지 않았습니다.

   초대장은 한복 입은 아기 호랑이입니다. 꽃 아치는 옆의 청첩장과 같은
   «결혼» 갈래라 둘이 겹쳐 보였습니다. 초대장이 결혼 말고도 돌·생일·
   집들이를 담는다는 것이 그림 하나로 읽혀야 합니다. */
const RESUME_PICK = "classic-ink";
const CARD_PICK = "sig-8";
const WEDDING_PICK = "noir";
const INVITE_PICK = "dol-baby-tiger";

/** 이력서 — A4 조판. 안쪽이 전부 % 라 폭만 주면 그대로 줄어듭니다. */
export function ResumeMock({ className }: { className?: string }) {
  const t = RESUME_TEMPLATES.find((x) => x.id === RESUME_PICK);
  if (!t) return null;
  return (
    <span
      className={`rthumb ${className ?? ""}`}
      data-l={t.layout}
      style={
        {
          "--ac": t.accent,
          "--sf": t.soft,
          "--pp": t.paper,
        } as React.CSSProperties
      }
    >
      <i />
      <em />
    </span>
  );
}

/** 명함 — 90 × 50 mm 앞면 */
export function CardMock({ className }: { className?: string }) {
  const t = CARD_TEMPLATES.find((x) => x.id === CARD_PICK);
  if (!t) return null;
  return (
    <span
      className={`cthumb ${className ?? ""}`}
      data-deco={t.deco}
      data-align={t.placement.align}
      style={
        {
          "--ac": t.accent,
          "--bg": t.bg,
          "--tx": t.text,
          backgroundImage: t.art ? `url(${asset("/" + artThumb(t.art))})` : undefined,
          backgroundPosition: t.art?.position,
          backgroundSize: t.art?.size,
        } as React.CSSProperties
      }
    >
      <em />
      <b />
      <i />
    </span>
  );
}

/**
 * 모바일 청첩장 — 실제 청첩장 렌더러의 커버.
 *
 * 렌더러는 폰 화면 크기로 그려지므로 그대로 넣으면 목업 밖으로 넘칩니다.
 * 갤러리 썸네일과 같은 배율(0.62)로 줄여 담습니다.
 */
export function WeddingMock({
  className,
  templateId = WEDDING_PICK,
}: {
  className?: string;
  /** 갤러리에서 여러 벌을 늘어놓을 때만 씁니다 */
  templateId?: string;
}) {
  const template = getTemplate(templateId);
  if (!template) return null;
  const data = { ...createDefaultData(templateId), fontScale: "sm" as const };

  return (
    <span
      className={`relative block aspect-[3/4] overflow-hidden bg-white ${className ?? ""}`}
    >
      <span className="hm-cover block">
        <InvitationView template={template} data={data} coverOnly />
      </span>
    </span>
  );
}

/** 접히는 초대장 — 닫힌 채로 서 있는 카드 */
export function InviteMock() {
  const design = findDesign(INVITE_PICK);
  if (!design) return null;
  return <ClosedCard design={design} />;
}
