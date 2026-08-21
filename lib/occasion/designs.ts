/* 초대장 디자인 스무 벌.

   한 벌이 정하는 것은 «어떤 그림을 쓰는가» 뿐입니다. 표지에 글자를 얹지
   않으므로 판짜기도, 글자 밝기도 없습니다. 속면의 글꼴과 크기와 여백은
   스무 벌이 모두 같습니다 — 벌마다 자유롭게 정할 수 있는 것이 적을수록
   스무 벌이 한 벌의 물건으로 보입니다.

   ── 색은 여기 없습니다 ────────────────────────────────────────
   종이색·글자색·강조색 셋은 palette.json 에서 옵니다. 그 파일은
   scripts/import-artwork.mjs 가 그림에서 직접 뽑아 씁니다. 손으로 고르면
   스무 벌 가운데 반드시 몇 벌은 그림과 따로 노는 색이 되고, 어느 벌이
   어긋났는지 찾기도 어렵습니다. 그림에서 뽑으면 그럴 일이 없고, 그림을
   다시 만들면 색도 저절로 따라옵니다.

   ── 그림 ──────────────────────────────────────────────────────
   스무 장 모두 Gemini 이미지 생성으로 만들었습니다(generate.mjs). 손으로
   짠 벡터 도형은 아무리 다듬어도 클립아트로 읽히고, 색면과 괘선만으로는
   실물 카드가 주는 화사함이 나오지 않습니다.

   디자인 id 와 그림 파일 이름이 같습니다. 그래서 공유 썸네일을 만드는
   스크립트가 이 파일을 읽지 않고도 짝을 지을 수 있습니다.            */

import PALETTE from "@/lib/occasion/palette.json";
import type { Design, OccasionId } from "@/lib/occasion/types";

type Seed = Omit<Design, "art" | "bg" | "ink" | "point">;

const SEEDS: Seed[] = [
  /* ══════════════════ 결혼 · 약혼 ══════════════════ */
  {
    id: "wedding-floral-arch",
    name: "꽃 아치",
    occasion: "wedding",
    note: "작약과 유칼립투스로 두른 아치. 가운데가 비어 있어 카드가 조용합니다.",
  },
  {
    id: "wedding-line-couple",
    name: "한 줄",
    occasion: "wedding",
    note: "끊기지 않는 선 하나로 그린 두 사람. 스무 벌 가운데 가장 조용한 판입니다.",
  },
  {
    id: "engagement-rings",
    name: "두 개의 반지",
    occasion: "wedding",
    note: "들꽃에 둘러싸인 반지 두 개를 수채로. 약혼과 상견례 자리에 씁니다.",
  },
  {
    id: "bridal-shower",
    name: "샴페인 타워",
    occasion: "wedding",
    note: "분홍 거품이 하트가 되어 올라갑니다. 브라이덜 샤워처럼 가벼운 자리에.",
  },

  /* ══════════════════ 돌 · 백일 ══════════════════ */
  {
    id: "dol-baby-tiger",
    name: "한복 입은 아기 호랑이",
    occasion: "baby",
    note: "구름 위에 앉은 호랑이. 아이 사진을 넣지 않아도 카드가 성립합니다.",
  },
  {
    id: "dol-table",
    name: "돌상",
    occasion: "baby",
    note: "무지개떡과 과일을 올린 돌상을 민화풍으로. 한지 결이 그대로 보입니다.",
  },
  {
    id: "baby-shower-moon",
    name: "초승달 위",
    occasion: "baby",
    note: "초승달에 웅크려 잠든 토끼. 스무 벌 가운데 가장 어두운 밤입니다.",
  },

  /* ══════════════════ 생일 ══════════════════ */
  {
    id: "birthday-animals",
    name: "파티 동물들",
    occasion: "birthday",
    note: "고깔을 쓴 고양이와 개와 햄스터가 나팔을 붑니다. 아이 생일에도 어른 생일에도.",
  },
  {
    id: "birthday-cake",
    name: "삼단 케이크",
    occasion: "birthday",
    note: "70년대 인쇄물 색으로 칠한 케이크. 초가 실제로 꽂혀 있습니다.",
  },
  {
    id: "kids-dino",
    name: "풍선 든 공룡",
    occasion: "birthday",
    note: "고깔을 쓴 공룡과 선물 더미. 아이 생일 초대에 가장 많이 고르는 판입니다.",
  },

  /* ══════════════════ 기념일 · 감사 ══════════════════ */
  {
    id: "hwangap-peony",
    name: "모란과 나비",
    occasion: "anniversary",
    note: "한지 위에 그린 모란. 회갑과 칠순처럼 격을 갖춰야 하는 자리에 씁니다.",
  },
  {
    id: "anniversary-carnation",
    name: "카네이션 다발",
    occasion: "anniversary",
    note: "카네이션과 장미를 수채로 묶었습니다. 결혼기념일과 감사의 자리에.",
  },

  /* ══════════════════ 집들이 · 개업 ══════════════════ */
  {
    id: "housewarming",
    name: "불 켜진 집",
    occasion: "housewarming",
    note: "해질녘 창에 불이 들어온 집과 문간의 고양이. 이사 인사에 씁니다.",
  },
  {
    id: "homeparty-wine",
    name: "잔을 부딪치며",
    occasion: "housewarming",
    note: "미드센추리 포스터처럼 오려 붙인 와인과 치즈. 집들이 겸 저녁 자리에.",
  },
  {
    id: "opening-shop",
    name: "문 여는 날",
    occasion: "housewarming",
    note: "차양을 내리고 화분을 내놓은 가게 앞. 개업과 오픈 인사에 씁니다.",
  },

  /* ══════════════════ 파티 · 모임 ══════════════════ */
  {
    id: "garden-party",
    name: "정원의 식탁",
    occasion: "party",
    note: "전구를 늘어뜨린 정원에 차린 상. 낮부터 이어지는 자리에 어울립니다.",
  },
  {
    id: "picnic",
    name: "돗자리",
    occasion: "party",
    note: "위에서 내려다본 소풍 한 장. 격자무늬가 카드를 가득 채웁니다.",
  },

  /* ══════════════════ 연말 · 새해 ══════════════════ */
  {
    id: "christmas-party",
    name: "트리 아래",
    occasion: "season",
    note: "장식을 건드리는 고양이가 있는 트리. 12월 한 달을 위한 카드입니다.",
  },
  {
    id: "yearend-party",
    name: "아르데코의 밤",
    occasion: "season",
    note: "감청 바탕에 금선으로 그은 축배. 송년회처럼 차려입는 자리에.",
  },
  {
    id: "newyear-sunrise",
    name: "해와 파도",
    occasion: "season",
    note: "붉은 해와 학 한 마리. 새해 인사에 쓰는 가장 단정한 판입니다.",
  },
];

/* 씨앗에 그림 이름과 색 세 개를 붙여 완성합니다. 색이 없는 그림이 있으면
   빌드가 아니라 여기서 멈춰야 합니다 — 카드가 흰 종이로 나가는 것보다
   빌드가 죽는 편이 낫습니다. */
export const DESIGNS: Design[] = SEEDS.map((seed) => {
  const colors = (PALETTE as Record<string, { bg: string; ink: string; point: string }>)[seed.id];
  if (!colors) {
    throw new Error(
      `«${seed.id}» 의 색이 lib/occasion/palette.json 에 없습니다 — node scripts/import-artwork.mjs 를 돌리세요`,
    );
  }
  return { ...seed, art: `${seed.id}.webp`, ...colors };
});

const BY_ID = new Map(DESIGNS.map((d) => [d.id, d]));

/** 첫 디자인 — 목록의 견본과 만들기의 기본값으로만 씁니다 */
export const FALLBACK_DESIGN = DESIGNS[0]!;

/**
 * 아는 디자인이면 돌려주고, 모르면 undefined 입니다.
 *
 * 예전에는 모르는 id 를 조용히 첫 디자인으로 바꿔 돌려줬습니다. 그러면
 * 링크가 한 글자 깨졌을 때 «다른 카드» 가 멀쩡한 얼굴로 열립니다. 받는
 * 사람은 그게 자기에게 온 카드인 줄 알고, 만든 사람은 뭐가 잘못됐는지
 * 영영 모릅니다. 모르는 것은 모른다고 해야 합니다.
 */
export function findDesign(id: string | undefined): Design | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function designsOf(occasion: OccasionId): Design[] {
  return DESIGNS.filter((d) => d.occasion === occasion);
}

/** 디자인의 색 세 개를 CSS 변수로 — 카드 안팎이 모두 이 셋만 봅니다. */
export function designVars(d: Design): Record<string, string> {
  return {
    "--oc-bg": d.bg,
    "--oc-ink": d.ink,
    "--oc-point": d.point,
  };
}
