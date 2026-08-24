import Link from "next/link";
import {
  CardMock,
  InviteMock,
  ResumeMock,
  WeddingMock,
} from "@/components/home/mockups";

/**
 * 첫 화면.
 *
 * 규칙은 셋입니다.
 *   ① 한 줄로 말한다 — 무엇을 파는지 문장 하나로. 서비스 나열은 아래 줄로.
 *   ② 누를 곳은 하나 — 단추가 둘이면 «어디로 가야 하지» 가 먼저 생깁니다.
 *   ③ 글보다 결과물이 먼저 눈에 든다 — 그래서 옆에 놓인 목업이 화면의 절반을
 *      차지하고, 네 조각이 겹쳐 있어 «여기서 이런 것들이 나온다» 가 한눈에
 *      읽힙니다.
 *
 * 목업은 스크린샷이 아니라 실제 렌더러입니다(components/home/mockups).
 */
export function HomeHero() {
  return (
    <section className="hm-section pt-28 md:pt-36">
      <div className="hm-shell grid items-center gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
        <div>
          <h1 className="hm-display">
            만들고, 저장하고,
            <br />
            보내세요
          </h1>

          <p className="hm-lead mt-7 max-w-[30rem]">
            이력서와 명함, 모바일 청첩장과 초대장. 브라우저에서 바로 만들어
            파일로 받고 링크로 보냅니다.
          </p>

          <div className="mt-10">
            <Link href="/templates" className="hm-btn">
              무료로 시작하기
            </Link>
          </div>

          <p className="hm-note mt-5">
            만들어 보는 데는 값도 가입도 필요 없습니다.
          </p>
        </div>

        {/* 네 조각이 겹쳐 놓인 무대. 자리와 크기는 전부 % 라 화면이 좁아져도
            같은 배치로 줄어듭니다(app/home.css). */}
        <div className="hm-stage" aria-hidden>
          <div className="hm-piece hm-piece-resume">
            <ResumeMock />
          </div>

          <div className="hm-piece hm-piece-phone">
            <WeddingMock />
          </div>

          <div className="hm-piece hm-piece-card">
            <InviteMock />
          </div>

          <div className="hm-piece hm-piece-business">
            <CardMock />
          </div>
        </div>
      </div>
    </section>
  );
}
