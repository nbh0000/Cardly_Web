import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Cormorant_Garamond,
  Noto_Sans_KR,
  Noto_Serif_KR,
  Parisienne,
  Playfair_Display,
} from "next/font/google";
import Script from "next/script";
import { TEMPLATES } from "@/lib/invitation";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: false,
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: false,
});

/* 커버 장식용 라틴 폰트 3종.
   한글은 Noto 가 맡고, 아래 글꼴은 영문 문구·큰 숫자에만 씁니다. */

/** 큰 제목용 디스플레이 세리프 — "WEDDING" 같은 대문자 조판 */
const playfair = Playfair_Display({
  variable: "--ff-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

/** 캘리그래피 — "We are getting Married" */
const parisienne = Parisienne({
  variable: "--ff-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

/** 손글씨 마커 — "Save the date!" 같은 스티커 문구 */
const caveat = Caveat({
  variable: "--ff-hand",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

/** 얇은 세리프 — 날짜·영문 이름의 가는 조판 */
const cormorant = Cormorant_Garamond({
  variable: "--ff-thin-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const DESCRIPTION = `이력서와 명함은 무료로, 모바일 청첩장은 ${TEMPLATES.length}종 템플릿으로. 회원가입 없이 브라우저에서 바로 만들고 PDF·PNG로 저장하세요.`;

export const metadata: Metadata = {
  // 운영 도메인. 상대 경로로 적은 canonical·OG 주소가 모두 이 값을 기준으로 절대화됩니다.
  metadataBase: new URL("https://cardly.kr"),
  title: {
    default: "Cardly — 무료 이력서·명함 제작과 모바일 청첩장",
    template: "%s | Cardly",
  },
  description: DESCRIPTION,
  applicationName: "Cardly",
  keywords: [
    "이력서 양식",
    "무료 이력서",
    "명함 만들기",
    "명함 템플릿",
    "모바일청첩장",
    "청첩장 제작",
    "무료 디자인 도구",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    // 네이버 서치어드바이저에 등록된 소유확인 토큰 (cardly.kr)
    other: {
      "naver-site-verification": [
        "da5859227b656d21349aeddc0596b4a8fc0ed51d",
        "b4bb26ab0352b04a9bf6de04d74bfde792625e4b",
      ],
    },
  },
  other: {
    // 애드센스 계정 확인용 — 광고 스크립트와 짝을 이룹니다.
    "google-adsense-account": "ca-pub-8336109969969326",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "Cardly",
    title: "Cardly — 무료 이력서·명함 제작과 모바일 청첩장",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cardly — 무료 이력서·명함 제작과 모바일 청첩장",
    description: DESCRIPTION,
  },
};

/** 사이트 전체를 설명하는 구조화 데이터 — 검색 결과의 사이트명·도구 목록에 쓰입니다. */
const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://cardly.kr/#website",
      url: "https://cardly.kr/",
      name: "Cardly",
      alternateName: "카들리",
      inLanguage: "ko-KR",
      description: DESCRIPTION,
      publisher: { "@id": "https://cardly.kr/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://cardly.kr/#organization",
      name: "Cardly",
      url: "https://cardly.kr/",
    },
    {
      "@type": "ItemList",
      name: "Cardly 제작 도구",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "무료 이력서 만들기",
          url: "https://cardly.kr/resume/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "무료 명함 만들기",
          url: "https://cardly.kr/business-card/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "모바일 청첩장 만들기",
          url: "https://cardly.kr/templates/",
        },
      ],
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#fdfbf7",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${notoSansKr.variable} ${playfair.variable} ${parisienne.variable} ${caveat.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-rose-deep focus:px-5 focus:py-3 focus:text-sm focus:text-white"
        >
          본문 바로가기
        </a>
        {children}
        <script
          type="application/ld+json"
          // 저장소 안의 상수만 직렬화하므로 외부 입력이 섞이지 않습니다.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
        {/* Google AdSense — 첫 렌더를 막지 않도록 상호작용 이후에 불러옵니다. */}
        <Script
          id="adsbygoogle"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8336109969969326"
        />
      </body>
    </html>
  );
}
