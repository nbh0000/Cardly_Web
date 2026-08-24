import Link from "next/link";
import {
  CardMock,
  InviteMock,
  ResumeMock,
  WeddingMock,
} from "@/components/home/mockups";

/**
 * 만들 수 있는 것 넷을 한 줄씩.
 *
 * 카드 네 장을 격자에 늘어놓으면 넷이 동시에 눈에 들어와 무엇 하나도
 * 제대로 읽히지 않습니다. 한 화면에 하나씩, 글은 왼쪽 그림은 오른쪽,
 * 다음 줄에서는 좌우를 바꿔 눈이 지그재그로 내려가게 둡니다.
 *
 * 글은 제목 한 줄 · 설명 한 줄 · 링크 하나가 전부입니다. 영문 라벨과
 * «템플릿 몇 종» 은 걷어냈습니다 — 고르는 이유가 개수인 적은 없고,
 * 라벨은 제목을 한 번 더 말하는 장식이었습니다.
 */

interface Row {
  title: string;
  body: string;
  href: string;
  cta: string;
  art: React.ReactNode;
  /** 그림을 왼쪽에 둘지 */
  flip?: boolean;
}

const ROWS: Row[] = [
  {
    title: "모바일 청첩장",
    body: "사진과 인사말을 채우고 링크를 발행하면, 하객은 주소 하나만 눌러 봅니다.",
    href: "/templates",
    cta: "청첩장 만들기",
    art: (
      <WeddingMock className="w-full max-w-[20rem] rounded-[1.5rem] shadow-[var(--hm-lift)]" />
    ),
  },
  {
    title: "초대장",
    body: "받는 사람이 표지를 넘겨 여는 접힌 카드. 돌잔치·생일·집들이·개업·모임.",
    href: "/invitation-card",
    cta: "초대장 만들기",
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
    title: "이력서",
    body: "기간이 오른쪽에 정렬되고 성과가 불릿으로 붙는, 실제 채용 서류 조판 그대로.",
    href: "/resume",
    cta: "이력서 만들기",
    art: <ResumeMock className="w-full max-w-[18rem] shadow-[var(--hm-lift)]" />,
  },
  {
    title: "명함",
    body: "90 × 50 mm 실제 크기로 편집하고, 재단 안전선을 보며 인쇄용으로 저장합니다.",
    href: "/business-card",
    cta: "명함 만들기",
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
                <h2 className="hm-h2">{row.title}</h2>
                <p className="hm-lead mt-4 max-w-[26rem]">{row.body}</p>

                <p className="mt-8">
                  <Link href={row.href} className="hm-link">
                    {row.cta}
                    <Arrow />
                  </Link>
                </p>
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
