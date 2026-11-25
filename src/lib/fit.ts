// FIT MAP 실측 비교 계산
// 숫자(차이, 유사도, 추천 사이즈)는 전부 여기서 계산한다. AI는 이 결과를 설명만 한다.
// 아래 PARAMS 값은 팀이 정한 초기값이며 검증된 수치가 아니다. 바꿀 때는 테스트도 같이 고친다.

import {
  BOTTOM_PARTS,
  Basis,
  Category,
  ComparisonResult,
  DEFAULT_BASIS,
  DiffStatus,
  MeasurementBasis,
  Measurements,
  PART_LABEL,
  Part,
  PartDiff,
  Product,
  ReferenceGarment,
  SizeComparison,
  TOP_PARTS,
} from "../types/fitmap";

export const PARAMS = {
  /** |차이|가 이 값 이하면 "거의 같음" */
  sameThreshold: 1,
  /** |차이|가 이 값 이하면 "약간", 넘으면 "차이 큼" */
  slightThreshold: 3,
  /** 유사도 계산에 필요한 최소 비교 항목 수 */
  minComparableParts: 2,
  /** 항목별 허용 범위(cm). 차이가 이만큼이면 그 항목 점수 0 */
  tolerance: {
    top: { shoulder: 6, chest: 8, length: 8, sleeve: 8 },
    bottom: { waist: 6, thigh: 6, rise: 5, hem: 5, length: 8 },
  } as Record<Category, Partial<Record<Part, number>>>,
  /** 항목별 가중치. 핏에 크게 영향 주는 항목을 높게 */
  weight: {
    top: { shoulder: 0.3, chest: 0.3, length: 0.2, sleeve: 0.2 },
    bottom: { waist: 0.3, thigh: 0.25, rise: 0.2, hem: 0.1, length: 0.15 },
  } as Record<Category, Partial<Record<Part, number>>>,
};

export const partsOf = (category: Category): Part[] =>
  category === "top" ? TOP_PARTS : BOTTOM_PARTS;

const round1 = (n: number) => Math.round(n * 10) / 10;

const basisOf = (part: Part, basis?: MeasurementBasis): Basis =>
  basis?.[part] ?? DEFAULT_BASIS[part];

/**
 * 측정값을 비교용으로 정규화한다.
 * 둘레는 ÷2 해서 단면으로 바꾸고, 나머지는 그대로 둔다.
 * 반환하는 basis는 "비교 가능한 기준"이다(둘레 → flat).
 */
export function normalize(
  part: Part,
  value: number | null | undefined,
  basis?: MeasurementBasis,
): { value: number | null; basis: Basis } {
  const b = basisOf(part, basis);
  if (value === null || value === undefined || Number.isNaN(value)) {
    return { value: null, basis: b === "circumference" ? "flat" : b };
  }
  if (b === "circumference") return { value: round1(value / 2), basis: "flat" };
  return { value, basis: b };
}

export function statusOf(diff: number): DiffStatus {
  const a = Math.abs(diff);
  if (a <= PARAMS.sameThreshold) return "same";
  if (a <= PARAMS.slightThreshold) return diff > 0 ? "slightly_larger" : "slightly_smaller";
  return diff > 0 ? "larger" : "smaller";
}

/** 기준 옷 vs 상품의 한 사이즈 비교 */
export function compareSize(
  category: Category,
  ref: { measurements: Measurements; basis?: MeasurementBasis },
  target: { label: string; measurements: Measurements; basis?: MeasurementBasis },
): SizeComparison {
  const diffs: PartDiff[] = partsOf(category).map((part) => {
    const r = normalize(part, ref.measurements[part], ref.basis);
    const t = normalize(part, target.measurements[part], target.basis);
    const label = PART_LABEL[category][part] ?? part;

    if (r.value === null || t.value === null) {
      return { part, label, reference: r.value, target: t.value, diff: null, status: "missing" };
    }
    if (r.basis !== t.basis) {
      return { part, label, reference: r.value, target: t.value, diff: null, status: "basis_mismatch" };
    }
    const diff = round1(t.value - r.value);
    return { part, label, reference: r.value, target: t.value, diff, status: statusOf(diff) };
  });

  const comparable = diffs.filter((d) => d.diff !== null);
  let similarity: number | null = null;

  if (comparable.length >= PARAMS.minComparableParts) {
    let sumW = 0;
    let sumScore = 0;
    for (const d of comparable) {
      const w = PARAMS.weight[category][d.part] ?? 0;
      const tol = PARAMS.tolerance[category][d.part] ?? 6;
      const score = Math.max(0, 1 - Math.abs(d.diff as number) / tol);
      sumW += w;
      sumScore += w * score;
    }
    similarity = sumW > 0 ? Math.round((sumScore / sumW) * 100) : null;
  }

  return { sizeLabel: target.label, diffs, similarity, comparableCount: comparable.length };
}

/** 같은 유사도일 때 쓰는 보조 기준: 비교 가능 항목의 |차이| 합이 작은 쪽 */
const totalAbsDiff = (s: SizeComparison) =>
  s.diffs.reduce((acc, d) => acc + (d.diff === null ? 0 : Math.abs(d.diff)), 0);

/** 기준 옷 vs 상품 전체 사이즈 비교 + 추천 사이즈 */
export function compareProduct(ref: ReferenceGarment, product: Product): ComparisonResult {
  const warnings: string[] = [];

  if (ref.category !== product.category) {
    return {
      productId: product.id,
      referenceId: ref.id,
      bySize: [],
      recommendedSize: null,
      warnings: ["상의와 하의는 서로 비교할 수 없어요. 같은 카테고리의 기준 옷을 선택해 주세요."],
    };
  }
  if (product.sizes.length === 0) {
    return {
      productId: product.id,
      referenceId: ref.id,
      bySize: [],
      recommendedSize: null,
      warnings: ["이 상품은 공식 페이지에서 실측 정보를 확인하지 못했어요."],
    };
  }
  const isOuter = (s: string) => s === "outer";
  if (isOuter(ref.subCategory) !== isOuter(product.subCategory)) {
    warnings.push("아우터와 일반 상의는 입는 방식이 달라 실측이 비슷해도 착용감이 다를 수 있어요.");
  }

  const bySize = product.sizes.map((s) =>
    compareSize(
      product.category,
      { measurements: ref.measurements, basis: ref.measurementBasis },
      { label: s.label, measurements: s.measurements, basis: product.measurementBasis },
    ),
  );

  const ranked = bySize
    .filter((s) => s.similarity !== null)
    .sort((a, b) => (b.similarity as number) - (a.similarity as number) || totalAbsDiff(a) - totalAbsDiff(b));

  const recommendedSize = ranked[0]?.sizeLabel ?? null;
  if (recommendedSize === null) {
    warnings.push(`비교할 수 있는 항목이 ${PARAMS.minComparableParts}개 미만이라 유사도를 계산하지 않았어요.`);
  }
  if (bySize.some((s) => s.diffs.some((d) => d.status === "basis_mismatch"))) {
    warnings.push("측정 기준이 달라 비교에서 제외한 항목이 있어요.");
  }

  return { productId: product.id, referenceId: ref.id, bySize, recommendedSize, warnings };
}

/** 화면 문구용: 차이를 사람이 읽는 말로 */
export function describeDiff(d: PartDiff): string {
  switch (d.status) {
    case "missing":
      return "비교 불가 (실측 없음)";
    case "basis_mismatch":
      return "비교 불가 (측정 기준 다름)";
    case "same":
      return "거의 같음";
    case "slightly_larger":
      return `${d.diff}cm 약간 큼`;
    case "slightly_smaller":
      return `${Math.abs(d.diff as number)}cm 약간 작음`;
    case "larger":
      return `${d.diff}cm 큼`;
    case "smaller":
      return `${Math.abs(d.diff as number)}cm 작음`;
  }
}
