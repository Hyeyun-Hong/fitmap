"use client";
import { useState } from "react";
import type { ListSort, Product } from "@/types/fitmap";
import { sortScored, useScored } from "@/lib/useSimilarity";
import ProductCard from "@/components/ProductCard";
import SortTabs from "@/components/SortTabs";

export default function ProductList({ items }: { items: Product[] }) {
  const { scored } = useScored(items);
  const [sort, setSort] = useState<ListSort>("default");
  return (
    <>
      <div className="px-5 pt-3">
        <SortTabs value={sort} onChange={setSort} />
      </div>
      <ul className="grid grid-cols-2 gap-3 p-5">
        {sortScored(scored, sort).map((it) => (
          <li key={it.product.id}>
            <ProductCard item={it} />
          </li>
        ))}
      </ul>
    </>
  );
}
