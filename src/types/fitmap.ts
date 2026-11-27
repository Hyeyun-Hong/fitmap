// FIT MAP 공통 데이터 타입
// 이 파일은 팀 전체가 공유한다. 필드를 바꿀 때는 PR 설명에 이유를 적고 팀에 알린다.

/** 상의 / 하의 */
export type Category = "top" | "bottom";

/** 세부 카테고리. 비교는 같은 Category끼리만 하고, 아우터는 별도 경고를 띄운다. */
export type TopSubCategory = "tshirt" | "shirt" | "knit" | "sweat" | "outer";
export type BottomSubCategory = "denim" | "slacks" | "cotton" | "jogger" | "etc";
export type SubCategory = TopSubCategory | BottomSubCategory;

/** 비교 항목 (FIT MAP 기준) */
export type TopPart = "shoulder" | "chest" | "length" | "sleeve";
export type BottomPart = "waist" | "thigh" | "rise" | "hem" | "length";
export type Part = TopPart | BottomPart;

export const TOP_PARTS: TopPart[] = ["shoulder", "chest", "length", "sleeve"];
export const BOTTOM_PARTS: BottomPart[] = ["waist", "thigh", "rise", "hem", "length"];

/** 화면에 보여줄 한글 이름 */
export const PART_LABEL: Record<Category, Partial<Record<Part, string>>> = {
  top: { shoulder: "어깨너비", chest: "가슴단면", length: "총장", sleeve: "소매길이" },
  bottom: { waist: "허리단면", thigh: "허벅지단면", rise: "밑위", hem: "밑단단면", length: "총장" },
};

/**
 * 측정 기준. 브랜드마다 재는 방식이 달라서 값과 함께 기록한다.
 * - flat: 단면(옷을 펼쳐 한쪽 폭). FIT MAP 기본값.
 * - circumference: 둘레. 계산 시 ÷2 해서 단면으로 바꾼다.
 * - total: 총장(상의: 목 옆~밑단 / 하의: 허리~밑단)
 * - inseam: 인심·다리 길이(가랑이~밑단). 총장과 서로 바꿔 계산하지 않는다.
 * - shoulder_seam: 소매길이(어깨 솔기~소매 끝). 기본값.
 * - center_back: 화장(등 중심~소매 끝, 유니클로 등). 소매길이와 서로 비교하지 않는다.
 * - front: 앞밑위. 표기가 없으면 앞밑위로 본다.
 */
export type Basis =
  | "flat"
  | "circumference"
  | "total"
  | "inseam"
  | "shoulder_seam"
  | "center_back"
  | "front";

/** 항목별 측정 기준. 적지 않은 항목은 DEFAULT_BASIS를 따른다. */
export type MeasurementBasis = Partial<Record<Part, Basis>>;

export const DEFAULT_BASIS: Record<Part, Basis> = {
  shoulder: "flat",
  chest: "flat",
  length: "total",
  sleeve: "shoulder_seam",
  waist: "flat",
  thigh: "flat",
  rise: "front",
  hem: "flat",
};

/** 한 사이즈의 실측값(cm). 없는 항목은 키를 빼거나 null. 절대 추정해서 채우지 않는다. */
export type Measurements = Partial<Record<Part, number | null>>;

export interface SizeMeasurement {
  /** 브랜드 표기 그대로: "M", "30", "28(074)", "EU 38" 등 */
  label: string;
  measurements: Measurements;
}

export interface Product {
  /** 팀 내부 ID: "P001" 형식 */
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  category: Category;
  subCategory: SubCategory;
  /** 브랜드 공식 상품 URL (입점 플랫폼 URL이면 source.note에 적는다) */
  officialUrl: string;
  price: { regular: number | null; sale: number | null };
  colors: string[];
  sizeOptions: string[];
  material?: string;
  madeIn?: string;
  /** 사이즈별 실측. 실측이 없으면 빈 배열 */
  sizes: SizeMeasurement[];
  measurementBasis?: MeasurementBasis;
  /** full: FIT MAP 비교 항목 전부 / partial: 일부 / none: 없음 */
  measurementStatus: "full" | "partial" | "none";
  /** 이미지 사용 권한이 확인된 경우에만 imageUrl을 채운다 */
  imageUrl: string | null;
  source: {
    /** 실측을 확인한 페이지 */
    url: string;
    /** 확인일 YYYY-MM-DD. 모르면 null */
    checkedAt: string | null;
    /** 측정 기준 확인 여부, 이미지형 실측표 등 특이사항 */
    note?: string;
  };
}

export interface Brand {
  id: string;
  name: string;
  /** 이 브랜드를 어느 목록에 보여줄지 */
  categories: Category[];
  officialUrl: string;
}

/** 사용자가 등록한 기준 옷 (MVP에서는 localStorage에 저장) */
export interface ReferenceGarment {
  id: string;
  name: string;
  brandName?: string;
  category: Category;
  subCategory: SubCategory;
  size?: string;
  officialUrl?: string;
  measurements: Measurements;
  measurementBasis?: MeasurementBasis;
  /** FIT MAP 상품에서 골라 자동 입력했는지, 직접 쟀는지 */
  inputMethod: "from_product" | "manual";
  /** "상품에서 불러오기"로 등록했을 때 불러온 상품 ID(Product.id). 직접 입력했거나 이 필드가 생기기 전에 저장한 옷은 없음 */
  sourceProductId?: string;
  /** 상의·하의 각각 대표 기준 옷 1개 */
  isPrimary: boolean;
  createdAt: string;
}

// ---------- 상품 목록 ----------

/** 상품 목록 정렬: 기본순(핏 유사도 높은 순) / 낮은 가격순 / 높은 가격순 */
export type ListSort = "default" | "price_asc" | "price_desc";

// ---------- 비교 결과 ----------

export type DiffStatus =
  | "same" // |차이| <= 1cm
  | "slightly_larger" // 1 < 차이 <= 3
  | "slightly_smaller"
  | "larger" // 차이 > 3
  | "smaller"
  | "missing" // 한쪽 값이 없음
  | "basis_mismatch"; // 측정 기준이 달라 비교 불가 (총장 vs 인심, 소매 vs 화장)

export interface PartDiff {
  part: Part;
  label: string;
  /** 단면 기준으로 환산한 값 */
  reference: number | null;
  target: number | null;
  /** target - reference (cm, 소수 첫째 자리). 비교 불가면 null */
  diff: number | null;
  status: DiffStatus;
}

export interface SizeComparison {
  sizeLabel: string;
  diffs: PartDiff[];
  /** 0~100. 비교 가능한 항목이 MIN_COMPARABLE_PARTS 미만이면 null */
  similarity: number | null;
  comparableCount: number;
}

export interface ComparisonResult {
  productId: string;
  referenceId: string;
  bySize: SizeComparison[];
  /** 유사도가 가장 높은 사이즈. 계산 불가면 null */
  recommendedSize: string | null;
  warnings: string[];
}

// ---------- AI ----------

/** 상품별 리뷰 분석 결과 (사전 생성, data/review-summaries.json) */
export interface ReviewSummary {
  productId: string;
  reviewCount: number;
  sizeFit: {
    overall: "작게 느껴짐" | "정사이즈" | "크게 느껴짐" | "의견 갈림";
    ratio: { small: number; true: number; large: number };
    byPart: { part: string; note: string }[];
    stretch: "있음" | "약간" | "없음" | "언급 없음";
  };
  materialQuality: { pros: string[]; cons: string[] };
  cautions: string[];
  confidence: "높음" | "보통" | "낮음";
  /** 리뷰 출처와 수집일 */
  source: { description: string; collectedAt: string | null };
}

/** /api/opinion 응답 */
export interface AiOpinion {
  headline: string;
  opinion: string;
  recommendedSize: string | null;
  caution: string;
  /** API 실패로 고정 문장을 썼으면 true */
  fallback: boolean;
}
