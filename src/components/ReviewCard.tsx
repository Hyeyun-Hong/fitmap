import type { ReviewSummary } from "@/types/fitmap";

export default function ReviewCard({ review }: { review: ReviewSummary | null }) {
  if (!review) {
    return (
      <section className="rounded-xl border border-dashed border-neutral-300 p-4">
        <h3 className="text-sm font-bold">리뷰 분석</h3>
        <p className="mt-1 text-sm text-neutral-500">이 상품의 리뷰 분석을 준비하고 있어요.</p>
      </section>
    );
  }
  return (
    <section className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">리뷰 분석</h3>
        <span className="text-[11px] text-neutral-400">
          리뷰 {review.reviewCount}개 · 신뢰도 {review.confidence}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-neutral-500">사이즈·핏</p>
        <p className="text-sm">
          {review.sizeFit.overall} · 신축성 {review.sizeFit.stretch}
        </p>
        {review.sizeFit.byPart.map((b) => (
          <p key={b.part} className="text-sm text-neutral-600">
            {b.part}: {b.note}
          </p>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold text-neutral-500">소재·품질</p>
        {review.materialQuality.pros.map((t) => (
          <p key={t} className="text-sm">+ {t}</p>
        ))}
        {review.materialQuality.cons.map((t) => (
          <p key={t} className="text-sm text-neutral-600">- {t}</p>
        ))}
      </div>
      {review.cautions.length ? (
        <div>
          <p className="text-xs font-semibold text-neutral-500">구매 시 주의사항</p>
          {review.cautions.map((t) => (
            <p key={t} className="text-sm">· {t}</p>
          ))}
        </div>
      ) : null}
      {review.confidence === "낮음" ? <p className="text-xs text-neutral-400">리뷰가 적어 참고용이에요.</p> : null}
    </section>
  );
}
