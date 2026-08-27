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
import { CardFace } from "@/components/studio/card-face";
import { ResumeSheet } from "@/components/studio/resume-sheet";
import { createDefaultData, getTemplate } from "@/lib/invitation";
import { findDesign } from "@/lib/occasion/designs";
import {
  artThumb,
  CARD_TEMPLATES,
  placeItems,
  SAMPLE_ITEMS,
} from "@/lib/studio/card-templates";
import { RESUME_TEMPLATES, SAMPLE_RESUME } from "@/lib/studio/resume-templates";

/* 홈에 세우는 대표 한 벌. 바뀌면 여기만 고칩니다.

   청첩장은 «폴라로이드» — 사진 석 장을 겹쳐 붙인 표지입니다.
   명함은 «포레스트» — 짙은 초록에 몬스테라 잎이 오른쪽을 채웁니다.
   이력서는 «네이비 사이드바» — 왼쪽 기둥에 연락처·기술·자격이 서고
   오른쪽이 본문인 판. 한 장 안에 담기는 정보가 가장 많아 썸네일에서도
   «이력서» 로 읽힙니다.

   초대장은 한복 입은 아기 호랑이입니다. 꽃 아치는 옆의 청첩장과 같은
   «결혼» 갈래라 둘이 겹쳐 보였습니다. 초대장이 결혼 말고도 돌·생일·
   집들이를 담는다는 것이 그림 하나로 읽혀야 합니다. */
const RESUME_PICK = "sidebar-navy";
const CARD_PICK = "sig-9";
const WEDDING_PICK = "polaroid-day";
const INVITE_PICK = "dol-baby-tiger";

/**
 * 이력서 — 실제 A4 조판을 그대로 줄인 것.
 *
 * 예전에는 회색 막대 몇 개로 «이력서처럼 생긴 무늬» 를 그렸습니다. 줄
 * 굵기와 자리는 맞았지만 글이 없으니 빈 양식으로 읽혔고, 홈에서 파는 것이
 * «채워진 이력서» 라는 사실이 그림에서 사라졌습니다. 이제 편집기가 여는
 * 것과 같은 시트를 예시 내용(SAMPLE_RESUME)째로 그립니다.
 */
export function ResumeMock({ className }: { className?: string }) {
  const t = RESUME_TEMPLATES.find((x) => x.id === RESUME_PICK);
  if (!t) return null;
  return (
    <span className={`hm-resume ${className ?? ""}`}>
      <ResumeSheet template={t} data={SAMPLE_RESUME} />
    </span>
  );
}

/**
 * 명함 — 90 × 50 mm 앞면.
 *
 * 이력서와 같은 이유로 실물 면을 씁니다. 배경 그림만 가벼운 판(thumb)으로
 * 바꿔 넣습니다 — 홈에서 그려지는 크기가 150px 남짓이라 2800px 원본을
 * 내려받을 이유가 없습니다.
 */
export function CardMock({ className }: { className?: string }) {
  const t = CARD_TEMPLATES.find((x) => x.id === CARD_PICK);
  if (!t) return null;
  return (
    <span className={`hm-card ${className ?? ""}`}>
      <CardFace
        template={t}
        items={placeItems(t, SAMPLE_ITEMS)}
        artUrl={t.art ? artThumb(t.art) : undefined}
      />
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

  /* 비율을 못 박지 않습니다. aspect-[3/4] 로 잘라 두면 표지가 긴 판에서
     — 폴라로이드처럼 사진을 겹쳐 놓는 판에서 — 아래가 잘려 나갑니다.
     zoom 은 transform 과 달리 «자리» 까지 함께 줄이므로, 표지가 얼마나
     길든 통째로 들어옵니다. */
  return (
    <span className={`hm-invitation ${className ?? ""}`}>
      <InvitationView template={template} data={data} coverOnly />
    </span>
  );
}

/** 접히는 초대장 — 닫힌 채로 서 있는 카드 */
export function InviteMock() {
  const design = findDesign(INVITE_PICK);
  if (!design) return null;
  return <ClosedCard design={design} />;
}
