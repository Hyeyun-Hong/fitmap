"use client";
import type { Product } from "@/types/fitmap";
import { bySimilarity, useScored } from "@/lib/useSimilarity";
import ProductCard from "@/components/ProductCard";

export default function CategoryList({ items }: { items: Product[] }) {
  const { scored } = useScored(items);
  return (
    <>
      <p className="px-5 pt-3 text-xs text-neutral-500">상품 {items.length}개 · 핏 유사도 높은 순</p>
      <ul className="grid grid-cols-2 gap-3 p-5">
        {[...scored].sort(bySimilarity).map((it) => (
          <li key={it.product.id}>
            <ProductCard item={it} />
          </li>
        ))}
      </ul>
    </>
  );
}
