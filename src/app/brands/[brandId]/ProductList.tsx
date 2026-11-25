"use client";
import type { Product } from "@/types/fitmap";
import { bySimilarity, useScored } from "@/lib/useSimilarity";
import ProductCard from "@/components/ProductCard";

export default function ProductList({ items }: { items: Product[] }) {
  const { scored } = useScored(items);
  return (
    <ul className="grid grid-cols-2 gap-3 p-5">
      {[...scored].sort(bySimilarity).map((it) => (
        <li key={it.product.id}>
          <ProductCard item={it} />
        </li>
      ))}
    </ul>
  );
}
