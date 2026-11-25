"use client";
import Link from "next/link";
import { useMemo } from "react";
import type { Product } from "@/types/fitmap";
import { primaryOf, useReferences } from "@/lib/storage";
import { compareProduct } from "@/lib/fit";
import { CATEGORY_LABEL, won } from "@/lib/data";
import ProductImage from "@/components/ProductImage";
import SimilarityBadge from "@/components/SimilarityBadge";

export default function ProductList({ items }: { items: Product[] }) {
  const refs = useReferences();
  const rows = useMemo(
    () =>
      items
        .map((p) => {
          const ref = primaryOf(refs, p.category);
          if (!ref) return { p, sim: null as number | null, size: null as string | null };
          const r = compareProduct(ref, p);
          const best = r.bySize.find((s) => s.sizeLabel === r.recommendedSize);
          return { p, sim: best?.similarity ?? null, size: r.recommendedSize };
        })
        .sort((a, b) => (b.sim ?? -1) - (a.sim ?? -1)),
    [items, refs],
  );

  return (
    <ul className="grid grid-cols-2 gap-3 p-5">
      {rows.map(({ p, sim, size }) => (
        <li key={p.id}>
          <Link href={`/products/${p.id}`} className="block">
            <ProductImage label={`${CATEGORY_LABEL[p.category]} · 이미지는 공식 페이지에서`} className="aspect-[3/4] w-full" />
            <p className="mt-2 line-clamp-2 text-sm font-semibold">{p.name}</p>
            <p className="mt-1 text-sm">{won(p.price.sale ?? p.price.regular)}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {p.sizes.length === 0 ? <span className="text-xs text-neutral-400">실측 없음</span> : <SimilarityBadge value={sim} />}
              {size ? <span className="text-xs text-neutral-500">{size}</span> : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
