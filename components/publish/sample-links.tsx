import Link from "next/link";
import { occasionSamples, weddingSamples } from "@/lib/samples";

/**
 * 샘플 링크 — 하객이 받는 화면을 그대로 열어 봅니다.
 *
 * 미리보기 화면으로 보내면 «내가 만들 때의 모습» 만 보게 됩니다. 우리가
 * 파는 것은 편집기가 아니라 «보낸 링크» 라서, 그 링크를 실제로 눌러 볼 수
 * 있어야 무엇을 사는지 압니다. 그래서 샘플도 발행된 것과 같은 주소로 열고,
 * 새 탭에서 엽니다 — 만들던 것을 잃지 않도록.
 */
export function SampleLinks({
  kind = "wedding",
  title = "샘플 청첩장 열어보기",
  note = "하객이 받는 화면 그대로입니다. 표지부터 끝까지 내려 보세요.",
}: {
  kind?: "wedding" | "occasion";
  title?: string;
  note?: string;
}) {
  const samples =
    kind === "wedding"
      ? weddingSamples().map((s) => ({
          href: `/w/${s.slug}/`,
          label: s.label,
          note: s.note,
        }))
      : occasionSamples().map((s) => ({
          href: `/i/${s.slug}/`,
          label: s.label,
          note: s.note,
        }));

  return (
    <section className="shell">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="font-serif text-h2 text-ink">{title}</h2>
        <p className="text-caption text-muted">{note}</p>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {samples.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col rounded-lg border border-line bg-white px-5 py-5 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-rose"
            >
              <span className="font-serif text-h3 text-ink">{s.label}</span>
              <span className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                {s.note}
              </span>
              <span className="mt-auto pt-4 text-caption text-rose-deep">
                열어보기
                <span
                  aria-hidden
                  className="ml-1 inline-block transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
