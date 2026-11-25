"use client";
import { useMemo } from "react";
import { products } from "@/lib/data";
import { bySimilarity, useScored } from "@/lib/useSimilarity";
import ProductCard from "@/components/ProductCard";

export default function HomeClient() {
  const { refs, scored } = useScored(products);
  const hasRef = (refs ?? []).length > 0;

  const picks = useMemo(() => {
    if (hasRef) return scored.filter((s) => s.similarity !== null).sort(bySimilarity).slice(0, 8);
    return scored.filter((s) => s.product.measurementStatus === "full").slice(0, 8);
  }, [scored, hasRef]);

  if (refs === null) return <div className="h-72" />;

  return (
    <section className="pt-6">
      <div className="px-5">
        <h2 className="font-bold">{hasRef ? "내 기준 옷과 핏이 비슷한 상품" : "실측으로 비교할 수 있는 상품"}</h2>
        <p className="mt-1 text-xs text-neutral-500">{hasRef ? "핏 유사도가 높은 순서예요" : "기준 옷을 등록하면 나에게 맞춰 추천해 드려요"}</p>
      </div>
      <ul className="mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
        {picks.map((it) => (
          <li key={it.product.id} className="w-40 shrink-0 snap-start">
            <ProductCard item={it} />
          </li>
        ))}
      </ul>
    </section>
  );
}
