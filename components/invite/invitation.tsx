import {
  Accounts,
  Closing,
  Contact,
  Countdown,
  Cover,
  Detail,
  Gallery,
  Greeting,
  Location,
  Notices,
  Rsvp,
} from "@/components/invite/sections";
import { getTheme, themeVars } from "@/lib/invite/themes";
import type { InviteConfig, SectionId } from "@/lib/invite/types";
import { fontStack } from "@/lib/fonts";

/* ============================================================
   초대장 한 장

   설정을 받아 칸을 순서대로 쌓습니다. 순서도 설정이 정하므로
   (config.sections), 행사에 따라 «참석 회신»을 위로 올리는 것 같은
   일이 코드를 고치지 않고 됩니다.

   테마는 CSS 변수로 뿌리에 붙습니다. 클래스를 갈아 끼우지 않으니
   테마를 새로 만들어도 스타일시트는 그대로입니다.
   ============================================================ */

const SECTIONS: Record<SectionId, (p: { c: InviteConfig }) => React.ReactNode> = {
  greeting: Greeting,
  detail: Detail,
  countdown: Countdown,
  gallery: Gallery,
  location: Location,
  contact: Contact,
  rsvp: Rsvp,
  account: Accounts,
  notice: Notices,
};

export function Invitation({ config }: { config: InviteConfig }) {
  const theme = getTheme(config.theme);
  return (
    <article
      className="wi"
      style={{
        ...themeVars(theme),
        "--wi-heading": fontStack(theme.headingFont),
        "--wi-body": fontStack(theme.bodyFont),
      } as React.CSSProperties}
    >
      <Cover c={config} />
      {config.sections.map((id) => {
        const S = SECTIONS[id];
        return S ? <S key={id} c={config} /> : null;
      })}
      <Closing c={config} />
    </article>
  );
}
