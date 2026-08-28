import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "이용약관",
  description:
    "Cardly 이력서·명함 제작기와 모바일 청첩장 서비스의 이용 조건, 저작권, 책임 범위를 정리했습니다.",
  alternates: { canonical: "/terms/" },
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. 서비스 범위",
    body: [
      "Cardly는 브라우저에서 이력서와 명함을 만들어 파일로 저장하는 도구, 그리고 링크로 보내는 모바일 청첩장과 초대장을 제공합니다. 이력서와 명함 제작은 회원가입과 결제 없이 이용할 수 있습니다.",
      "청첩장·초대장은 계정에 저장한 뒤 링크를 발행합니다. 현재는 서비스를 여는 기간이라 링크 발행과 참석 여부·방명록을 포함한 모든 기능을 무료로 제공하며, 결제를 받지 않습니다. 이 기간에 발행한 링크는 예식일·행사일로부터 30일까지(행사일을 적지 않은 경우 발행일로부터 1년) 열려 있습니다.",
      "유료 전환은 사전에 공지한 뒤 시작하며, 그 전에 이미 발행한 링크의 기한과 기능은 발행 당시의 조건을 그대로 유지합니다. 유료 범위와 금액은 요금 안내 페이지에 적혀 있습니다.",
    ],
  },
  {
    title: "2. 결제와 환불",
    body: [
      "아래 조항은 유료 전환 이후에 적용됩니다. 여는 기간 동안에는 청첩장과 초대장에 대해 어떤 금액도 청구하지 않습니다.",
      "결제는 문서 하나당 한 번 하는 단건 결제이며, 정기 결제(구독)가 아닙니다. 금액은 모바일 청첩장 14,900원, 초대장 5,900원입니다.",
      "결제하면 해당 문서의 링크 기한이 늘어나고 하단 표기가 사라지며, 참석 여부 집계와 방명록 등 프리미엄 기능이 열립니다.",
      "결제일로부터 7일 이내이고 발행한 링크를 아직 하객에게 보내지 않은 경우, help@cardly.kr 로 주문번호를 알려 주시면 전액 환불해 드립니다. 링크를 이미 공유한 뒤에는 서비스 제공이 개시된 것으로 보아 환불이 어렵습니다.",
      "Cardly의 잘못으로 링크가 기한 안에 열리지 않은 경우에는 기간에 관계없이 전액 환불합니다.",
    ],
  },
  {
    title: "3. 만든 결과물의 권리",
    body: [
      "이용자가 입력한 문구, 사진, 로고와 그것으로 만든 이력서·명함·청첩장·초대장의 권리는 이용자에게 있습니다. Cardly는 이용자의 결과물을 홍보 등 다른 목적으로 사용하지 않습니다.",
      "템플릿의 디자인과 이 사이트의 코드에 대한 권리는 Cardly에 있습니다. 템플릿을 사용해 만든 결과물은 인쇄와 배포를 포함해 자유롭게 쓸 수 있지만, 템플릿 자체를 추출해 다른 서비스에서 재배포할 수는 없습니다.",
      "이용자는 자신이 사용할 권리가 있는 사진과 로고만 올려야 합니다. 타인의 저작물이나 초상을 권한 없이 사용해 발생한 문제의 책임은 이용자에게 있습니다.",
    ],
  },
  {
    title: "4. 저장과 보관에 대한 책임",
    body: [
      "이력서와 명함의 편집 내용은 이용자의 브라우저에만 저장됩니다. 브라우저 데이터 삭제, 시크릿 모드 종료, 저장 공간 부족 등으로 내용이 사라질 수 있으므로, 중요한 작업은 완성 즉시 파일로 내려받아 보관해 주세요.",
      "청첩장·초대장은 로그인한 계정에 저장됩니다. 로그인하지 않고 만드는 동안에는 브라우저에만 남으며, 이 경우의 소실에 대해서는 복구를 보장하지 않습니다.",
      "발행한 링크의 기한이 지나면 하객에게는 닫힌 안내가 보입니다. 내용은 이용자의 카드함에 남아 있으며, 이용자가 지우면 사진을 포함해 삭제됩니다.",
    ],
  },
  {
    title: "5. 하객이 남기는 글",
    body: [
      "참석 여부와 방명록은 링크를 받은 사람이 로그인 없이 남깁니다. 그 내용은 문서를 만든 이용자만 볼 수 있으며, 이용자가 개별 항목을 지울 수 있습니다.",
      "타인을 비방하거나 권리를 침해하는 글이 남았을 때 Cardly는 해당 글을 삭제할 수 있습니다.",
    ],
  },
  {
    title: "6. 참고 지표와 안내의 성격",
    body: [
      "이력서 만들기의 '서류 점검 점수'와 각 페이지의 작성 안내는 일반적인 기준을 정리한 참고 자료입니다. 채용 결과나 서류 통과를 보장하지 않습니다.",
      "명함의 인쇄 규격 안내 역시 일반적인 기준이며, 실제 주문 전에는 이용하는 인쇄소의 규격 안내를 우선 확인해 주세요.",
    ],
  },
  {
    title: "7. 서비스 변경과 중단",
    body: [
      "Cardly는 기능과 템플릿을 개선하기 위해 서비스 내용을 변경할 수 있습니다. 유료 기능에 중대한 변경이 있을 때는 사전에 안내하며, 이미 결제한 문서의 기한과 기능은 결제 시점의 조건을 그대로 유지합니다.",
    ],
  },
  {
    title: "8. 문의",
    body: ["서비스 이용에 관한 문의는 help@cardly.kr 로 보내 주세요."],
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-28 pb-section md:pt-36">
        <div className="shell">
          <header className="mx-auto max-w-narrow">
            <span className="eyebrow">Terms</span>
            <h1 className="mt-5 font-serif text-h1 text-ink">이용약관</h1>
            <p className="mt-5 text-body text-ink-soft">
              무엇을 보장하고 무엇을 보장하지 않는지 분명히 적었습니다.
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
