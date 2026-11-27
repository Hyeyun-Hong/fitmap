"use client";
// 마이페이지 '찜한 상품' 가로 목록. PREVIEW개까지만 보여주고, 나머지는 끝에서 더 밀거나 '전체 보기'로 본다.
import { useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { useScored } from "@/lib/useSimilarity";
import type { Product } from "@/types/fitmap";
import PullToAllRow, { PREVIEW } from "./PullToAllRow";

export default function LikedProductsRow({ products }: { products: Product[] }) {
  const preview = useMemo(() => products.slice(0, PREVIEW), [products]);
  const { scored } = useScored(preview);
  return (
    <PullToAllRow allHref="/mypage/likes" hasMore={products.length > PREVIEW}>
      {scored.map((it) => (
        <li key={it.product.id} className="w-36 shrink-0">
          <ProductCard item={it} />
        </li>
      ))}
    </PullToAllRow>
  );
}
