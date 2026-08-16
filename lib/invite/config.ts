/* ============================================================
   ★ 내 초대장 설정 — 개발을 몰라도 여기만 고치면 됩니다 ★

   이 파일 하나가 /invitation-card/my 주소의 초대장을 만듭니다.
   따옴표 " " 안의 글자만 바꾸면 되고, 쉼표와 중괄호는 건드리지
   마세요. 저장하면 바로 반영됩니다.

   ------------------------------------------------------------
   1. 색을 바꾸려면
      theme 값을 아래 여섯 중 하나로 적습니다.
        "ivory"  아이보리 — 따뜻한 종이빛 (기본)
        "sage"   세이지  — 마른 풀빛
        "blush"  블러시  — 물 빠진 장미
        "sky"    스카이  — 흐린 하늘빛
        "ink"    잉크    — 짙은 남색과 금
        "mocha"  모카    — 구운 흙빛

   2. 사진을 바꾸려면
      public 폴더 안에 사진을 넣고, 그 경로를 "/사진이름.jpg" 처럼
      적습니다. 예를 들어 public/photos/main.jpg 에 넣었다면
      "/photos/main.jpg" 라고 씁니다.

   3. 칸을 켜고 끄려면
      맨 아래 sections 목록에서 필요 없는 줄을 지웁니다.
      순서를 바꾸면 초대장에서도 그 순서로 나옵니다.
        "greeting"  초대 글
        "detail"    일시 · 장소
        "countdown" 남은 날짜와 달력
        "gallery"   사진
        "location"  오시는 길
        "contact"   연락하기
        "rsvp"      참석 회신
        "account"   마음 전하실 곳
        "notice"    안내사항

   4. 줄을 바꾸려면
      글 안에서 \n 을 넣으면 한 줄 내려가고, \n\n 은 한 칸 띕니다.
   ------------------------------------------------------------ */

import type { InviteConfig } from "@/lib/invite/types";

export const MY_INVITE: InviteConfig = {
  /* ── 색과 공유 미리보기 ── */
  theme: "ivory",
  shareTitle: "김도윤 · 이서연 결혼합니다",
  shareDescription: "2026년 10월 17일 토요일 오후 1시 · 그랜드하얏트 서울",

  /* ── 표지 ── */
  cover: {
    eyebrow: "WE ARE GETTING MARRIED",
    title: "김도윤\n이서연",
    subtitle: "2026. 10. 17 SAT 1PM",
    image: "/samples/couple-08.jpg",
    /* 사진이 밝아 글자가 안 읽히면 숫자를 올리세요 (0~80) */
    dim: 34,
  },

  /* ── 언제, 어디서 ── */
  event: {
    date: "2026-10-17", // 연-월-일
    time: "13:00", // 24시간 표기
    place: "그랜드하얏트 서울",
    hall: "그랜드볼룸 3층",
    address: "서울 용산구 소월로 322",
    transports: [
      {
        kind: "지하철",
        body: "6호선 녹사평역 2번 출구에서 셔틀버스가 20분 간격으로 운행합니다.",
      },
      {
        kind: "주차",
        body: "호텔 주차장 3시간 무료입니다. 안내데스크에서 확인받으세요.",
      },
    ],
  },

  /* ── 초대 글 ── */
  greeting: {
    lead: "서로를 향해 걸어온 길이\n이제 한 방향이 되었습니다",
    title: "초대합니다",
    body:
      "오래 곁을 지켜 준 두 사람이\n이제 한 가정을 이루려 합니다.\n\n" +
      "귀한 걸음으로 오셔서\n저희의 첫날을 함께해 주시면\n큰 기쁨이 되겠습니다.",
    sign: "김도윤 · 이서연 올림",
  },

  /* ── 사진 ── */
  gallery: [
    "/samples/couple-01.jpg",
    "/samples/couple-02.jpg",
    "/samples/couple-04.jpg",
    "/samples/couple-05.jpg",
    "/samples/couple-06.jpg",
    "/samples/couple-07.jpg",
  ],

  /* ── 연락하기 ── */
  contacts: [
    { role: "신랑", name: "김도윤", phone: "010-1234-5678" },
    { role: "신부", name: "이서연", phone: "010-2345-6789" },
    { role: "신랑 아버지", name: "김성호", phone: "010-3456-7890" },
    { role: "신부 어머니", name: "박정은", phone: "010-4567-8901" },
  ],

  /* ── 참석 회신 ──
     to 에 전화번호를 적으면 «전화로 알리기», 메일 주소를 적으면
     «메일로 회신하기» 버튼이 됩니다. 비워 두면 이 칸이 사라집니다. */
  rsvp: {
    title: "참석 여부를 알려 주세요",
    body: "식사 준비를 위해 참석 여부를 미리 알려 주시면 감사하겠습니다.",
    to: "010-1234-5678",
    deadline: "2026년 10월 5일까지",
  },

  /* ── 마음 전하실 곳 ──
     필요 없으면 대괄호 안을 비우세요: accounts: [], */
  accounts: [
    { group: "신랑측", bank: "국민은행", number: "123456-01-234567", holder: "김도윤" },
    { group: "신랑측", bank: "신한은행", number: "110-234-567890", holder: "김성호" },
    { group: "신부측", bank: "하나은행", number: "234-567890-12345", holder: "이서연" },
  ],

  /* ── 안내사항 ── */
  notices: [
    { title: "화환", body: "마음만 감사히 받겠습니다. 화환은 정중히 사양합니다." },
    { title: "포토부스", body: "1층 로비에 포토부스가 있습니다. 오셔서 한 장 남겨 주세요." },
  ],

  /* ── 어떤 칸을, 어떤 순서로 ── */
  sections: [
    "greeting",
    "detail",
    "countdown",
    "gallery",
    "location",
    "contact",
    "rsvp",
    "account",
    "notice",
  ],

  /* ── 맨 아래 한 줄 ── */
  closing: "저희의 시작을 함께해 주셔서 고맙습니다.",
};
