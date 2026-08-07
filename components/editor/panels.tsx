"use client";

import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  ChipGroup,
  ColorPicker,
  Field,
  ImageUpload,
  MultiImageUpload,
  Repeater,
  RowActions,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/editor/controls";
import type { SectionId } from "@/components/editor/rail";
import {
  BGM_TRACKS,
  COVER_LAYOUTS,
  DATE_FORMATS,
  DAUGHTER_RELATIONS,
  EFFECTS,
  FONT_OPTIONS,
  FONT_SCALES,
  GALLERY_TYPES,
  GREETING_SAMPLES,
  OPENING_ANIMATIONS,
  SECTION_LABELS,
  SON_RELATIONS,
  TEMPLATES,
  formatDateShort,
  getTemplate,
  type Account,
  type Contact,
  type InvitationData,
  type NoticeItem,
  type Person,
  type SectionKey,
  type TimelineItem,
  type TransportItem,
} from "@/lib/invitation";

export type Set = <K extends keyof InvitationData>(
  k: K,
  v: InvitationData[K],
) => void;

interface Props {
  data: InvitationData;
  set: Set;
  setData: Dispatch<SetStateAction<InvitationData>>;
  /** "위치 바꾸기" 클릭 시 순서 변경 패널로 이동 */
  onGoOrder: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

/* ============================================================
   레이아웃 조각
   ============================================================ */

export function PanelHead({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <header className="border-b border-line pb-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-[1.35rem] text-ink">{title}</h2>
        {action}
      </div>
      {desc && <p className="mt-2 text-caption text-muted">{desc}</p>}
    </header>
  );
}

function Card({
  title,
  desc,
  children,
}: {
  title?: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-line">
      {title && (
        <div className="border-b border-line-soft pb-3">
          <p className="text-[0.8125rem] font-medium text-ink">{title}</p>
          {desc && <p className="mt-1 text-[0.6875rem] text-muted">{desc}</p>}
        </div>
      )}
      <div className={`grid gap-3.5 ${title ? "pt-3.5" : ""}`}>{children}</div>
    </div>
  );
}

function ToggleCard(p: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-lg bg-white px-4 py-3.5 ring-1 ring-line">
      <Toggle {...p} />
    </div>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <div className="grid gap-3.5 pt-5">{children}</div>;
}

/**
 * 이 섹션이 청첩장에서 몇 번째에 놓이는지 보여줍니다.
 * 토글을 켜는 순간 활성 목록에 들어가므로 위치가 바로 나타납니다.
 */
function SectionPosition({
  data,
  section,
  onGoOrder,
}: {
  data: InvitationData;
  section: SectionKey;
  onGoOrder?: () => void;
}) {
  const active = data.sectionOrder.filter((k) => isSectionActive(k, data));
  const idx = active.indexOf(section);

  if (idx < 0) {
    return (
      <p className="rounded-lg bg-sand/60 px-4 py-3 text-[0.6875rem] text-muted">
        켜면 청첩장에 <strong className="font-medium text-ink-soft">{SECTION_LABELS[section]}</strong> 섹션이 추가되고, 순서 목록에도 나타납니다.
      </p>
    );
  }

  return (
    <p className="flex items-center justify-between gap-3 rounded-lg bg-rose-veil px-4 py-3 text-[0.6875rem] text-ink-soft">
      <span>
        청첩장에서{" "}
        <strong className="font-medium text-rose-deep">{idx + 1}번째</strong>
        <span className="text-muted"> / 전체 {active.length}개 섹션</span>
      </span>
      {onGoOrder && (
        <button
          type="button"
          onClick={onGoOrder}
          className="press shrink-0 rounded-full bg-white px-2.5 py-1 text-[0.625rem] text-ink ring-1 ring-line"
        >
          위치 바꾸기
        </button>
      )}
    </p>
  );
}

/* ============================================================
   패널 라우터
   ============================================================ */

export function SectionPanel({
  section,
  ...p
}: Props & { section: SectionId }) {
  switch (section) {
    case "decor": return <Decor {...p} />;
    case "design": return <Design {...p} />;
    case "bgm": return <Bgm {...p} />;
    case "opening": return <Opening {...p} />;
    case "groom": return <PersonPanel {...p} side="groom" />;
    case "bride": return <PersonPanel {...p} side="bride" />;
    case "album": return <Album {...p} />;
    case "wedding": return <Wedding {...p} />;
    case "invite": return <Invite {...p} />;
    case "account": return <Accounts {...p} />;
    case "gallery": return <Gallery {...p} />;
    case "notice": return <Notice {...p} />;
    case "snap": return <Snap {...p} />;
    case "couple": return <Couple {...p} />;
    case "timeline": return <Timeline {...p} />;
    case "video": return <Video {...p} />;
    case "guestbook": return <Guestbook {...p} />;
    case "gift": return <Gift {...p} />;
    case "rsvp": return <Rsvp {...p} />;
    case "image": return <ImagesPanel {...p} />;
    case "order": return <Order {...p} />;
  }
}

/* ---------------- 꾸미기 ---------------- */

function Decor({ data, set }: Props) {
  return (
    <>
      <PanelHead title="메인 꾸미기" desc="청첩장의 메인 이미지와 공유 시 보여질 이미지를 설정합니다." />
      <Group>
        <Field label="청첩장 제목" hint="제목은 카카오·링크 공유 시 제목으로 노출됩니다.">
          <TextInput value={data.cardTitle} onChange={(v) => set("cardTitle", v)} placeholder="청첩장 제목을 입력하세요" />
        </Field>
        <Card title="대표 이미지 등록" desc="1024×1024픽셀 이상, 4MB 이하의 사진이 권장됩니다.">
          <ImageUpload label="대표 이미지" value={data.coverPhoto} onChange={(v) => set("coverPhoto", v)} />
          <ChipGroup
            label="사진 채우기"
            options={[{ id: "cover" as const, label: "꽉 채우기" }, { id: "contain" as const, label: "전체 보이기" }]}
            value={data.coverPhotoFit}
            onChange={(v) => set("coverPhotoFit", v)}
          />
        </Card>
        <Card title="카카오 공유 이미지 등록">
          <ImageUpload label="공유 이미지" value={data.shareImage} onChange={(v) => set("shareImage", v)} />
          <Field label="공유 제목">
            <TextInput value={data.shareTitle} onChange={(v) => set("shareTitle", v)} placeholder="김도윤 ♥ 이서연 결혼합니다" />
          </Field>
          <Field label="공유 설명">
            <TextArea value={data.shareDescription} onChange={(v) => set("shareDescription", v)} rows={3} />
          </Field>
        </Card>
        <Field label="상단 문구">
          <TextInput value={data.coverEyebrow} onChange={(v) => set("coverEyebrow", v)} />
        </Field>
        <ChipGroup label="커버 레이아웃" options={COVER_LAYOUTS} value={data.coverLayout} onChange={(v) => set("coverLayout", v)} />
      </Group>
    </>
  );
}

/* ---------------- 디자인 ---------------- */

function Design({ data, set, setData }: Props) {
  const base = getTemplate(data.templateId)?.theme.accent ?? "#B08D80";
  return (
    <>
      <PanelHead title="디자인 선택" desc="청첩장의 전체적인 디자인과 분위기를 설정합니다." />
      <Group>
        <Card title="테마 컬러" desc="템플릿의 포인트 컬러와 투명도를 조정합니다.">
          <ColorPicker value={data.accentOverride ?? base} onChange={(v) => set("accentOverride", v)} onReset={() => set("accentOverride", undefined)} />
          <label className="grid gap-2">
            <span className="flex items-center justify-between text-[0.75rem] text-ink-soft">
              타이틀 이미지 어둡기 <span className="text-muted">{data.titleDim}%</span>
            </span>
            <input
              type="range" min={0} max={80} value={data.titleDim}
              onChange={(e) => set("titleDim", Number(e.target.value))}
              className="w-full accent-rose-deep"
            />
          </label>
        </Card>

        <div className="grid gap-1.5">
          <span className="text-[0.75rem] text-ink-soft">디자인 테마</span>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id} type="button"
                onClick={() => setData((d) => ({ ...d, templateId: t.id, coverLayout: t.coverLayout, headingFont: t.headingFont, accentOverride: undefined }))}
                aria-pressed={t.id === data.templateId}
                className={`press relative aspect-[3/4] overflow-hidden rounded-md ring-offset-2 ring-offset-cream transition-shadow ${t.id === data.templateId ? "ring-2 ring-ink" : "ring-1 ring-line"}`}
                style={{ background: t.theme.bg }}
              >
                {t.badge && (
                  <span className="absolute top-1.5 left-1.5 rounded bg-ink px-1.5 py-0.5 text-[0.5rem] tracking-wide text-ivory">
                    {t.badge}
                  </span>
                )}
                <span className="flex h-full flex-col items-center justify-center gap-1.5 p-2">
                  <span className="h-10 w-7 rounded-t-full" style={{ background: t.theme.sub }} />
                  <span className="h-px w-6" style={{ background: t.theme.accent }} />
                  <span className="font-serif text-[0.5rem]" style={{ color: t.theme.ink }}>{t.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <ChipGroup label="글꼴" options={FONT_OPTIONS.map((f) => ({ id: f.id, label: f.label }))} value={data.headingFont} onChange={(v) => set("headingFont", v)} />
        <ChipGroup label="글자 크기" options={FONT_SCALES.map((f) => ({ id: f.id, label: f.label }))} value={data.fontScale} onChange={(v) => set("fontScale", v)} />
        <ChipGroup label="화면 효과" options={EFFECTS} value={data.effect} onChange={(v) => set("effect", v)} />
      </Group>
    </>
  );
}

/* ---------------- 배경음악 ---------------- */

function Bgm({ data, set }: Props) {
  return (
    <>
      <PanelHead title="배경음악" desc="청첩장을 열 때 재생될 음악을 선택하세요." />
      <Group>
        <div className="grid gap-1.5">
          {BGM_TRACKS.map((t) => (
            <button
              key={t.id} type="button" onClick={() => set("bgm", t.id)}
              aria-pressed={t.id === data.bgm}
              className={`press flex items-center justify-between rounded-lg px-4 py-3.5 text-left text-[0.8125rem] ring-1 transition-colors ${t.id === data.bgm ? "bg-ink text-ivory ring-ink" : "bg-white text-ink ring-line hover:ring-rose"}`}
            >
              {t.label}
              {t.id === data.bgm && <span aria-hidden>♪</span>}
            </button>
          ))}
        </div>
        {data.bgm !== "none" && (
          <ToggleCard label="자동 재생" desc="브라우저 정책에 따라 차단될 수 있습니다." checked={data.bgmAutoplay} onChange={(v) => set("bgmAutoplay", v)} />
        )}
      </Group>
    </>
  );
}

/* ---------------- 오프닝 ---------------- */

function Opening({ data, set }: Props) {
  return (
    <>
      <PanelHead title="오프닝 애니메이션" desc="청첩장을 열 때 재생되는 시작 애니메이션을 선택하세요" />
      <Group>
        <span className="text-[0.75rem] text-ink-soft">스타일 선택</span>
        <div className="grid grid-cols-3 gap-2">
          {OPENING_ANIMATIONS.map((o) => (
            <button
              key={o.id} type="button" onClick={() => set("opening", o.id)}
              aria-pressed={o.id === data.opening}
              className={`press grid aspect-square place-items-center gap-2 rounded-lg bg-white text-[0.6875rem] ring-offset-2 ring-offset-cream transition-shadow ${o.id === data.opening ? "ring-2 ring-ink" : "ring-1 ring-line hover:ring-rose"}`}
            >
              <span className="text-lg text-muted" aria-hidden>
                {{ none: "✕", emoji: "💍", lace: "❁", curtain: "↔", envelope: "✉", wrap: "🎁" }[o.id]}
              </span>
              <span className="text-ink-soft">{o.label}</span>
            </button>
          ))}
        </div>
      </Group>
    </>
  );
}

/* ---------------- 신랑 / 신부 ---------------- */

function PersonPanel({ data, set, setData, side }: Props & { side: "groom" | "bride" }) {
  const p = data[side];
  const label = side === "groom" ? "신랑" : "신부";
  const relations = side === "groom" ? SON_RELATIONS : DAUGHTER_RELATIONS;
  const hideKey = side === "groom" ? "hideGroomParents" : "hideBrideParents";
  const engKey = side === "groom" ? "groomEnglish" : "brideEnglish";
  const contactsKey = side === "groom" ? "groomContacts" : "brideContacts";
  const contacts = data[contactsKey];

  const up = (k: keyof Person, v: string | boolean) =>
    setData((d) => ({ ...d, [side]: { ...d[side], [k]: v } }));

  return (
    <>
      <PanelHead title={`${label} 정보`} desc={`${label}님과 혼주분의 성함 및 연락처 정보를 입력해주세요.`} />
      <Group>
        <div className="grid gap-1.5">
          <span className="text-[0.75rem] text-ink-soft">
            {label} 성함 <span className="text-rose-deep">*</span>
          </span>
          <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2">
            <TextInput value={p.lastName} onChange={(v) => up("lastName", v)} placeholder="성" />
            <TextInput value={p.firstName} onChange={(v) => up("firstName", v)} placeholder="이름" />
            <select
              value={p.relation}
              onChange={(e) => up("relation", e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-2 py-2.5 text-[0.8125rem] text-ink"
            >
              {relations.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <Field label={`${label} 연락처`} hint="청첩장의 '연락하기' 버튼에 연결됩니다">
          <TextInput type="tel" value={p.phone} onChange={(v) => up("phone", v)} placeholder="010-0000-0000" />
        </Field>

        <Field label={`${label} 영문명`} hint="타이틀 또는 미니앨범 디자인에 사용할 수 있습니다">
          <TextInput value={data[engKey]} onChange={(v) => set(engKey, v)} placeholder="English Name" />
        </Field>

        <ChipGroup
          label="청첩장 이름 표기 순서"
          options={[
            { id: "groom-first" as const, label: "신랑 먼저" },
            { id: "bride-first" as const, label: "신부 먼저" },
          ]}
          value={data.nameOrder}
          onChange={(v) => set("nameOrder", v)}
        />

        {(["father", "mother"] as const).map((role) => {
          const lastKey = `${role}LastName` as const;
          const firstKey = `${role}FirstName` as const;
          const lateKey = `${role}Late` as const;
          const phoneKey = `${role}Phone` as const;
          return (
            <div key={role} className="grid gap-1.5">
              <span className="text-[0.75rem] text-ink-soft">
                {role === "father" ? "아버지" : "어머니"} 성함
              </span>
              <div className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2">
                <TextInput value={p[lastKey]} onChange={(v) => up(lastKey, v)} placeholder="성" />
                <TextInput value={p[firstKey]} onChange={(v) => up(firstKey, v)} placeholder="이름" />
                <label className="flex items-center gap-1.5 rounded-sm border border-line bg-white px-2.5 py-2.5 text-[0.8125rem] text-ink">
                  <input type="checkbox" checked={p[lateKey]} onChange={(e) => up(lateKey, e.target.checked)} className="accent-rose-deep" />
                  故
                </label>
              </div>
              <TextInput type="tel" value={p[phoneKey]} onChange={(v) => up(phoneKey, v)} placeholder="연락처" />
            </div>
          );
        })}

        <ToggleCard label="혼주정보 미표시" desc="청첩장에서 혼주(부모님) 정보를 숨깁니다." checked={data[hideKey]} onChange={(v) => set(hideKey, v)} />

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] text-ink-soft">연락처</span>
            <span className="rounded-full bg-sand px-2 py-0.5 text-[0.625rem] text-muted">{contacts.length}개 등록됨</span>
          </div>
          {contacts.length === 0 ? (
            <p className="rounded-lg bg-white py-8 text-center text-[0.75rem] text-muted ring-1 ring-line">등록된 연락처가 없습니다.</p>
          ) : (
            <Repeater items={contacts} addLabel="연락처 추가하기" onAdd={() => set(contactsKey, [...contacts, { id: uid(), role: "", name: "", phone: "" } as Contact])}>
              {(id) => {
                const c = contacts.find((x) => x.id === id)!;
                const upd = (patch: Partial<Contact>) => set(contactsKey, contacts.map((x) => (x.id === id ? { ...x, ...patch } : x)));
                return (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="관계"><TextInput value={c.role} onChange={(v) => upd({ role: v })} placeholder="신랑 아버지" /></Field>
                      <Field label="이름"><TextInput value={c.name} onChange={(v) => upd({ name: v })} /></Field>
                    </div>
                    <Field label="전화번호"><TextInput type="tel" value={c.phone} onChange={(v) => upd({ phone: v })} /></Field>
                    <RowActions onRemove={() => set(contactsKey, contacts.filter((x) => x.id !== id))} />
                  </>
                );
              }}
            </Repeater>
          )}
          {contacts.length === 0 && (
            <button type="button" onClick={() => set(contactsKey, [{ id: uid(), role: "", name: "", phone: "" }])} className="press rounded-lg border border-dashed border-line py-3 text-[0.8125rem] text-ink-soft hover:border-rose hover:text-rose-deep">
              + 연락처 추가하기
            </button>
          )}
        </div>
      </Group>
    </>
  );
}

/* ---------------- 미니앨범 ---------------- */

function Album({ data, set, onGoOrder }: Props) {
  return (
    <>
      <PanelHead title="미니앨범" desc="마음에 드는 앨범 디자인을 고르고 사진을 추가해보세요." />
      <Group>
        <ToggleCard label="미니앨범 표시" checked={data.showAlbum} onChange={(v) => set("showAlbum", v)} />
        <SectionPosition data={data} section="album" onGoOrder={onGoOrder} />
        {data.showAlbum && (
          <>
            <Card title="앨범 색상과 문구" desc="앨범 배경과 텍스트·그래픽 색상을 정하고 문구 표시 여부를 선택해주세요.">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5">
                  <span className="text-[0.75rem] text-ink-soft">앨범 배경 색상</span>
                  <input type="color" value={data.albumBg ?? "#FFFFFF"} onChange={(e) => set("albumBg", e.target.value)} className="h-9 w-full cursor-pointer rounded-sm border border-line" />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[0.75rem] text-ink-soft">텍스트·그래픽 색상</span>
                  <input type="color" value={data.albumInk ?? "#2E2A27"} onChange={(e) => set("albumInk", e.target.value)} className="h-9 w-full cursor-pointer rounded-sm border border-line" />
                </label>
              </div>
              <button type="button" onClick={() => { set("albumBg", undefined); set("albumInk", undefined); }} className="justify-self-start text-[0.6875rem] text-muted underline underline-offset-2 hover:text-rose-deep">
                ↺ 자동 색상으로 되돌리기
              </button>
              <Toggle label="앨범 문구 표시" checked={data.showAlbumText} onChange={(v) => set("showAlbumText", v)} />
            </Card>

            <Card title="앨범 페이지" desc="페이지마다 디자인과 사진을 설정하세요. 추가한 페이지는 순서 변경에서 각각 배치할 수 있어요.">
              {data.albumPages.map((pg, i) => (
                <div key={pg.id} className="grid gap-2.5 rounded-md bg-cream p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {data.albumPages.length > 1 && (
                      <button type="button" onClick={() => set("albumPages", data.albumPages.filter((x) => x.id !== pg.id))} className="text-[0.6875rem] text-muted hover:text-rose-deep">삭제</button>
                    )}
                  </div>
                  <span className="text-[0.6875rem] text-ink-soft">앨범 디자인</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((d) => (
                      <button
                        key={d} type="button"
                        onClick={() => set("albumPages", data.albumPages.map((x) => (x.id === pg.id ? { ...x, designId: d } : x)))}
                        aria-pressed={pg.designId === d}
                        className={`press grid aspect-[3/4] place-items-center rounded-sm bg-white text-[0.5rem] text-muted ${pg.designId === d ? "ring-2 ring-ink" : "ring-1 ring-line"}`}
                      >
                        디자인 {d + 1}
                      </button>
                    ))}
                  </div>
                  <MultiImageUpload label="사진" values={pg.photos} max={6} onChange={(v) => set("albumPages", data.albumPages.map((x) => (x.id === pg.id ? { ...x, photos: v } : x)))} />
                </div>
              ))}
              <button type="button" onClick={() => set("albumPages", [...data.albumPages, { id: uid(), designId: 0, photos: [] }])} className="press rounded-sm border border-dashed border-line py-2.5 text-[0.75rem] text-ink-soft hover:border-rose hover:text-rose-deep">
                + 페이지 추가
              </button>
            </Card>
          </>
        )}
      </Group>
    </>
  );
}

/* ---------------- 예식 정보 ---------------- */

function Wedding({ data, set, onGoOrder }: Props) {
  const [h, m] = data.time.split(":");
  const hour = Number(h ?? 12);
  const period = hour < 12 ? "오전" : "오후";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;

  const setTime = (nextPeriod: string, next12: number, min: string) => {
    let hh = next12 % 12;
    if (nextPeriod === "오후") hh += 12;
    set("time", `${String(hh).padStart(2, "0")}:${min}`);
  };

  return (
    <>
      <PanelHead title="예식 정보" desc="초대장에 표시될 예식 일시와 장소 정보를 입력해주세요." />
      <Group>
        <Card title="예식 일정과 캘린더" desc="예식 날짜와 시간, 청첩장에 표시할 날짜 디자인을 설정하세요.">
          <Field label="예식 일자 *">
            <TextInput type="date" value={data.date} onChange={(v) => set("date", v)} />
          </Field>
          <Toggle label="초대장에 D-Day 표시하기" checked={data.showDday} onChange={(v) => set("showDday", v)} />
          <Toggle label="캘린더 표시" checked={data.showCalendar} onChange={(v) => set("showCalendar", v)} />
          <SectionPosition data={data} section="calendar" onGoOrder={onGoOrder} />

          <div className="grid gap-1.5">
            <span className="text-[0.75rem] text-ink-soft">날짜 표기 디자인</span>
            <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-md ring-1 ring-line">
              {DATE_FORMATS.map((f) => (
                <button
                  key={f.id} type="button" onClick={() => set("dateFormat", f.id)}
                  aria-pressed={f.id === data.dateFormat}
                  className={`press px-3 py-4 font-serif text-[0.9375rem] transition-colors ${f.id === data.dateFormat ? "bg-ink text-ivory" : "bg-white text-ink hover:bg-cream"}`}
                >
                  {f.id === "bar" ? formatDateShort(data.date).replace(".", " | ") : f.sample}
                </button>
              ))}
            </div>
            <span className="text-[0.6875rem] text-muted">· 선택한 디자인으로 초대장에 날짜가 표시됩니다.</span>
          </div>

          <div className="grid gap-1.5">
            <span className="text-[0.75rem] text-ink-soft">예식 시간 *</span>
            <div className="grid grid-cols-3 gap-2">
              <select value={period} onChange={(e) => setTime(e.target.value, h12, m ?? "00")} className="rounded-sm border border-line bg-white px-2 py-2.5 text-[0.8125rem]">
                <option>오전</option><option>오후</option>
              </select>
              <select value={h12} onChange={(e) => setTime(period, Number(e.target.value), m ?? "00")} className="rounded-sm border border-line bg-white px-2 py-2.5 text-[0.8125rem]">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}시</option>)}
              </select>
              <select value={m} onChange={(e) => setTime(period, h12, e.target.value)} className="rounded-sm border border-line bg-white px-2 py-2.5 text-[0.8125rem]">
                {["00", "10", "20", "30", "40", "50"].map((n) => <option key={n} value={n}>{n}분</option>)}
              </select>
            </div>
          </div>
        </Card>

        <Card title="예식장 기본 정보" desc="예식장 이름과 주소를 입력하고 청첩장 노출 여부를 설정하세요.">
          <Toggle label="예식장 정보 표시" checked={data.showVenueInfo} onChange={(v) => set("showVenueInfo", v)} />
          <SectionPosition data={data} section="location" onGoOrder={onGoOrder} />
          <Field label="예식장 이름 *"><TextInput value={data.venueName} onChange={(v) => set("venueName", v)} /></Field>
          <Field label="홀 / 층"><TextInput value={data.venueHall} onChange={(v) => set("venueHall", v)} /></Field>
          <Field label="주소"><TextInput value={data.venueAddress} onChange={(v) => set("venueAddress", v)} /></Field>
          <Field label="예식장 연락처"><TextInput type="tel" value={data.venueTel} onChange={(v) => set("venueTel", v)} /></Field>
          <Toggle label="지도 표시" checked={data.showMap} onChange={(v) => set("showMap", v)} />
        </Card>

        <Card title="교통편 안내">
          <Repeater items={data.transport} addLabel="교통편 추가" onAdd={() => set("transport", [...data.transport, { id: uid(), label: "", body: "" } as TransportItem])}>
            {(id) => {
              const t = data.transport.find((x) => x.id === id)!;
              const upd = (patch: Partial<TransportItem>) => set("transport", data.transport.map((x) => (x.id === id ? { ...x, ...patch } : x)));
              return (
                <>
                  <Field label="구분"><TextInput value={t.label} onChange={(v) => upd({ label: v })} placeholder="자가용 / 지하철 / 버스" /></Field>
                  <Field label="안내"><TextArea value={t.body} onChange={(v) => upd({ body: v })} rows={3} /></Field>
                  <RowActions onRemove={() => set("transport", data.transport.filter((x) => x.id !== id))} />
                </>
              );
            }}
          </Repeater>
        </Card>
      </Group>
    </>
  );
}

/* ---------------- 초대 글 ---------------- */

function Invite({ data, set, setData, onGoOrder }: Props) {
  return (
    <>
      <PanelHead title="초대 글" desc="소중한 분들에게 전할 초대 문구를 입력해주세요." />
      <Group>
        <Field label="제목 *">
          <TextInput value={data.greetingTitle} onChange={(v) => set("greetingTitle", v)} placeholder="예: 초대합니다" />
        </Field>
        <ToggleCard label="상단에 예식 날짜 표시하기" checked={data.showDateOnInvitation} onChange={(v) => set("showDateOnInvitation", v)} />
        <SectionPosition data={data} section="invitation" onGoOrder={onGoOrder} />
        <Field label="본문 *">
          <TextArea value={data.greeting} onChange={(v) => set("greeting", v)} rows={9} />
        </Field>

        <div className="grid gap-2">
          <span className="text-[0.75rem] text-ink-soft">템플릿 문구</span>
          {GREETING_SAMPLES.map((s2) => {
            const on = data.greeting === s2.body;
            return (
              <button
                key={s2.label} type="button"
                onClick={() => setData((d) => ({ ...d, greetingTitle: s2.title, greeting: s2.body }))}
                className={`press rounded-lg bg-white p-4 text-left ring-1 transition-colors ${on ? "ring-2 ring-ink" : "ring-line hover:ring-rose"}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-serif text-[0.9375rem] text-ink">{s2.title}</span>
                  {on && <span className="text-rose-deep" aria-hidden>✓</span>}
                </span>
                <span className="mt-1.5 block line-clamp-2 text-[0.75rem] leading-relaxed text-muted">
                  {s2.body.replace(/\n/g, " ")}
                </span>
              </button>
            );
          })}
        </div>
      </Group>
    </>
  );
}

/* ---------------- 계좌 ---------------- */

function Accounts({ data, set, onGoOrder }: Props) {
  return (
    <>
      <PanelHead title="계좌 정보" desc="축하의 마음을 전할 수 있는 계좌를 등록해주세요." />
      <Group>
        <ToggleCard label="계좌 정보 표시" checked={data.showAccounts} onChange={(v) => set("showAccounts", v)} />
        <SectionPosition data={data} section="account" onGoOrder={onGoOrder} />
        {data.showAccounts && (
          <>
            <Field label="제목"><TextInput value={data.accountsTitle} onChange={(v) => set("accountsTitle", v)} /></Field>
            <Field label="안내 문구"><TextArea value={data.accountsNote} onChange={(v) => set("accountsNote", v)} rows={3} /></Field>
            <Repeater items={data.accounts} addLabel="계좌 추가" onAdd={() => set("accounts", [...data.accounts, { id: uid(), side: "groom", bank: "", number: "", holder: "", kakaopay: "" } as Account])}>
              {(id) => {
                const a = data.accounts.find((x) => x.id === id)!;
                const upd = (patch: Partial<Account>) => set("accounts", data.accounts.map((x) => (x.id === id ? { ...x, ...patch } : x)));
                return (
                  <>
                    <ChipGroup options={[{ id: "groom" as const, label: "신랑측" }, { id: "bride" as const, label: "신부측" }]} value={a.side} onChange={(v) => upd({ side: v })} />
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="은행"><TextInput value={a.bank} onChange={(v) => upd({ bank: v })} /></Field>
                      <Field label="예금주"><TextInput value={a.holder} onChange={(v) => upd({ holder: v })} /></Field>
                    </div>
                    <Field label="계좌번호"><TextInput value={a.number} onChange={(v) => upd({ number: v })} /></Field>
                    <Field label="카카오페이 송금 링크" hint="비워두면 송금 버튼이 숨겨집니다"><TextInput type="url" value={a.kakaopay} onChange={(v) => upd({ kakaopay: v })} /></Field>
                    <RowActions onRemove={() => set("accounts", data.accounts.filter((x) => x.id !== id))} />
                  </>
                );
              }}
            </Repeater>
          </>
        )}
      </Group>
    </>
  );
}

/* ---------------- 갤러리 ---------------- */

function Gallery({ data, set, onGoOrder }: Props) {
  return (
    <>
      <PanelHead title="갤러리" desc="소중한 순간이 담긴 사진을 올려주세요." />
      <Group>
        <ToggleCard label="갤러리 사용" checked={data.showGallery} onChange={(v) => set("showGallery", v)} />
        <SectionPosition data={data} section="gallery" onGoOrder={onGoOrder} />
        {data.showGallery && (
          <>
            <Field label="제목"><TextInput value={data.galleryTitle} onChange={(v) => set("galleryTitle", v)} /></Field>
            <div className="grid gap-1.5">
              <span className="text-[0.75rem] text-ink-soft">갤러리 타입</span>
              <div className="grid grid-cols-4 gap-2">
                {GALLERY_TYPES.map((g) => (
                  <button
                    key={g.id} type="button" onClick={() => set("galleryType", g.id)}
                    aria-pressed={g.id === data.galleryType}
                    className={`press grid place-items-center gap-1.5 rounded-lg bg-white px-1 py-3 text-[0.625rem] ring-offset-2 ring-offset-cream transition-shadow ${g.id === data.galleryType ? "ring-2 ring-ink" : "ring-1 ring-line hover:ring-rose"}`}
                  >
                    <GalleryGlyph id={g.id} />
                    <span className="text-ink-soft">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <MultiImageUpload label="사진 업로드" values={data.gallery} onChange={(v) => set("gallery", v)} max={60} />
            <span className="text-[0.6875rem] text-muted">· 최대 60장까지 업로드할 수 있습니다. ‹ › 버튼으로 순서를 바꿀 수 있어요</span>
            <ToggleCard label="이미지 확대 및 다운로드 방지" checked={data.galleryProtect} onChange={(v) => set("galleryProtect", v)} />
          </>
        )}
      </Group>
    </>
  );
}

function GalleryGlyph({ id }: { id: string }) {
  const c = "fill-hint";
  if (id === "grid") return <svg viewBox="0 0 24 24" className="h-5 w-5"><g className={c}>{[0,1,2].flatMap(r=>[0,1,2].map(k=><rect key={`${r}${k}`} x={4+k*6} y={4+r*6} width="4.5" height="4.5" rx="0.8" />))}</g></svg>;
  if (id === "mosaic") return <svg viewBox="0 0 24 24" className="h-5 w-5"><g className={c}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="4" rx="1" /><rect x="13" y="10" width="7" height="10" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /></g></svg>;
  if (id === "slide") return <svg viewBox="0 0 24 24" className="h-5 w-5"><g className={c}><rect x="9" y="5" width="6" height="14" rx="1" /><rect x="4" y="8" width="3" height="8" rx="1" opacity=".5" /><rect x="17" y="8" width="3" height="8" rx="1" opacity=".5" /></g></svg>;
  if (id === "stack") return <svg viewBox="0 0 24 24" className="h-5 w-5"><g className={c}><rect x="7" y="4" width="10" height="14" rx="1.5" /><rect x="5" y="7" width="14" height="13" rx="1.5" opacity=".45" /></g></svg>;
  if (id === "bento") return <svg viewBox="0 0 24 24" className="h-5 w-5"><g className={c}><rect x="4" y="4" width="8" height="8" rx="1" /><rect x="14" y="4" width="6" height="4" rx="1" /><rect x="14" y="10" width="6" height="10" rx="1" /><rect x="4" y="14" width="8" height="6" rx="1" /></g></svg>;
  if (id === "circle") return <svg viewBox="0 0 24 24" className="h-5 w-5"><g className={c}><circle cx="8" cy="10" r="4" /><circle cx="16" cy="10" r="4" opacity=".55" /><circle cx="12" cy="17" r="3" opacity=".35" /></g></svg>;
  if (id === "polaroid") return <svg viewBox="0 0 24 24" className="h-5 w-5"><g className={c}><rect x="5" y="4" width="9" height="12" rx="1" transform="rotate(-6 9.5 10)" /><rect x="11" y="7" width="9" height="12" rx="1" transform="rotate(7 15.5 13)" opacity=".55" /></g></svg>;
  return <svg viewBox="0 0 24 24" className="h-5 w-5"><g className={c}><rect x="4" y="8" width="6" height="6" rx="1" /><rect x="11" y="4" width="6" height="6" rx="1" opacity=".7" /><rect x="13" y="13" width="7" height="7" rx="1" opacity=".45" /></g></svg>;
}

/* ---------------- 안내사항 ---------------- */

function Notice({ data, set, setData, onGoOrder }: Props) {
  // 항목을 추가하면 섹션이 자동으로 켜집니다 — 추가했는데 안 보이는 일이 없도록.
  const addNotice = () =>
    setData((d) => ({
      ...d,
      showNotice: true,
      notices: [...d.notices, { id: uid(), title: "", body: "" } as NoticeItem],
    }));
  return <NoticeInner data={data} set={set} addNotice={addNotice} onGoOrder={onGoOrder} />;
}

function NoticeInner({
  data,
  set,
  addNotice,
  onGoOrder,
}: {
  data: InvitationData;
  set: Set;
  addNotice: () => void;
  onGoOrder: () => void;
}) {
  return (
    <>
      <PanelHead title="안내사항" desc="포토부스, 피로연, 화환 거절 등 하객분들께 전달할 안내사항을 작성해 주세요." />
      <Group>
        <ToggleCard label="안내사항 표시하기" checked={data.showNotice} onChange={(v) => set("showNotice", v)} />
        <SectionPosition data={data} section="notice" onGoOrder={onGoOrder} />
        <Repeater items={data.notices} addLabel="안내사항 추가" onAdd={addNotice}>
          {(id, i) => {
            const n = data.notices.find((x) => x.id === id)!;
            const upd = (patch: Partial<NoticeItem>) => set("notices", data.notices.map((x) => (x.id === id ? { ...x, ...patch } : x)));
            return (
              <>
                <p className="text-[0.75rem] font-medium text-ink">안내사항 {i + 1}</p>
                <TextInput value={n.title} onChange={(v) => upd({ title: v })} placeholder="제목 (예: 전세버스 안내)" />
                <TextArea value={n.body} onChange={(v) => upd({ body: v })} rows={4} placeholder="상세 내용을 입력해주세요" />
                <ImageUpload label="이미지" value={n.photo} onChange={(v) => upd({ photo: v })} />
                <RowActions onRemove={() => set("notices", data.notices.filter((x) => x.id !== id))} />
              </>
            );
          }}
        </Repeater>
      </Group>
    </>
  );
}

/* ---------------- 하객스냅 ---------------- */

function Snap({ data, set, onGoOrder }: Props) {
  return (
    <>
      <PanelHead title="하객스냅" desc="하객이 직접 올린 사진과 영상을 모아보세요." />
      <Group>
        <Card title="구글 드라이브" desc="하객이 올린 사진과 영상이 저장될 계정을 연결합니다.">
          <TextInput type="url" value={data.snapDriveUrl} onChange={(v) => set("snapDriveUrl", v)} placeholder="드라이브 폴더 URL" />
          <button type="button" className="press w-full rounded-full bg-ink py-3 text-[0.8125rem] text-ivory">
            구글 드라이브 연동하기
          </button>
        </Card>
        <Card title="공개 설정" desc="켜두면 청첩장에 하객스냅 업로드 영역이 표시됩니다.">
          <Toggle label="하객 사진 업로드 받기" checked={data.snapEnabled} onChange={(v) => set("snapEnabled", v)} />
        </Card>
        <SectionPosition data={data} section="snap" onGoOrder={onGoOrder} />
      </Group>
    </>
  );
}

/* ---------------- 두 사람 이야기 ---------------- */

function Couple({ data, set, onGoOrder }: Props) {
  return (
    <>
      <PanelHead title="두 사람 이야기" desc="신랑과 신부의 사진, 소개 문구를 한 섹션에 담아보세요." />
      <Group>
        <ToggleCard label="두 사람 이야기 표시" checked={data.showCouple} onChange={(v) => set("showCouple", v)} />
        <SectionPosition data={data} section="couple" onGoOrder={onGoOrder} />
        {data.showCouple && (
          <>
            <Card title="프로필 디자인" desc="원하는 디자인을 선택하면 사진과 문구가 해당 구성에 맞게 배치됩니다.">
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2, 3, 4, 5].map((d) => (
                  <button key={d} type="button" onClick={() => set("coupleDesign", d)} aria-pressed={data.coupleDesign === d}
                    className={`press grid aspect-[3/4] place-items-center rounded-md bg-white text-[0.5625rem] text-muted ${data.coupleDesign === d ? "ring-2 ring-ink" : "ring-1 ring-line"}`}>
                    디자인 {d + 1}
                  </button>
                ))}
              </div>
            </Card>
            <Card title="포인트 컬러" desc="디자이너가 설정한 기본 컬러를 원하는 색으로 바꿀 수 있어요.">
              <div className="flex items-center justify-between">
                <span className="text-[0.8125rem] text-ink">포인트 컬러 1<span className="block text-[0.6875rem] text-muted">그래픽</span></span>
                <input type="color" value={data.couplePoint1} onChange={(e) => set("couplePoint1", e.target.value)} className="h-8 w-8 cursor-pointer rounded-full border border-line" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.8125rem] text-ink">포인트 컬러 2<span className="block text-[0.6875rem] text-muted">텍스트</span></span>
                <input type="color" value={data.couplePoint2} onChange={(e) => set("couplePoint2", e.target.value)} className="h-8 w-8 cursor-pointer rounded-full border border-line" />
              </div>
            </Card>
            <Card title="신랑">
              <ImageUpload label="사진" value={data.groomPhoto} onChange={(v) => set("groomPhoto", v)} />
              <Field label="소개"><TextArea value={data.groomIntro} onChange={(v) => set("groomIntro", v)} rows={3} /></Field>
            </Card>
            <Card title="신부">
              <ImageUpload label="사진" value={data.bridePhoto} onChange={(v) => set("bridePhoto", v)} />
              <Field label="소개"><TextArea value={data.brideIntro} onChange={(v) => set("brideIntro", v)} rows={3} /></Field>
            </Card>
          </>
        )}
      </Group>
    </>
  );
}

/* ---------------- 타임라인 ---------------- */

const TIMELINE_SAMPLES: Record<string, TimelineItem[]> = {
  성장: [
    { id: "t1", date: "1997.05.05", period: "신랑의 어린 시절", body: "온 동네를 누비던 골목대장 꼬마 이인호와" },
    { id: "t2", date: "1999.08.15", period: "신부의 어린 시절", body: "호기심 많아 잠시도 가만 안 있던 에너자이저 오연서" },
    { id: "t3", date: "2004.06.10", period: "훌쩍 자란 소년", body: "무릎에 밴드가 마를 날 없던 개구쟁이는 훌쩍 자랐고," },
    { id: "t4", date: "2006.04.05", period: "숙녀가 된 소녀", body: "말괄량이 소녀는 제법 숙녀 티가 나기 시작했습니다." },
  ],
  만남: [
    { id: "t1", date: "2021.03.14", period: "첫 만남", body: "친구의 소개로 처음 마주 앉은 봄날의 카페" },
    { id: "t2", date: "2021.06.02", period: "연인이 되던 날", body: "서로의 하루가 궁금해지기 시작했습니다." },
    { id: "t3", date: "2024.12.24", period: "프러포즈", body: "평생을 함께하자는 약속을 나눴습니다." },
  ],
};

function Timeline({ data, set, setData, onGoOrder }: Props) {
  // 샘플을 넣거나 항목을 추가하면 섹션을 자동으로 켭니다.
  const applySample = (items: TimelineItem[]) =>
    setData((d) => ({ ...d, showTimeline: true, timeline: items.map((x) => ({ ...x, id: uid() })) }));
  const addItem = () =>
    setData((d) => ({
      ...d,
      showTimeline: true,
      timeline: [...d.timeline, { id: uid(), date: "", period: "", body: "" } as TimelineItem],
    }));
  return (
    <>
      <PanelHead title="타임라인" desc="두 사람이 걸어온 시간을 순서대로 담아보세요." />
      <Group>
        <ToggleCard label="타임라인 표시" checked={data.showTimeline} onChange={(v) => set("showTimeline", v)} />
        <SectionPosition data={data} section="timeline" onGoOrder={onGoOrder} />
        {(
          <>
            <Card title="섹션 문구" desc="섹션 상단에 표시되는 제목과 한 줄 소개입니다.">
              <Field label="섹션 제목"><TextInput value={data.timelineTitle} onChange={(v) => set("timelineTitle", v)} /></Field>
              <ChipGroup label="사진 모양" options={[{ id: "heart" as const, label: "♡ 하트" }, { id: "circle" as const, label: "○ 원형" }]} value={data.timelineShape} onChange={(v) => set("timelineShape", v)} />
            </Card>

            <Card title="샘플 템플릿" desc="구성과 문구가 샘플로 채워져요. 등록한 사진은 순서대로 유지됩니다.">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TIMELINE_SAMPLES).map(([k, items]) => (
                  <button key={k} type="button" onClick={() => applySample(items)}
                    className="press rounded-md bg-cream px-3 py-3 text-center ring-1 ring-line hover:ring-rose">
                    <span className="block text-[0.8125rem] text-ink">{k} 이야기</span>
                    <span className="mt-0.5 block text-[0.625rem] text-muted">
                      {k === "성장" ? "어린 날부터 평생의 짝이 되기까지" : "첫 만남부터 평생을 약속하기까지"}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="타임라인 항목" desc="사진과 시기를 등록하면 시간순으로 이어지는 타임라인이 만들어져요.">
              <Repeater items={data.timeline} addLabel="항목 추가" onAdd={addItem}>
                {(id, i) => {
                  const t = data.timeline.find((x) => x.id === id)!;
                  const upd = (patch: Partial<TimelineItem>) => set("timeline", data.timeline.map((x) => (x.id === id ? { ...x, ...patch } : x)));
                  return (
                    <>
                      <p className="text-[0.75rem] text-muted">{String(i + 1).padStart(2, "0")} {t.period}</p>
                      <ImageUpload label="사진" value={t.photo} onChange={(v) => upd({ photo: v })} />
                      <Field label="날짜"><TextInput value={t.date} onChange={(v) => upd({ date: v })} placeholder="1997.05.05" /></Field>
                      <Field label="시기"><TextInput value={t.period} onChange={(v) => upd({ period: v })} /></Field>
                      <Field label="문구" hint={`${t.body.length}/120`}><TextArea value={t.body} onChange={(v) => upd({ body: v.slice(0, 120) })} rows={2} /></Field>
                      <RowActions onRemove={() => set("timeline", data.timeline.filter((x) => x.id !== id))} />
                    </>
                  );
                }}
              </Repeater>
            </Card>
          </>
        )}
      </Group>
    </>
  );
}

/* ---------------- 비디오 ---------------- */

function Video({ data, set, onGoOrder }: Props) {
  return (
    <>
      <PanelHead title="비디오" desc="초대장에 동영상을 추가하여 특별함을 더해보세요." />
      <Group>
        <ToggleCard label="비디오 섹션 사용하기" checked={data.showVideo} onChange={(v) => set("showVideo", v)} />
        <SectionPosition data={data} section="video" onGoOrder={onGoOrder} />
        {data.showVideo && (
          <>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-white p-1 ring-1 ring-line">
              {(["upload", "youtube"] as const).map((m) => (
                <button key={m} type="button" onClick={() => set("videoMode", m)} aria-pressed={data.videoMode === m}
                  className={`press rounded-md py-2.5 text-[0.8125rem] transition-colors ${data.videoMode === m ? "bg-ink text-ivory" : "text-ink-soft"}`}>
                  {m === "upload" ? "직접 업로드" : "YouTube URL"}
                </button>
              ))}
            </div>
            {data.videoMode === "youtube" ? (
              <Field label="YouTube URL"><TextInput type="url" value={data.videoUrl} onChange={(v) => set("videoUrl", v)} placeholder="https://youtu.be/..." /></Field>
            ) : (
              <Card title="동영상 파일" desc="mp4 파일 형식만 업로드 가능합니다. (40MB 이하)">
                <label className="press grid cursor-pointer place-items-center gap-1 rounded-md border border-dashed border-line py-8 text-center text-[0.75rem] text-muted hover:border-rose hover:text-rose-deep">
                  <span className="text-lg">↥</span>
                  {data.videoUrl ? "동영상이 등록되었습니다 · 다시 선택" : "클릭하여 동영상 업로드"}
                  <span className="text-[0.625rem]">MP4 (Max 40MB)</span>
                  <input
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 40 * 1024 * 1024) {
                        window.alert("40MB 이하 파일만 업로드할 수 있습니다.");
                        return;
                      }
                      set("videoUrl", URL.createObjectURL(f));
                      e.target.value = "";
                    }}
                  />
                </label>
              </Card>
            )}
            <ImageUpload label="썸네일 이미지" value={data.videoThumb} onChange={(v) => set("videoThumb", v)} />
          </>
        )}
      </Group>
    </>
  );
}

/* ---------------- 방명록 ---------------- */

function Guestbook({ data, set, onGoOrder }: Props) {
  return (
    <>
      <PanelHead title="방명록" desc="하객분들이 축하 메시지를 남길 수 있는 공간입니다." />
      <Group>
        <ToggleCard label="방명록 사용하기" checked={data.showGuestbook} onChange={(v) => set("showGuestbook", v)} />
        <SectionPosition data={data} section="guestbook" onGoOrder={onGoOrder} />
        {data.showGuestbook && (
          <>
            <Field label="제목"><TextInput value={data.guestbookTitle} onChange={(v) => set("guestbookTitle", v)} /></Field>
            <Field label="비밀번호 *" hint="방명록을 삭제할 때 필요한 비밀번호입니다.">
              <TextInput value={data.guestbookPassword} onChange={(v) => set("guestbookPassword", v)} placeholder="삭제 비밀번호 입력" />
            </Field>
          </>
        )}
      </Group>
    </>
  );
}

/* ---------------- 선물하기 ---------------- */

function Gift({ data, set, onGoOrder }: Props) {
  return (
    <>
      <PanelHead title="선물하기" desc="화환이나 답례품 링크를 연결할 수 있습니다." />
      <Group>
        <ToggleCard label="선물하기 표시" checked={data.showGift} onChange={(v) => set("showGift", v)} />
        <SectionPosition data={data} section="gift" onGoOrder={onGoOrder} />
        {data.showGift && (
          <Field label="버튼 문구"><TextInput value={data.giftLabel} onChange={(v) => set("giftLabel", v)} /></Field>
        )}
      </Group>
    </>
  );
}

/* ---------------- 참석여부 ---------------- */

function Rsvp({ data, set, onGoOrder }: Props) {
  return (
    <>
      <PanelHead
        title="참석여부 확인하기(RSVP)"
        desc="하객들의 예식 참석 여부를 미리 확인할 수 있습니다."
        action={<button type="button" className="press rounded-full border border-line bg-white px-3 py-1.5 text-[0.75rem] text-ink">현황보기</button>}
      />
      <Group>
        <ToggleCard label="참석여부 기능 사용" checked={data.showRsvp} onChange={(v) => set("showRsvp", v)} />
        <SectionPosition data={data} section="rsvp" onGoOrder={onGoOrder} />
        {data.showRsvp && (
          <>
            <Field label="제목"><TextInput value={data.rsvpTitle} onChange={(v) => set("rsvpTitle", v)} /></Field>
            <Field label="안내 문구"><TextArea value={data.rsvpNote} onChange={(v) => set("rsvpNote", v)} rows={3} /></Field>
            <ToggleCard label="참석 인원 묻기" checked={data.rsvpAskCount} onChange={(v) => set("rsvpAskCount", v)} />
            <ToggleCard label="식사 여부 묻기" checked={data.rsvpAskMeal} onChange={(v) => set("rsvpAskMeal", v)} />
            <ToggleCard label="첫 방문 시 팝업" desc="청첩장을 열면 참석 여부를 먼저 묻습니다." checked={data.rsvpPopup} onChange={(v) => set("rsvpPopup", v)} />
          </>
        )}
      </Group>
    </>
  );
}

/* ---------------- 이미지 ---------------- */

function ImagesPanel({ data, set }: Props) {
  return (
    <>
      <PanelHead title="이미지" desc="청첩장에 등록된 모든 이미지를 한곳에서 관리합니다." />
      <Group>
        <ImageUpload label="대표 이미지" value={data.coverPhoto} onChange={(v) => set("coverPhoto", v)} />
        <ImageUpload label="공유 이미지" value={data.shareImage} onChange={(v) => set("shareImage", v)} />
        <MultiImageUpload label="갤러리" values={data.gallery} onChange={(v) => set("gallery", v)} max={60} />
      </Group>
    </>
  );
}

/* ---------------- 순서 변경 ---------------- */

/** 청첩장에 실제로 그려지는 섹션만 순서 목록에 나타납니다. */
export function isSectionActive(k: SectionKey, d: InvitationData): boolean {
  switch (k) {
    case "invitation": return true;
    case "couple": return d.showCouple;
    case "timeline": return d.showTimeline;
    case "album": return d.showAlbum;
    case "notice": return d.showNotice;
    case "calendar": return d.showCalendar;
    case "gallery": return d.showGallery;
    case "location": return d.showVenueInfo;
    case "account": return d.showAccounts;
    case "video": return d.showVideo;
    case "guestbook": return d.showGuestbook;
    case "rsvp": return d.showRsvp;
    case "snap": return d.snapEnabled;
    case "gift": return d.showGift;
  }
}

function Order({ data, set }: Props) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const active = data.sectionOrder.filter((k) => isSectionActive(k, data));
  const inactive = data.sectionOrder.filter((k) => !isSectionActive(k, data));

  /**
   * 활성 목록 기준으로 옮기되, 전체 배열 안에서 이동시킵니다.
   * (활성 항목만 재배열한 뒤 비활성을 뒤에 붙이면, 아직 켜지 않은 섹션들의
   *  기본 위치가 통째로 뒤로 밀려나 버립니다.)
   */
  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const fromKey = active[from];
    const toKey = active[to];
    if (!fromKey || !toKey) return;

    const next = [...data.sectionOrder];
    const fromIdx = next.indexOf(fromKey);
    next.splice(fromIdx, 1);
    // 목적지 키의 (제거 후) 전체 배열 위치 앞/뒤에 끼워 넣습니다.
    const toIdx = next.indexOf(toKey);
    next.splice(from < to ? toIdx + 1 : toIdx, 0, fromKey);
    set("sectionOrder", next);
  };

  return (
    <>
      <PanelHead title="순서 변경" desc="초대장 각 섹션의 노출 순서를 자유롭게 변경할 수 있습니다. 손잡이를 잡고 끌어 옮기세요." />
      <Group>
        <span className="text-[0.75rem] text-ink-soft">섹션 순서</span>

        <ul className="grid gap-2">
          {active.map((k, i) => {
            const dragging = dragIdx === i;
            const isOver = overIdx === i && dragIdx !== null && dragIdx !== i;
            return (
              <li
                key={k}
                draggable
                onDragStart={(e) => {
                  setDragIdx(i);
                  e.dataTransfer.effectAllowed = "move";
                  // Firefox 는 데이터가 설정되지 않으면 드래그를 시작하지 않습니다.
                  e.dataTransfer.setData("text/plain", k);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overIdx !== i) setOverIdx(i);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIdx !== null) reorder(dragIdx, i);
                  setDragIdx(null);
                  setOverIdx(null);
                }}
                onDragEnd={() => {
                  setDragIdx(null);
                  setOverIdx(null);
                }}
                className={`flex items-center gap-3 rounded-lg bg-white px-4 py-3.5 ring-1 transition-all duration-200 ${
                  dragging ? "opacity-40 ring-rose-deep" : "ring-line"
                } ${isOver ? "translate-y-0.5 ring-2 ring-rose-deep" : ""}`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cream text-[0.6875rem] text-muted">
                  {i + 1}
                </span>
                <span className="flex-1 text-[0.8125rem] text-ink">
                  {SECTION_LABELS[k]}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button" onClick={() => reorder(i, Math.max(0, i - 1))}
                    aria-label="위로" disabled={i === 0}
                    className="press grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-cream hover:text-ink disabled:opacity-25"
                  >↑</button>
                  <button
                    type="button" onClick={() => reorder(i, Math.min(active.length - 1, i + 1))}
                    aria-label="아래로" disabled={i === active.length - 1}
                    className="press grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-cream hover:text-ink disabled:opacity-25"
                  >↓</button>
                  <span
                    className="cursor-grab pl-1 text-hint select-none active:cursor-grabbing"
                    aria-hidden
                    title="끌어서 옮기기"
                  >
                    ⠿
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        {inactive.length > 0 && (
          <div className="mt-2 rounded-lg bg-white p-4 ring-1 ring-line">
            <p className="text-[0.75rem] text-ink">아직 사용하지 않는 섹션</p>
            <p className="mt-1 text-[0.6875rem] text-muted">
              각 섹션에서 켜면 여기 목록에 추가되고 청첩장에도 나타납니다.
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {inactive.map((k) => (
                <li key={k} className="rounded-full bg-cream px-2.5 py-1 text-[0.6875rem] text-muted">
                  {SECTION_LABELS[k]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Group>
    </>
  );
}
