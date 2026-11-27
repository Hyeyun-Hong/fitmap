// AI 프롬프트 모음
// REVIEW_ANALYSIS_PROMPT: 상품별 리뷰 분석 (사전 생성용. 채팅에서 사람이 돌리고 결과를 data/review-summaries.json에 저장)
// OPINION_SYSTEM_PROMPT: 개인 맞춤 종합 의견 (/api/opinion에서 실시간 호출)

import { AiOpinion, ComparisonResult, Product, ReferenceGarment, ReviewSummary } from "../types/fitmap";
import { describeDiff } from "./fit";

export const REVIEW_ANALYSIS_PROMPT = `아래는 [브랜드] [상품명]의 구매 리뷰다. 리뷰에 적힌 내용만 근거로 JSON으로 정리해라.
규칙:
- 리뷰에 없는 내용은 추측하지 말고 빈 배열로 둔다.
- 리뷰 문장을 그대로 옮기지 말고 요약한다.
- "크다/작다" 의견은 실측 수치와 별개로, 신축성·두께·세탁 후 수축 같은 착용감 언급 위주로 정리한다.
- JSON 외의 말은 쓰지 않는다.

{
  "productId": "",
  "reviewCount": 0,
  "sizeFit": {
    "overall": "작게 느껴짐 | 정사이즈 | 크게 느껴짐 | 의견 갈림",
    "ratio": { "small": 0, "true": 0, "large": 0 },
    "byPart": [{ "part": "어깨|가슴|기장|소매|허리|허벅지|밑위|밑단", "note": "" }],
    "stretch": "있음 | 약간 | 없음 | 언급 없음"
  },
  "materialQuality": { "pros": [], "cons": [] },
  "cautions": [],
  "confidence": "높음(30개 이상) | 보통(10~29개) | 낮음(9개 이하)",
  "source": { "description": "", "collectedAt": "YYYY-MM-DD" }
}

[리뷰 원문]`;

export const OPINION_SYSTEM_PROMPT = `너는 남성 의류 핏 비교 서비스 FIT MAP의 안내 문구 작성자다.
입력으로 사용자의 기준 옷, 비교 상품, 사이즈별 실측 차이, 추천 사이즈, 리뷰 분석 결과(JSON)를 받는다.

규칙:
- 숫자는 입력값만 쓴다. 새 수치를 만들거나 계산하지 않는다.
- 차이 해석은 입력에 주어진 문구(거의 같음 / 약간 큼 / 큼 등)를 따른다.
- 비교 불가 항목은 "비교 불가"라고만 쓰고 추정하지 않는다.
- 리뷰 분석이 없으면 실측 근거로만 쓴다. confidence가 "낮음"이면 "리뷰가 적어 참고 수준"이라고 밝힌다.
- 실측과 리뷰가 엇갈리면 둘 다 제시하고 단정하지 않는다.
- "딱 맞습니다", "보장", "정확히" 같은 단정 표현은 쓰지 않는다. 핏은 "유사도"로 표현한다.
- 존댓말(~요체), 자연스러운 한국어.

반드시 아래 JSON만 출력한다:
{"headline": "15자 이내", "opinion": "3~4문장", "recommendedSize": "사이즈 또는 null", "caution": "한 줄"}`;

/** /api/opinion에 보낼 사용자 메시지 */
export function buildOpinionInput(
  ref: ReferenceGarment,
  product: Product,
  result: ComparisonResult,
  review: ReviewSummary | null,
): string {
  const rec = result.bySize.find((s) => s.sizeLabel === result.recommendedSize);
  return JSON.stringify(
    {
      reference: { name: ref.name, brand: ref.brandName ?? null, size: ref.size ?? null },
      product: { brand: product.brandName, name: product.name },
      recommendedSize: result.recommendedSize,
      similarity: rec?.similarity ?? null,
      diffs: (rec?.diffs ?? []).map((d) => ({ part: d.label, diffCm: d.diff, meaning: describeDiff(d) })),
      warnings: result.warnings,
      review,
    },
    null,
    2,
  );
}

/** API 실패나 키 미설정 시 보여줄 고정 문장 (AI 없이 계산 결과로 만든다) */
/** 마지막 글자 받침에 맞춰 은/는을 붙인다 */
export const eunNeun = (word: string) => {
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return "은(는)";
  return (code - 0xac00) % 28 ? "은" : "는";
};

/** 유사도가 이보다 낮으면 "가장 비슷한 사이즈"라고만 말한다 */
const LOW_SIMILARITY = 50;

/** API 키가 없거나 호출이 실패했을 때 계산 결과만으로 만드는 종합 의견 */
export function fallbackOpinion(result: ComparisonResult): AiOpinion {
  const rec = result.bySize.find((s) => s.sizeLabel === result.recommendedSize);
  if (!rec || rec.similarity === null) {
    return {
      headline: "비교 정보 부족",
      opinion: "비교할 수 있는 실측 항목이 부족해 종합 의견을 만들지 못했어요. 공식 페이지의 사이즈표를 함께 확인해 주세요.",
      recommendedSize: null,
      caution: result.warnings[0] ?? "실측 비교는 착용감을 보장하지 않아요.",
      fallback: true,
    };
  }

  // "가슴단면은 4.5cm 크고, 소매길이는 27.3cm 작아요"처럼 이어 쓴다
  const differ = rec.diffs.filter((d) => d.diff !== null && d.status !== "same");
  const phrase = differ
    .map((d, i) => {
      const big = (d.diff as number) > 0;
      const slight = d.status === "slightly_larger" || d.status === "slightly_smaller";
      const last = i === differ.length - 1;
      const verb = big ? (last ? "커요" : "크고") : last ? "작아요" : "작고";
      return `${d.label}${eunNeun(d.label)} ${Math.abs(d.diff as number)}cm ${slight ? "약간 " : ""}${verb}`;
    })
    .join(", ");
  const unknown = rec.diffs.filter((d) => d.diff === null).map((d) => d.label);
  const unknownText = unknown.length ? ` ${unknown.join(", ")}${eunNeun(unknown.at(-1) as string)} 비교하지 못했어요.` : "";

  const low = rec.similarity < LOW_SIMILARITY;
  const lead = low
    ? `어느 사이즈도 기준 옷과 차이가 큰 편이에요. 그중 ${rec.sizeLabel} 사이즈가 가장 비슷해요.`
    : `${rec.sizeLabel} 사이즈가 기준 옷과 가장 비슷해요.`;
  const body = differ.length === 0 ? " 비교한 항목은 모두 1cm 이내로 거의 같아요." : ` 기준 옷보다 ${phrase}.`;

  // 차이가 가장 큰 부위를 짚어 준다(3cm 초과일 때만)
  const biggest = [...differ].sort((a, b) => Math.abs(b.diff as number) - Math.abs(a.diff as number))[0];
  const caution =
    result.warnings[0] ??
    (biggest && (biggest.status === "larger" || biggest.status === "smaller")
      ? `${biggest.label} 차이가 가장 커요. 이 부분의 핏은 리뷰나 공식 사이즈표로 한 번 더 확인해 보세요.`
      : unknown.length
        ? "비교하지 못한 항목은 공식 페이지 사이즈표에서 직접 확인해 주세요."
        : "실측이 비슷해도 소재와 신축성에 따라 착용감은 다를 수 있어요.");

  return {
    headline: low ? `가장 비슷한 사이즈 ${rec.sizeLabel}` : `${rec.sizeLabel} 사이즈 유사도 ${rec.similarity}%`,
    opinion: lead + body + unknownText,
    recommendedSize: rec.sizeLabel,
    caution,
    fallback: true,
  };
}
