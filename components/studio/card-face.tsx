/**
 * 명함 앞·뒷면 — 읽기 전용.
 *
 * 편집기(card-studio.tsx)가 그리는 것과 같은 클래스·같은 구조입니다. 실제
 * 생김새는 전부 app/studio.css 의 `.card` 규칙이 정하므로, 이 파일이 하는
 * 일은 «어떤 요소를 어느 자리에» 뿐입니다. 자리 계산은 `placeItems` 하나를
 * 편집기와 나눠 씁니다.
 *
 * 편집기의 카드 면을 그대로 떼어 오지 않은 이유는, 그쪽이 편집에 필요한
 * 것들(contentEditable, 선택 상태, 포인터 처리)에 묶여 있기 때문입니다.
 * 홈 목업은 서버에서 그려지는 자리라 함수를 넘길 수 없습니다.
 */

import { asset } from "@/lib/asset";
import { fontStack } from "@/lib/fonts";
import { SHAPE_TYPES, type CardItem, type CardTemplate } from "@/lib/studio/card-templates";

export function CardFace({
  template,
  items,
  side = "front",
  font = "sans",
  /** 배경 그림을 가벼운 판으로 바꿔 넣을 때 씁니다(목록·홈의 작은 그림) */
  artUrl,
  className,
}: {
  template: CardTemplate;
  items: CardItem[];
  side?: "front" | "back";
  font?: string;
  artUrl?: string;
  className?: string;
}) {
  const art = template.art;
  return (
    <article
      className={`card ${className ?? ""}`}
      data-paper={template.paper}
      data-corner={template.corner}
      data-deco={template.deco}
      style={
        {
          "--ac": template.accent,
          "--bg": template.bg,
          "--tx": template.text,
          fontFamily: fontStack(font),
        } as React.CSSProperties
      }
    >
      {side === "front" && (art || template.surface) && (
        <span
          className="card-art"
          style={
            art
              ? {
                  backgroundImage: `url(${asset("/" + (artUrl ?? art.url))})`,
                  backgroundPosition: art.position,
                  backgroundSize: art.size ?? "400% 500%",
                }
              : { background: template.surface }
          }
        />
      )}
      <span className="card-deco" />
      {items
        .filter((item) => item.side === side)
        .map((item) => (
          <div
            key={item.id}
            className={`card-el el-${item.type}`}
            data-align={item.align ?? "left"}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `${item.align === "center" ? "translateX(-50%) " : ""}scale(${
                item.size / 100
              })`,
              color: item.color || undefined,
            }}
          >
            {item.type === "image" && item.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.src} alt="" />
            ) : SHAPE_TYPES.includes(item.type) ? null : (
              item.text
            )}
          </div>
        ))}
    </article>
  );
}
