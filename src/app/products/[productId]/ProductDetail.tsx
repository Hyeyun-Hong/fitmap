"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product, ReviewSummary } from "@/types/fitmap";
import { PART_LABEL, DEFAULT_BASIS } from "@/types/fitmap";
import { primaryOf, useReferences } from "@/lib/storage";
import { compareProduct, partsOf } from "@/lib/fit";
import { CATEGORY_LABEL, SUB_LABEL, won } from "@/lib/data";
import ProductImage from "@/components/ProductImage";
import RefPicker from "@/components/RefPicker";
import DiffList from "@/components/DiffList";
import ReviewCard from "@/components/ReviewCard";
import OpinionCard from "@/components/OpinionCard";
import { simText } from "@/components/SimilarityBadge";

const BASIS_TEXT: Record<string, string> = { circumference: "둘레", inseam: "인심", center_back: "화장" };

export default function ProductDetail({ product, review }: { product: Product; review: ReviewSummary | null }) {
  const refs = useReferences();
  const sameCat = useMemo(() => (refs ?? []).filter((r) => r.category === product.category), [refs, product.category]);
  const [picked, setPicked] = useState("");
  const reference = sameCat.find((r) => r.id === picked) ?? primaryOf(refs, product.category);

  const result = useMemo(() => (reference ? compareProduct(reference, product) : null), [reference, product]);
  const best = result?.bySize.find((s) => s.sizeLabel === result.recommendedSize);
  const parts = partsOf(product.category);

  return (
    <div className="space-y-5 px-5 py-5">
      <ProductImage label="상품 이미지는 공식 페이지에서 확인해 주세요" className="aspect-square w-full" />

      <section>
        <p className="text-xs text-neutral-500">
          {product.brandName} · {CATEGORY_LABEL[product.category]} · {SUB_LABEL[product.subCategory]}
        </p>
        <h2 className="mt-1 text-lg font-bold leading-snug">{product.name}</h2>
        <p className="mt-1">
          {product.price.sale !== null && product.price.regular !== null && product.price.sale < product.price.regular ? (
            <>
              <span className="mr-2 text-sm text-neutral-400 line-through">{won(product.price.regular)}</span>
              <span className="font-bold">{won(product.price.sale)}</span>
            </>
          ) : (
            <span className="font-bold">{won(product.price.sale ?? product.price.regular)}</span>
          )}
        </p>
        {product.material ? <p className="mt-1 text-xs text-neutral-500">소재 {product.material}</p> : null}
      </section>

      <section className="space-y-4 rounded-xl bg-neutral-50 p-4">
        <h3 className="text-sm font-bold">핏 분석</h3>
        {refs === null ? null : (
          <RefPicker refs={sameCat} value={reference?.id ?? ""} onChange={setPicked} categoryLabel={CATEGORY_LABEL[product.category]} />
        )}
        {result && product.sizes.length > 0 ? (
          <>
            {best && best.similarity !== null ? (
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-neutral-500">추천 사이즈</p>
                  <p className="text-3xl font-bold">{best.sizeLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">핏 유사도</p>
                  <p className={`text-3xl font-bold ${simText(best.similarity)}`}>{best.similarity}%</p>
                </div>
              </div>
            ) : null}
            {best ? <DiffList diffs={best.diffs} /> : null}
            {result.warnings.map((w) => (
              <p key={w} className="text-xs text-amber-700">
                {w}
              </p>
            ))}
            <p className="text-[11px] text-neutral-400">실측이 비슷해도 소재와 신축성에 따라 착용감은 다를 수 있어요.</p>
          </>
        ) : null}
        {product.sizes.length === 0 ? <p className="text-sm text-neutral-500">공식 페이지에서 실측 정보를 확인하지 못한 상품이에요.</p> : null}
      </section>

      {reference && result && result.recommendedSize ? (
        <OpinionCard reference={reference} product={product} result={result} review={review} />
      ) : null}

      <ReviewCard review={review} />

      {product.sizes.length > 0 ? (
        <section>
          <h3 className="mb-2 text-sm font-bold">사이즈별 실측 (cm)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2 text-left font-normal">사이즈</th>
                  {parts.map((p) => {
                    const b = product.measurementBasis?.[p] ?? DEFAULT_BASIS[p];
                    return (
                      <th key={p} className="py-2 font-normal">
                        {PART_LABEL[product.category][p]}
                        {BASIS_TEXT[b] ? <span className="block text-[10px] text-amber-600">({BASIS_TEXT[b]})</span> : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {product.sizes.map((s) => (
                  <tr key={s.label} className={`border-b border-neutral-100 ${s.label === result?.recommendedSize ? "bg-emerald-50 font-bold" : ""}`}>
                    <td className="py-2 text-left">{s.label}</td>
                    {parts.map((p) => (
                      <td key={p} className="py-2">
                        {s.measurements[p] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">
            출처: 공식 상품 페이지 · 확인일 {product.source.checkedAt ?? "미확인"}
            {product.source.note ? ` · ${product.source.note}` : ""}
          </p>
        </section>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Link href={`/compare/${product.id}`} className="rounded-xl border border-neutral-900 py-3 text-center text-sm font-bold">
          비교 결과 자세히
        </Link>
        <a href={product.officialUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-neutral-900 py-3 text-center text-sm font-bold text-white">
          공식 페이지에서 보기
        </a>
      </div>
    </div>
  );
}
