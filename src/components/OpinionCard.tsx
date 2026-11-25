"use client";
import { useEffect, useState } from "react";
import type { AiOpinion, ComparisonResult, Product, ReferenceGarment, ReviewSummary } from "@/types/fitmap";
import { buildOpinionInput, fallbackOpinion } from "@/lib/prompts";

/** AI 종합 의견. 먼저 계산 결과로 만든 문장을 보여주고, API가 응답하면 바꿔 끼운다. */
export default function OpinionCard({
  reference,
  product,
  result,
  review,
}: {
  reference: ReferenceGarment;
  product: Product;
  result: ComparisonResult;
  review: ReviewSummary | null;
}) {
  const [ai, setAi] = useState<AiOpinion | null>(null);
  const opinion = ai ?? fallbackOpinion(result);

  useEffect(() => {
    if (!result.recommendedSize) return;
    let alive = true;
    fetch("/api/opinion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: buildOpinionInput(reference, product, result, review) }),
    })
      .then((r) => r.json())
      .then((data: AiOpinion) => {
        if (alive && data && !data.fallback) setAi(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [reference, product, result, review]);

  return (
    <section className="rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">종합 의견</h3>
        <span className="text-[11px] text-neutral-400">{opinion.fallback ? "계산 결과 기반" : "AI 생성"}</span>
      </div>
      <p className="mt-2 font-bold">{opinion.headline}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-700">{opinion.opinion}</p>
      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{opinion.caution}</p>
    </section>
  );
}
