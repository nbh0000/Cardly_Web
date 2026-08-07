import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
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

export const metadata: Metadata = {
  // GitHub Pages 배포 주소. 커스텀 도메인을 붙이면 여기만 바꾸면 됩니다.
  metadataBase: new URL("https://nbh0000.github.io/wedding-web/"),
  title: {
    default: "다온 · 모바일 청첩장 — 두 사람의 이야기를 가장 아름답게",
    template: "%s | 다온",
  },
  description:
    "감성적인 모바일 청첩장을 5분 만에. 60여 종의 디자인 템플릿, 실시간 참석 응답, 마음 전하는 곳, 카카오톡 공유 최적화까지 한 번에.",
  keywords: [
    "모바일청첩장",
    "청첩장",
    "웨딩",
    "결혼식",
    "모바일초대장",
    "청첩장제작",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "다온",
    title: "다온 · 모바일 청첩장",
    description:
      "감성적인 모바일 청첩장을 5분 만에. 60여 종의 디자인 템플릿과 하객 응답 기능.",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfbf7",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-rose-deep focus:px-5 focus:py-3 focus:text-sm focus:text-white"
        >
          본문 바로가기
        </a>
        {children}
      </body>
    </html>
  );
}
