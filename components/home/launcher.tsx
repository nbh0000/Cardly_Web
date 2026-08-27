import Link from "next/link";
import {
  CardMock,
  InviteMock,
  ResumeMock,
  WeddingMock,
} from "@/components/home/mockups";

/**
 * 첫 화면 — 고르는 자리.
 *
 * 예전에는 여기에 소개 페이지가 있었습니다. 히어로가 있고, 도구를 하나씩
 * 설명하는 줄이 넷 있고, 안심 문구가 있고, 맨 아래 다시 시작 단추가 있는
 * 세로로 긴 페이지였습니다. 걷어냈습니다.
 *
 * 이유는 하나입니다 — 여기에 오는 사람은 이미 무언가를 만들러 온 사람이고,
 * 그 사람에게 필요한 것은 «무엇을 만들지 고르는 일» 뿐입니다. 설명은 고른
 * 다음 화면이 이미 하고 있습니다. chatgpt.com 에 소개 페이지가 없고 열자마자
 * 입력칸이 나오는 것과 같은 판단입니다.
 *
 * 그래서 이 화면은 한 화면 안에서 끝납니다. 스크롤할 것이 없습니다.
 */

const ENTRIES = [
  {
    href: "/templates",
    title: "모바일 청첩장",
    body: "링크를 발행해 하객에게 보냅니다",
    /* 폭으로 크기를 정합니다 — 이 목업은 안쪽을 «폭 기준» 으로 축소하므로
       높이로 맞추면 그림이 잘립니다(app/home.css 의 .hm-cover).
       어느 판을 세울지는 mockups.tsx 한 곳이 정합니다. */
    art: <WeddingMock className="rounded-md shadow-[var(--shadow-card)]" />,
  },
  {
    href: "/invitation-card",
    title: "초대장",
    body: "표지를 넘겨 여는 접힌 카드",
    art: (
      <span className="oc-fold hm-invite block">
        <InviteMock />
      </span>
    ),
  },
  {
    href: "/resume",
    title: "이력서",
    body: "PDF·Word 로 바로 저장",
    art: <ResumeMock className="h-full w-auto shadow-[var(--shadow-card)]" />,
  },
  {
    href: "/business-card",
    title: "명함",
    body: "90 × 50 mm 인쇄용 파일",
    art: <CardMock className="w-full shadow-[var(--shadow-card)]" />,
  },
];

export function Launcher() {
  return (
    <section className="hm-launcher">
      <div className="hm-shell">
        <h1 className="hm-title">무엇을 만들까요?</h1>

        <ul className="hm-grid">
          {ENTRIES.map((entry) => (
            <li key={entry.href}>
              <Link href={entry.href} className="hm-entry">
                <span className="hm-entry-art">{entry.art}</span>
                <span className="hm-entry-text">
                  <span className="hm-entry-title">{entry.title}</span>
                  <span className="hm-entry-body">{entry.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
