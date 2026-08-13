import { CARD_TEMPLATES } from "@/lib/studio/card-templates";
import { TEMPLATES } from "@/lib/invitation";
import { formatPrice, PREMIUM_PRICE } from "@/lib/plan";
import { RESUME_TEMPLATES } from "@/lib/studio/resume-templates";

/**
 * 안심하고 시작할 수 있는 이유.
 *
 * 예전에는 이 자리에 후기 카드 세 장과 "4.9 / 5.0 · 후기 3,182건" 이
 * 하드코딩돼 있었습니다. 실제로 받은 후기가 아니라 지어낸 문장이라
 * 표시광고법상 거짓·과장 광고에 해당할 수 있어 걷어냈습니다.
 * 대신 코드로 확인되는 사실만 적습니다 — 템플릿 수는 실제 배열 길이를
 * 세고, 금액은 요금 상수를 그대로 씁니다.
 * 진짜 후기가 쌓이면 그때 후기 섹션을 다시 두면 됩니다.
 */

const POINTS = [
  {
    label: "가입 없음",
    title: "계정을 만들지 않아도 됩니다",
    body: "이메일도 비밀번호도 묻지 않습니다. 링크를 열면 그 자리에서 바로 편집이 시작됩니다.",
  },
  {
    label: "이 브라우저 안에서",
    title: "이력서와 명함은 서버로 가지 않습니다",
    body: "이름, 연락처, 경력처럼 민감한 내용이 이 브라우저를 벗어나지 않습니다. 저장도 내려받기도 기기에서 처리됩니다.",
  },
  {
    label: "먼저 만들어 보고",
    title: `결제는 마음에 들 때 한 번, ${formatPrice(PREMIUM_PRICE)}`,
    body: "청첩장은 무료 링크로 먼저 보내 보고 결정하세요. 이력서와 명함은 결제 자체가 없습니다.",
  },
  {
    label: "골라 쓸 수 있게",
    title: `템플릿 ${TEMPLATES.length + RESUME_TEMPLATES.length + CARD_TEMPLATES.length}종`,
    body: `청첩장 ${TEMPLATES.length}종, 이력서 ${RESUME_TEMPLATES.length}종, 명함 ${CARD_TEMPLATES.length}종. 고른 뒤에도 색과 글꼴은 언제든 바꿀 수 있습니다.`,
  },
];

export function Assurance() {
  return (
    <section id="why" className="scroll-mt-20 py-section">
      <div className="shell">
        <div className="mx-auto max-w-narrow text-center">
          <span className="eyebrow eyebrow-center">Why Cardly</span>
          <h2 className="mt-5 font-serif text-h1 text-ink">
            시작하기 전에 잃을 게 없습니다
          </h2>
          <p className="mt-5 text-body text-ink-soft">
            만들어 보는 데 계정도, 비용도, 설치도 필요하지 않습니다.
          </p>
        </div>

        <ul className="mt-block grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p) => (
            <li
              key={p.label}
              className="flex flex-col rounded-lg border border-line bg-cream p-7"
            >
              <span className="eyebrow">{p.label}</span>
              <h3 className="mt-5 font-serif text-h3 text-ink">{p.title}</h3>
              <p className="mt-3 text-caption text-ink-soft">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
