import Link from "next/link";
import { WeddingMock } from "@/components/home/mockups";
import { asset } from "@/lib/asset";
import { DESIGNS } from "@/lib/occasion/designs";

/**
 * 디자인 갤러리 — 그림만 옆으로 흐릅니다.
 *
 * 이름도 값도 붙이지 않습니다. 여기는 고르는 화면이 아니라 «이런 것들이
 * 있다» 를 보여 주는 자리이고, 글자가 붙는 순간 눈이 그림 대신 글자를
 * 읽습니다(Paperless Post 가 하는 방식입니다).
 *
 * 오른쪽 화면 밖으로 넘겨 두는 것이 «더 있다» 는 유일한 신호입니다.
 * 화살표 단추를 달지 않는 이유는, 이 줄이 페이지의 목적지가 아니기
 * 때문입니다 — 눌러야 할 곳은 맨 아래 하나뿐이어야 합니다.
 */

/** 갤러리에 세우는 청첩장. 서로 최대한 다른 분위기로 고릅니다. */
const WEDDING_PICKS = ["locket", "evergreen", "camellia", "midnight", "sorbet", "linen"];

/** 청첩장 한 벌과 초대장 넉 장을 번갈아 — 한쪽으로 몰리지 않게 */
function tiles() {
  const cards = DESIGNS.map((d) => ({ kind: "card" as const, id: d.id, art: d.art }));
  const covers = WEDDING_PICKS.map((id) => ({ kind: "cover" as const, id }));

  const out: ({ kind: "card"; id: string; art: string } | { kind: "cover"; id: string })[] = [];
  let c = 0;
  cards.forEach((card, i) => {
    if (i % 4 === 0 && c < covers.length) out.push(covers[c++]!);
    out.push(card);
  });
  while (c < covers.length) out.push(covers[c++]!);
  return out;
}

export function DesignGallery() {
  return (
    <section className="hm-section">
      <div className="hm-shell">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <h2 className="hm-h2">고르기만 하면 됩니다</h2>
          <Link href="/invitation-card" className="hm-link">
            디자인 전부 보기
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* 무대는 shell 밖에 둡니다 — 오른쪽 끝을 넘어가야 «더 있다» 가 보입니다.
          키보드로도 밀 수 있도록 스크롤 영역에 초점을 줍니다. */}
      <div
        className="hm-gallery mt-10"
        tabIndex={0}
        role="group"
        aria-label="청첩장과 초대장 디자인"
      >
        {tiles().map((tile) =>
          tile.kind === "cover" ? (
            <span key={`w-${tile.id}`} className="hm-tile">
              <WeddingMock templateId={tile.id} className="!aspect-[5/7] h-full w-full" />
            </span>
          ) : (
            <span key={`c-${tile.id}`} className="hm-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(`/art/thumb/${tile.art}`)}
                alt=""
                width={560}
                height={784}
                loading="lazy"
                decoding="async"
              />
            </span>
          ),
        )}
      </div>
    </section>
  );
}
