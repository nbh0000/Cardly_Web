import Link from "next/link";
import {
  CardMock,
  InviteMock,
  ResumeMock,
  WeddingMock,
} from "@/components/home/mockups";
import { DESIGNS } from "@/lib/occasion/designs";
import { TEMPLATES } from "@/lib/invitation";
import { CARD_TEMPLATES } from "@/lib/studio/card-templates";
import { RESUME_TEMPLATES } from "@/lib/studio/resume-templates";

/**
 * 도구 넷을 한 줄씩.
 *
 * 카드 네 장을 격자로 늘어놓으면 넷이 동시에 눈에 들어와 무엇 하나도 제대로
 * 읽히지 않습니다. 한 화면에 하나씩, 글은 왼쪽 그림은 오른쪽, 다음 줄에서는
 * 좌우를 바꿔 눈이 지그재그로 내려가게 둡니다.
 *
 * 글은 제목 한 줄 · 설명 한 줄 · 링크 하나로 끝냅니다. 숫자(템플릿 몇 종)는
 * 제목이 아니라 맨 아래 작은 줄에만 둡니다 — 고르는 이유가 개수인 적은
 * 없습니다.
 */

interface Row {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  meta: string;
  art: React.ReactNode;
  /** 그림을 왼쪽에 둘지 */
  flip?: boolean;
}

const ROWS: Row[] = [
  {
    eyebrow: "Wedding",
    title: "모바일 청첩장",
    body: "사진과 인사말을 채우고 링크를 발행하면, 하객은 주소 하나만 눌러 봅니다.",
    href: "/templates",
    cta: "청첩장 만들기",
    meta: `템플릿 ${TEMPLATES.length}종 · 참석 여부와 방명록까지`,
    art: <WeddingMock className="w-full max-w-[20rem] rounded-[1.5rem] shadow-[var(--hm-lift)]" />,
  },
  {
    eyebrow: "Invitation",
    title: "초대장",
    body: "받는 사람이 표지를 넘겨 여는 접힌 카드. 돌잔치·생일·집들이·개업·모임.",
    href: "/invitation-card",
    cta: "초대장 만들기",
    meta: `디자인 ${DESIGNS.length}종 · 카드를 눌러 열어 보세요`,
    /* 목록에서 쓰는 것과 같은 장치입니다 — 마우스를 얹으면 그 자리에서
       카드가 열립니다. 정지 화면으로는 «접힌 물건» 이라는 사실이 전해지지
       않습니다. */
    art: (
      <span className="oc-fold block w-full max-w-[19rem]">
        <InviteMock />
      </span>
    ),
    flip: true,
  },
  {
    eyebrow: "Resume",
    title: "이력서",
    body: "기간이 오른쪽에 정렬되고 성과가 불릿으로 붙는, 실제 채용 서류 조판 그대로.",
    href: "/resume",
    cta: "이력서 만들기",
    meta: `템플릿 ${RESUME_TEMPLATES.length}종 · PDF·Word 저장`,
    art: <ResumeMock className="w-full max-w-[18rem] shadow-[var(--hm-lift)]" />,
  },
  {
    eyebrow: "Business Card",
    title: "명함",
    body: "90 × 50 mm 실제 크기로 편집하고, 재단 안전선을 보며 인쇄용으로 저장합니다.",
    href: "/business-card",
    cta: "명함 만들기",
    meta: `템플릿 ${CARD_TEMPLATES.length}종 · 양면 · 고해상도 PNG`,
    art: <CardMock className="w-full max-w-[26rem] shadow-[var(--hm-lift)]" />,
    flip: true,
  },
];

export function ToolRows() {
  return (
    <>
      {ROWS.map((row) => (
        <section key={row.href} className="hm-section">
          <div className="hm-shell">
            <div className="hm-row" data-flip={row.flip ? "1" : undefined}>
              <div className="hm-row-text">
                <span className="eyebrow">{row.eyebrow}</span>
                <h2 className="hm-h2 mt-4">{row.title}</h2>
                <p className="hm-lead mt-4 max-w-[26rem]">{row.body}</p>

                <p className="mt-8">
                  <Link href={row.href} className="hm-link">
                    {row.cta}
                    <Arrow />
                  </Link>
                </p>

                <p className="hm-note mt-4">{row.meta}</p>
              </div>

              <div className="hm-row-art">{row.art}</div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
