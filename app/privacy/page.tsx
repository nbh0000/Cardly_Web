import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "Cardly가 어떤 정보를 어디에 저장하고 무엇을 저장하지 않는지 정리했습니다. 이력서·명함 편집 내용은 서버로 전송되지 않습니다.",
  alternates: { canonical: "/privacy/" },
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. 이력서·명함 편집 내용은 서버로 보내지 않습니다",
    body: [
      "이력서 만들기와 명함 만들기에 입력한 이름, 연락처, 경력, 증명사진, 로고 이미지는 서버로 전송되지 않습니다. 편집 중인 내용은 이용자의 브라우저 저장소(localStorage)에만 보관되며, 같은 브라우저에서 다시 접속했을 때 이어서 작업할 수 있게 하는 용도로만 쓰입니다.",
      "PDF·Word·PNG 파일도 이용자의 기기 안에서 만들어져 곧바로 내려받아집니다. Cardly는 그 파일의 사본을 갖지 않습니다.",
      "브라우저에 저장된 편집 내용은 각 제작기의 저장 항목에서 '처음부터 다시 쓰기'를 눌러 언제든 지울 수 있습니다. 브라우저의 사이트 데이터 삭제 기능으로도 지워집니다.",
    ],
  },
  {
    title: "2. 모바일 청첩장을 발행할 때",
    body: [
      "모바일 청첩장은 링크로 공유하는 서비스라, 발행을 선택한 경우에 한해 청첩장에 담긴 내용(문구, 사진, 예식 정보, 안내 문구)이 저장됩니다. 발행하지 않고 편집만 하는 동안에는 아무것도 저장되지 않습니다.",
      "발행한 청첩장 주소를 아는 사람은 누구나 그 내용을 볼 수 있습니다. 연락처나 계좌번호처럼 공개 범위를 제한하고 싶은 정보는 편집기에서 해당 항목을 끄고 사용해 주세요.",
      "발행한 청첩장의 삭제를 원하시면 아래 문의 주소로 청첩장 주소를 알려 주시면 확인 후 삭제합니다.",
    ],
  },
  {
    title: "3. 광고와 쿠키",
    body: [
      "이 사이트는 Google AdSense 광고를 게재합니다. Google을 포함한 제3자 광고 사업자는 쿠키를 사용해 이용자의 이 사이트 및 다른 사이트 방문 기록을 바탕으로 광고를 게재할 수 있습니다.",
      "이용자는 Google 광고 설정(adssettings.google.com)에서 맞춤 광고를 사용하지 않도록 설정할 수 있으며, 브라우저 설정에서 쿠키를 차단할 수도 있습니다. 쿠키를 차단해도 이력서·명함 제작 기능은 그대로 사용할 수 있습니다.",
    ],
  },
  {
    title: "4. 만 14세 미만 이용자",
    body: [
      "Cardly는 만 14세 미만 아동을 대상으로 하지 않으며, 회원가입 절차가 없어 개인정보를 수집하지 않습니다.",
    ],
  },
  {
    title: "5. 문의",
    body: [
      "개인정보 처리에 관한 문의는 help@cardly.kr 로 보내 주시면 확인 후 답변드립니다.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow">
            <span className="eyebrow">Privacy</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">
              개인정보처리방침
            </h1>
            <p className="mt-5 text-body text-ink-soft">
              Cardly는 회원가입을 받지 않습니다. 무엇을 저장하지 않는지부터
              먼저 적었습니다.
            </p>
          </header>

          <div className="mx-auto mt-block max-w-narrow space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="font-serif text-h3 text-ink">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((line) => (
                    <p key={line} className="text-caption text-ink-soft">
                      {line}
                    </p>
                  ))}
                </div>
              </section>
            ))}
            <p className="text-[0.75rem] text-hint">시행일: 2026년 8월 12일</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
