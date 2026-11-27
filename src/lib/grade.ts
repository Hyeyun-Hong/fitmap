import type { ReferenceGarment } from "../types/fitmap";

/** 마이페이지 등급. 기준 옷을 얼마나 채웠는지로만 정한다(시안). */
export interface Grade {
  name: string;
  level: number;
  /** 다음 등급까지 할 일. 최고 등급이면 null */
  next: string | null;
}

export interface GradeRule {
  name: string;
  level: number;
  /** 등급 기준 페이지에 보여줄 조건 */
  condition: string;
  /** 이 등급의 조건을 채웠는지 */
  meets: (refs: ReferenceGarment[]) => boolean;
  /** 이 등급일 때 다음 등급까지 할 일 */
  next: string | null;
}

/** 등급 표. 낮은 등급부터. 기준을 바꾸면 이 배열만 고치면 등급 계산과 등급 기준 페이지가 같이 바뀐다. */
export const GRADES: GradeRule[] = [
  {
    name: "Fit Beginner",
    level: 1,
    condition: "처음 시작하면 받는 등급이에요",
    meets: () => true,
    next: "기준 옷을 1벌 등록해 보세요",
  },
  {
    name: "Fit Explorer",
    level: 2,
    condition: "기준 옷 1벌 이상 등록",
    meets: (refs) => refs.length >= 1,
    next: "상의와 하의를 모두 등록해 보세요",
  },
  {
    name: "Fit Maker",
    level: 3,
    condition: "상의와 하의 기준 옷을 1벌 이상씩 등록",
    meets: (refs) => refs.some((r) => r.category === "top") && refs.some((r) => r.category === "bottom"),
    next: "기준 옷을 5벌까지 등록해 보세요",
  },
  {
    name: "Fit Master",
    level: 4,
    condition: "기준 옷 5벌 이상 등록",
    meets: (refs) => refs.length >= 5,
    next: null,
  },
];

export function gradeOf(refs: ReferenceGarment[]): Grade {
  // 높은 등급부터 확인해서 처음 맞는 등급
  const rule = [...GRADES].reverse().find((g) => g.meets(refs)) ?? GRADES[0];
  return { name: rule.name, level: rule.level, next: rule.next };
}
