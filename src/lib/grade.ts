import type { ReferenceGarment } from "../types/fitmap";

/** 마이페이지 등급. 기준 옷을 얼마나 채웠는지로만 정한다(시안). */
export interface Grade {
  name: string;
  level: number;
  /** 다음 등급까지 할 일. 최고 등급이면 null */
  next: string | null;
}

export function gradeOf(refs: ReferenceGarment[]): Grade {
  const hasTop = refs.some((r) => r.category === "top");
  const hasBottom = refs.some((r) => r.category === "bottom");
  if (refs.length >= 5) return { name: "핏 마스터", level: 4, next: null };
  if (hasTop && hasBottom) return { name: "핏 메이커", level: 3, next: "기준 옷을 5벌까지 등록해 보세요" };
  if (refs.length >= 1) return { name: "핏 탐색가", level: 2, next: "상의와 하의를 모두 등록해 보세요" };
  return { name: "핏 비기너", level: 1, next: "기준 옷을 1벌 등록해 보세요" };
}
