import { mapHref, smsHref, telHref } from "@/lib/occasion/format";
import type { InviteData } from "@/lib/occasion/types";

/* 카드 밖 보조 영역 — 길찾기 · 전화 · 참석 회신.

   개편 전에는 이 단추들이 카드 속면 안에 있었습니다. 카드 안에 단추가
   있으면 «읽는 면» 과 «누르는 면» 이 섞여서, 종이로 읽히던 것이 갑자기
   앱 화면이 됩니다. 실제 청첩장에도 안내 쪽지는 카드에 인쇄되지 않고
   따로 끼워 옵니다.

   빈 값이면 그 단추는 아예 나오지 않습니다. «준비 중» 같은 회색 단추를
   두면 누를 수 있는 것처럼 보였다가 실망시킵니다. */

export function CardActions({ data }: { data: InviteData }) {
  const mapQuery = data.address || data.place;
  const hasAny = mapQuery || data.phone;
  if (!hasAny) return null;

  return (
    <div className="oc-actions">
      {mapQuery && (
        <a
          className="oc-act oc-act-solid"
          href={mapHref(mapQuery)}
          target="_blank"
          rel="noreferrer"
        >
          길 찾기
        </a>
      )}
      {data.phone && (
        <a className="oc-act" href={telHref(data.phone)}>
          전화하기
        </a>
      )}
      {data.rsvp && data.phone && (
        <a
          className="oc-act"
          href={smsHref(
            data.phone,
            `${data.title.replace(/\n/g, " ")} — 참석하겠습니다.`,
          )}
        >
          참석 알리기
        </a>
      )}
    </div>
  );
}
