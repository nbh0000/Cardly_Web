import Link from "next/link";

/**
 * 마지막 부름.
 *
 * 여기까지 내려온 사람은 이미 무엇인지 압니다. 그래서 설명을 다시 하지 않고
 * 한 문장과 단추 하나만 둡니다. 홈 전체에서 단추는 이것과 히어로의 것,
 * 둘뿐입니다.
 */
export function Closing() {
  return (
    <section className="hm-section hm-closing">
      <div className="hm-shell">
        <h2 className="hm-h2">오늘 만들어 오늘 보내세요</h2>
        <p className="hm-lead mx-auto mt-5 max-w-[26rem]">
          템플릿을 고르는 순간부터 링크가 나오기까지 십 분이면 됩니다.
        </p>
        <div className="mt-10">
          <Link href="/templates" className="hm-btn">
            무료로 시작하기
          </Link>
        </div>
      </div>
    </section>
  );
}
