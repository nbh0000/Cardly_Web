"use client";

import type { ReactNode } from "react";
import { FREE_PERIOD } from "@/lib/plan";

export type SectionId =
  | "decor" | "design" | "bgm" | "opening" | "effect" | "groom" | "bride" | "album"
  | "wedding" | "invite" | "account" | "gallery" | "notice" | "snap"
  | "couple" | "timeline" | "video" | "guestbook" | "gift" | "rsvp"
  | "image" | "order";

export interface RailItem {
  id: SectionId;
  label: string;
  icon: ReactNode;
}

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const RAIL: RailItem[] = [
  { id: "decor", label: "꾸미기", icon: <><path d="M4 20c3-1 5-3 7-7l4-4" {...s} /><path d="m14 5 1.6 1.6M18 3l1 1M19 8l1.5 1.5" {...s} /><circle cx="17" cy="7" r="2.6" {...s} /></> },
  { id: "design", label: "디자인", icon: <><circle cx="12" cy="12" r="8.5" {...s} /><path d="M12 3.5c-2 3-3 5.5-3 8.5s1 5.5 3 8.5" {...s} /><circle cx="15.5" cy="9" r="1.4" fill="currentColor" stroke="none" /></> },
  { id: "bgm", label: "배경음악", icon: <><path d="M9 18V6l10-2v12" {...s} /><circle cx="7" cy="18" r="2.4" {...s} /><circle cx="17" cy="16" r="2.4" {...s} /></> },
  { id: "opening", label: "오프닝", icon: <><path d="M4 20c3-1 5-3 7-7l4-4" {...s} /><path d="M15 4.5 16.4 6M19 3l.9.9M18.5 8.5 20 10" {...s} /><circle cx="17.5" cy="6.5" r="2.4" {...s} /></> },
  { id: "effect", label: "화면효과", icon: <><path d="M12 2.5v19M4.2 7.2l15.6 9M4.2 16.8l15.6-9" {...s} /><path d="M12 6 9.6 3.6M12 6l2.4-2.4M12 18l-2.4 2.4M12 18l2.4 2.4" {...s} /><path d="M8 9 4.8 8.1M8 15l-3.2.9M16 9l3.2-.9M16 15l3.2.9" {...s} /></> },
  { id: "groom", label: "신랑 정보", icon: <><path d="M6 9h12l-1 10H7L6 9Z" {...s} /><path d="M9 9V7a3 3 0 0 1 6 0v2" {...s} /><path d="M4 6.5 6 9M20 6.5 18 9" {...s} /></> },
  { id: "bride", label: "신부 정보", icon: <><circle cx="12" cy="5" r="2" {...s} /><path d="M12 7v3M8 20c0-5 2-8 4-10 2 2 4 5 4 10H8Z" {...s} /></> },
  { id: "album", label: "미니앨범", icon: <><rect x="4" y="4" width="7" height="16" rx="1.5" {...s} /><rect x="13" y="4" width="7" height="16" rx="1.5" {...s} /></> },
  { id: "wedding", label: "예식 정보", icon: <><rect x="3.5" y="5.5" width="17" height="15" rx="2.5" {...s} /><path d="M8 3v4M16 3v4M3.5 10h17" {...s} /><circle cx="12" cy="15" r="2" fill="currentColor" stroke="none" /></> },
  { id: "invite", label: "초대 글", icon: <><rect x="4.5" y="3.5" width="15" height="17" rx="2.5" {...s} /><path d="M8 8h8M8 12h8M8 16h4" {...s} /></> },
  { id: "account", label: "계좌 정보", icon: <><rect x="3" y="6.5" width="18" height="12" rx="2.5" {...s} /><path d="M3 10.5h18M7 15h4" {...s} /></> },
  { id: "gallery", label: "갤러리", icon: <><rect x="3.5" y="5" width="17" height="14" rx="2.5" {...s} /><circle cx="9" cy="10" r="1.6" {...s} /><path d="m4.5 17 5-4.5 4 3.5 3-2.5 4 3.5" {...s} /></> },
  { id: "notice", label: "안내사항", icon: <><path d="M4 9v6h3l6 4V5L7 9H4Z" {...s} /><path d="M17.5 9.5a4 4 0 0 1 0 5" {...s} /></> },
  { id: "snap", label: "하객스냅", icon: <><rect x="3" y="7" width="18" height="13" rx="2.5" {...s} /><path d="M9 7 10.5 4.5h3L15 7" {...s} /><circle cx="12" cy="13.5" r="3.4" {...s} /></> },
  { id: "couple", label: "커플프로필", icon: <><circle cx="9" cy="12" r="4.2" {...s} /><circle cx="15" cy="12" r="4.2" {...s} /><path d="M9 6.5 10 4.5h4l1 2" {...s} /></> },
  { id: "timeline", label: "타임라인", icon: <><path d="M12 3v18" {...s} /><circle cx="12" cy="7" r="2.2" {...s} /><circle cx="12" cy="16" r="2.2" {...s} /><path d="M14.2 7H19M5 16h4.8" {...s} /></> },
  { id: "video", label: "비디오", icon: <><circle cx="12" cy="12" r="8.5" {...s} /><path d="m10 8.5 6 3.5-6 3.5v-7Z" {...s} /></> },
  { id: "guestbook", label: "방명록", icon: <><rect x="4.5" y="3.5" width="15" height="17" rx="2.5" {...s} /><path d="M8 8h8M8 12h8M8 16h5" {...s} /></> },
  { id: "gift", label: "선물하기", icon: <><rect x="3.5" y="9" width="17" height="11" rx="2" {...s} /><path d="M3.5 9V7.5a1.5 1.5 0 0 1 1.5-1.5h14a1.5 1.5 0 0 1 1.5 1.5V9M12 6v14" {...s} /><path d="M12 6c-1.5-3-5-2.5-4.5 0 .3 1.5 2.8 1 4.5 0Zm0 0c1.5-3 5-2.5 4.5 0-.3 1.5-2.8 1-4.5 0Z" {...s} /></> },
  { id: "rsvp", label: "참석여부", icon: <><path d="M3.5 7.5 12 13l8.5-5.5" {...s} /><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" {...s} /></> },
  { id: "image", label: "이미지", icon: <><rect x="3.5" y="5" width="17" height="14" rx="2.5" {...s} /><path d="m4.5 17 5-4.5 4 3.5 3-2.5 4 3.5" {...s} /><circle cx="9" cy="10" r="1.4" fill="currentColor" stroke="none" /></> },
  { id: "order", label: "순서 변경", icon: <><rect x="3.5" y="3.5" width="11" height="11" rx="2" {...s} /><rect x="9.5" y="9.5" width="11" height="11" rx="2" {...s} /></> },
];

/**
 * 프리미엄에서 열리는 항목.
 * 어떤 기능이 유료인지는 lib/plan.ts 가 기준이고, 여기서는 그 목록을
 * 레일 항목 이름으로 옮겨 놓은 것뿐입니다.
 *
 * 무료 기간에는 목록이 비어 있어 점 표시가 하나도 붙지 않습니다. 전부
 * 열려 있는데 «유료» 점이 찍혀 있으면 눌러 보기 전에 지레 포기합니다.
 */
const PREMIUM_RAIL: SectionId[] = FREE_PERIOD ? [] : [
  "rsvp",
  "guestbook",
  "snap",
  "album",
  "timeline",
  "couple",
  "video",
  "opening",
  "effect",
  "bgm",
];

export function Rail({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <nav
      aria-label="편집 항목"
      className="flex shrink-0 gap-1 overflow-x-auto border-line bg-ivory px-2 py-2 [scrollbar-width:none] lg:h-full lg:w-[4.75rem] lg:flex-col lg:gap-0.5 lg:overflow-x-visible lg:overflow-y-auto lg:border-r lg:px-1.5 lg:py-3 [&::-webkit-scrollbar]:hidden"
    >
      {RAIL.map((item) => {
        const on = item.id === active;
        const premium = PREMIUM_RAIL.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={on ? "page" : undefined}
            aria-label={premium ? `${item.label} (프리미엄)` : undefined}
            className={`press group flex shrink-0 flex-col items-center gap-1 rounded-md px-1.5 py-2 lg:w-full ${
              on ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <span
              className={`relative grid h-8 w-8 place-items-center rounded-lg transition-colors duration-200 ${
                on ? "bg-ink text-ivory" : "bg-transparent group-hover:bg-sand"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" aria-hidden>
                {item.icon}
              </svg>
              {PREMIUM_RAIL.includes(item.id) && (
                <span
                  aria-hidden
                  title="프리미엄 기능"
                  className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-deep ring-2 ring-ivory"
                />
              )}
            </span>
            <span className="text-[0.625rem] leading-tight whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
