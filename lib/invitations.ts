/**
 * 발행된 청첩장 — /i/<slug> 로 열리는 실제 청첩장.
 *
 * 지금은 content/invitations.json 한 파일에 담아 빌드에 포함시킵니다.
 * 나중에 백엔드(Supabase 등)로 옮길 때 손댈 곳이 이 파일 하나가 되도록,
 * 레코드 모양을 DB 한 행과 똑같이 잡고 조회 함수도 여기에만 두었습니다.
 * 페이지·컴포넌트는 listInvitations() / getInvitation() 만 알면 됩니다.
 */

import RECORDS from "@/content/invitations.json";
import { createDefaultData, getTemplate, type InvitationData } from "@/lib/invitation";

export interface InvitationRecord {
  /** 주소에 쓰이는 고유 이름 — /i/<slug> */
  slug: string;
  templateId: string;
  /** ISO 문자열. DB 로 옮기면 updated_at 컬럼이 됩니다. */
  updatedAt: string;
  /**
   * 기본값과 다른 값만 담아도 됩니다. 읽을 때 템플릿 기본값 위에 얹으므로,
   * 나중에 필드가 늘어나도 예전에 발행한 청첩장이 깨지지 않습니다.
   */
  data: Partial<InvitationData>;
}

const ALL = RECORDS as InvitationRecord[];

export function listInvitations(): InvitationRecord[] {
  return ALL;
}

export function getInvitationRecord(slug: string): InvitationRecord | undefined {
  return ALL.find((r) => r.slug === slug);
}

/** 템플릿 기본값 + 저장된 값 */
export function getInvitationData(rec: InvitationRecord): InvitationData {
  return { ...createDefaultData(rec.templateId), ...rec.data };
}

export function getInvitationTemplate(rec: InvitationRecord) {
  return getTemplate(rec.data.templateId ?? rec.templateId);
}

/**
 * 카카오톡 링크 미리보기에 쓸 이미지 경로.
 *
 * basePath 아래에 배포될 때 앞에 슬래시가 붙은 경로를 주면 basePath 가
 * 날아가 버립니다. 그래서 슬래시를 떼어 상대 경로로 돌려줍니다.
 */
export function ogImagePath(data: InvitationData): string {
  const src = data.shareImage ?? data.coverPhoto;
  // data:/blob: 은 미리보기에 쓸 수 없으므로 내장 샘플로 대체합니다.
  const usable = src && src.startsWith("/") ? src : "/samples/couple-01.jpg";
  return usable.replace(/^\//, "");
}
