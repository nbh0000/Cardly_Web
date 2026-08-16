import type { ReactNode } from "react";

/**
 * 접힌 카드.
 *
 * 초대장 커버를 납작한 사각형이 아니라 실제로 접힌 종이 카드로 세웁니다.
 * 뒷장이 왼쪽 접힌 선을 경첩으로 뒤로 젖혀져 있어서 앞장 위로 모서리가
 * 빠져나오고, 손을 대면 앞장이 열리며 안쪽 면이 드러납니다.
 *
 * 앞장(children)은 회전하지 않은 채로 시작합니다 — 갤러리에서 커버의
 * 작은 글자를 읽어야 고를 수 있기 때문입니다. 각도는 뒷장이 만듭니다.
 *
 * hover 는 부모의 `group` 클래스로도 걸립니다. 카드 전체가 링크일 때
 * 링크 어디에 손을 얹어도 같이 열리게 하려는 것입니다.
 */
export function FoldCard({
  children,
  inside,
  className = "",
}: {
  /** 앞장에 그릴 것 — 보통 커버 렌더러 */
  children: ReactNode;
  /** 열었을 때 안쪽 면에 인쇄되는 내용 */
  inside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`fold ${className}`}>
      <div className="fold-stage">
        {/* 그림자는 종이보다 먼저 깔립니다 — 같은 깊이라 그리는 순서가
            곧 위아래입니다. */}
        <span className="fold-cast" aria-hidden />

        <div className="fold-leaf">
          {inside && <div className="fold-inside">{inside}</div>}
        </div>

        <div className="fold-front">
          <div className="fold-face">{children}</div>
          <span className="fold-edge" aria-hidden />
          <span className="fold-spine" aria-hidden />
          <span className="fold-sheen" aria-hidden />
        </div>
      </div>
    </div>
  );
}
