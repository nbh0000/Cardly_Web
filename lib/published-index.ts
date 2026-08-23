/**
 * 빌드가 읽는 «지금 발행되어 있는 것들».
 *
 * 카카오톡·문자의 링크 미리보기는 크롤러가 만듭니다. 크롤러는 자바스크립트를
 * 돌리지 않으므로, 청첩장마다 다른 제목과 사진이 뜨려면 그 주소의 HTML 이
 * <meta> 를 이미 달고 있어야 합니다. 정적 배포에서 그 HTML 을 만들 수 있는
 * 시점은 빌드뿐이고, 그래서 빌드가 데이터베이스를 한 번 훑습니다.
 *
 * 이 조회는 service_role 키로만 됩니다. anon 키에게 «발행된 것 전부» 를
 * 열어 주면 링크를 모르는 사람이 목록을 훑을 수 있게 되어, 링크를 아는
 * 사람만 본다는 약속이 깨집니다. 그래서 이 파일은 서버(빌드)에서만
 * 쓰이며, 키 이름에 NEXT_PUBLIC_ 이 붙어 있지 않습니다.
 *
 * 키가 없으면 빈 목록을 돌려줍니다. 그때도 사이트는 그대로 서고, 발행된
 * 링크는 브라우저가 내용을 받아 그립니다 — 미리보기만 기본값이 됩니다.
 */

export interface PublishedRow {
  slug: string;
  kind: "wedding" | "occasion";
  design_id: string;
  title: string;
  data: Record<string, unknown>;
  plan: "free" | "premium";
  event_date: string | null;
}

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

let cache: Promise<PublishedRow[]> | null = null;

export function publishedIndex(): Promise<PublishedRow[]> {
  cache ??= load();
  return cache;
}

async function load(): Promise<PublishedRow[]> {
  if (!URL_BASE || !SERVICE_KEY) return [];
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/rpc/published_index`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[cardly] 발행 목록을 읽지 못했습니다: ${res.status}`);
      return [];
    }
    const rows = (await res.json()) as PublishedRow[] | null;
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    // 빌드가 데이터베이스 때문에 멈추면 안 됩니다. 미리보기만 포기합니다.
    console.warn("[cardly] 발행 목록을 읽지 못했습니다:", e);
    return [];
  }
}

export async function publishedOf(kind: "wedding" | "occasion"): Promise<PublishedRow[]> {
  return (await publishedIndex()).filter((r) => r.kind === kind);
}

export async function findPublished(slug: string): Promise<PublishedRow | undefined> {
  return (await publishedIndex()).find((r) => r.slug === slug);
}
