"use client";
import { useMemo, useState } from "react";
import type { Product, ReviewSummary } from "@/types/fitmap";
import { primaryOf, useReferences } from "@/lib/storage";
import { compareProduct } from "@/lib/fit";
import { CATEGORY_LABEL } from "@/lib/data";
import RefPicker from "@/components/RefPicker";
import DiffList from "@/components/DiffList";
import FitOverlay from "@/components/FitOverlay";
import OpinionCard from "@/components/OpinionCard";
import { simText } from "@/components/SimilarityBadge";
import ReviewCard from "@/components/ReviewCard";

export default function CompareView({ product, review }: { product: Product; review: ReviewSummary | null }) {
  const refs = useReferences();
  const sameCat = useMemo(() => (refs ?? []).filter((r) => r.category === product.category), [refs, product.category]);
  const [picked, setPicked] = useState("");
  const [size, setSize] = useState("");
  const reference = sameCat.find((r) => r.id === picked) ?? primaryOf(refs, product.category);
  const result = useMemo(() => (reference ? compareProduct(reference, product) : null), [reference, product]);
  const shownLabel = size && result?.bySize.some((s) => s.sizeLabel === size) ? size : result?.recommendedSize;
  const shown = result?.bySize.find((s) => s.sizeLabel === shownLabel);

  if (refs === null) return null;

  return (
    <div className="space-y-5 px-5 py-5">
      <RefPicker refs={sameCat} value={reference?.id ?? ""} onChange={setPicked} categoryLabel={CATEGORY_LABEL[product.category]} />

      {reference && result ? (
        <>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-xs text-neutral-400">내 기준 옷</p>
              <p className="mt-1 line-clamp-2 font-semibold">{reference.name}</p>
              <p className="text-xs text-neutral-500">{reference.size ?? ""}</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-xs text-neutral-400">비교 상품</p>
              <p className="mt-1 line-clamp-2 font-semibold">{product.name}</p>
              <p className="text-xs text-neutral-500">{product.brandName}</p>
            </div>
          </div>

          {result.bySize.length > 0 ? (
            <section>
              <p className="mb-2 text-xs text-neutral-500">사이즈를 눌러 비교해 보세요</p>
              <div className="flex flex-wrap gap-2">
                {result.bySize.map((s) => (
                  <button
                    key={s.sizeLabel}
                    onClick={() => setSize(s.sizeLabel)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${s.sizeLabel === shownLabel ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200"}`}
                  >
                    {s.sizeLabel}
                    {s.similarity !== null ? <span className="ml-1 text-xs opacity-70">{s.similarity}%</span> : null}
                    {s.sizeLabel === result.recommendedSize ? <span className="ml-1 text-xs text-emerald-500">추천</span> : null}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {shown ? (
            <section className="rounded-xl border border-neutral-200 p-4">
              <div className="mb-4 flex items-end justify-between">
                <p className="text-2xl font-bold">{shown.sizeLabel}</p>
                <p className="text-right">
                  <span className="block text-xs text-neutral-500">핏 유사도</span>
                  <span className={`text-2xl font-bold ${simText(shown.similarity)}`}>{shown.similarity === null ? "-" : `${shown.similarity}%`}</span>
                </p>
              </div>
              {shown.similarity !== null && shown.similarity < 50 ? (
                <p className="mb-3 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                  유사도가 낮아요. 기준 옷과 핏이 다른 옷일 수 있어요.
                </p>
              ) : null}
              <DiffList diffs={shown.diffs} />
            </section>
          ) : null}
          {shown ? (
            <div className="rounded-xl bg-neutral-50 p-1">
              <FitOverlay category={product.category} diffs={shown.diffs} sizeLabel={shown.sizeLabel} lengthBasis={product.measurementBasis?.length} refLengthBasis={reference?.measurementBasis?.length} />
            </div>
          ) : null}

          {result.warnings.map((w) => (
            <p key={w} className="text-xs text-amber-700">
              {w}
            </p>
          ))}

          {result.recommendedSize || review ? (
            <section className="space-y-3">
              <h3 className="text-sm font-bold">AI 비교 분석</h3>
              {result.recommendedSize ? <OpinionCard reference={reference} product={product} result={result} review={review} /> : null}
              <ReviewCard review={review} />
            </section>
          ) : null}

          <p className="text-[11px] leading-relaxed text-neutral-400">
            핏 유사도는 기준 옷과 실측이 얼마나 비슷한지를 나타낸 값이에요. 실측이 비슷해도 소재와 신축성에 따라 착용감은 다를 수 있어요.
          </p>
        </>
      ) : null}

      <a href={product.officialUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-neutral-900 py-4 text-center font-bold text-white">
        공식 페이지에서 보기
      </a>
    </div>
  );
}
