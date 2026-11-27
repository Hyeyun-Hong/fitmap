import type { ReviewSummary } from "@/types/fitmap";

export default function ReviewCard({ review }: { review: ReviewSummary | null }) {
  // 리뷰 분석 데이터가 없는 상품은 영역 자체를 숨긴다(CLAUDE.md AI 규칙)
  if (!review) return null;
  const r = review.sizeFit.ratio;
  const total = r.small + r.true + r.large;
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
        {total > 0 ? (
          <div className="my-2">
            <div className="flex h-2 overflow-hidden rounded-full bg-neutral-100">
              <div className="bg-sky-400" style={{ width: `${(r.small / total) * 100}%` }} />
              <div className="bg-emerald-500" style={{ width: `${(r.true / total) * 100}%` }} />
              <div className="bg-rose-400" style={{ width: `${(r.large / total) * 100}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
              <span>작아요 {Math.round((r.small / total) * 100)}%</span>
              <span>정사이즈 {Math.round((r.true / total) * 100)}%</span>
              <span>커요 {Math.round((r.large / total) * 100)}%</span>
            </div>
          </div>
        ) : null}
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
      <p className="text-[11px] text-neutral-400">
        {review.source.description}
        {review.source.collectedAt ? ` · 수집일 ${review.source.collectedAt}` : ""}
      </p>
    </section>
  );
}
