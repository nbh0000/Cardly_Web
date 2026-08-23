import type { Metadata } from "next";
import { PublicView, type SeedDoc } from "@/components/publish/public-view";
import {
  createDefaultData,
  formatDateKo,
  formatTimeKo,
  fullName,
  type InvitationData,
} from "@/lib/invitation";
import { findPublished, publishedOf } from "@/lib/published-index";
import { findWeddingSample, weddingSamples } from "@/lib/samples";

/**
 * 발행된 모바일 청첩장 — cardly.kr/w/<주소>
 *
 * 이 파일이 만드는 HTML 은 «껍데기와 <meta>» 입니다. 내용은 브라우저가
 * 열 때마다 받아 옵니다(components/publish/public-view). 그래야 발행 뒤
 * 고친 것이 바로 반영되고, 기한이 지나면 그 자리에서 닫힙니다.
 *
 * <meta> 만은 미리 구워야 합니다 — 카카오톡 크롤러는 자바스크립트를
 * 돌리지 않기 때문입니다. 그래서 빌드 때 발행 목록을 한 번 읽어
 * 청첩장마다 HTML 을 하나씩 만들어 둡니다.
 *
 * 방금 발행해서 아직 HTML 이 없는 주소는 404 페이지가 받아 같은 화면을
 * 그립니다(app/not-found.tsx). 링크는 그 즉시 열리고, 미리보기만
 * 다음 배포(발행 직후 자동으로 걸립니다) 뒤에 붙습니다.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const published = await publishedOf("wedding");
  return [
    ...weddingSamples().map((s) => ({ slug: s.slug })),
    ...published.map((r) => ({ slug: r.slug })),
  ];
}

function ogImage(data: Partial<InvitationData>): string | undefined {
  const src = data.shareImage ?? data.coverPhoto;
  if (!src) return undefined;
  // 저장소에 올라간 사진은 절대 주소입니다. 내장 샘플 사진은 basePath 를
  // 살리기 위해 앞 슬래시를 떼어 상대 경로로 넘깁니다.
  return src.startsWith("http") ? src : src.replace(/^\//, "");
}

async function load(slug: string): Promise<{ data: InvitationData; title: string } | null> {
  const sample = findWeddingSample(slug);
  if (sample) return { data: sample.data, title: sample.label };

  const row = await findPublished(slug);
  if (!row || row.kind !== "wedding") return null;
  return {
    data: { ...createDefaultData(row.design_id), ...(row.data as Partial<InvitationData>) },
    title: row.title,
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/w/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await load(slug);
  if (!found) return { title: "청첩장", robots: { index: false, follow: false } };

  const { data } = found;
  const groom = fullName(data.groom);
  const bride = fullName(data.bride);
  const title = data.shareTitle || `${groom} ♥ ${bride} 결혼합니다`;
  // 미리보기 설명은 한 줄이어야 합니다. 줄바꿈이 들어가면 메타 태그가
  // 통째로 빠져 카카오톡에서 설명이 사라집니다.
  const description = (
    data.shareDescription ||
    `${formatDateKo(data.date)} ${formatTimeKo(data.time)} · ${data.venueName}`
  )
    .replace(/\s*\n+\s*/g, " · ")
    .trim();

  const image = ogImage(data);

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "ko_KR",
      title,
      description,
      ...(image ? { images: [{ url: image, width: 800, height: 1000 }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    // 남의 청첩장이 검색에 걸릴 이유가 없습니다.
    robots: { index: false, follow: false },
  };
}

export default async function PublishedWedding({ params }: PageProps<"/w/[slug]">) {
  const { slug } = await params;
  const sample = findWeddingSample(slug);

  const seed: SeedDoc | undefined = sample
    ? {
        kind: "wedding",
        designId: sample.templateId,
        // 샘플은 «다 켜 놓은 판» 을 보여 줍니다. 참석 여부·방명록이 어떻게
        // 생겼는지 보이지 않으면 무엇을 사는지 알 수 없습니다.
        plan: "premium",
        data: sample.data,
        demo: true,
      }
    : undefined;

  return <PublicView kind="wedding" slug={slug} seed={seed} />;
}
