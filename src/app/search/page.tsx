"use client";
import { useMemo, useState } from "react";
import { products, matchesQuery, normalizeQuery } from "@/lib/data";
import { bySimilarity, useScored } from "@/lib/useSimilarity";
import ProductCard from "@/components/ProductCard";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const { scored } = useScored(products);
  const query = normalizeQuery(q);
  const results = useMemo(() => {
    if (!query) return [];
    return scored
      .filter(({ product: p }) => matchesQuery(p, query))
      .sort(bySimilarity);
  }, [scored, query]);

  return (
    <main className="flex-1 px-5 pt-4">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="브랜드나 상품명을 검색해 보세요"
        className="h-11 w-full rounded-xl bg-neutral-100 px-4 text-sm outline-none"
      />
      {query ? (
        <p className="mt-4 text-xs text-neutral-500">검색 결과 {results.length}개</p>
      ) : (
        <p className="mt-4 text-xs text-neutral-500">예: 유니클로, 데님, 셔츠</p>
      )}
      <ul className="mt-3 grid grid-cols-2 gap-3">
        {results.map((it) => (
          <li key={it.product.id}>
            <ProductCard item={it} />
          </li>
        ))}
      </ul>
    </main>
  );
}
