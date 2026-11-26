"use client";
import Link from "next/link";
import { useMemo } from "react";
import { getProduct } from "@/lib/data";
import { useScored } from "@/lib/useSimilarity";
import type { Product } from "@/types/fitmap";
import ProductCard from "./ProductCard";

/** 찜·최근 본 상품처럼 상품 ID 목록을 카드로 보여준다. */
/** limit: 앞에서부터 몇 개만 보여줄지(마이페이지 미리보기용). 없으면 전부 */
export default function SavedProducts({ ids, empty, limit }: { ids: string[] | null; empty: string; limit?: number }) {
  const items = useMemo(
    () => (ids ?? []).map(getProduct).filter((p): p is Product => Boolean(p)).slice(0, limit),
    [ids, limit],
  );
  const { scored } = useScored(items);
  if (ids === null) return null;
  if (items.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-sm text-neutral-500">{empty}</p>
        <Link href="/" className="mt-4 inline-block rounded-lg border border-neutral-300 px-4 py-2 text-sm">
          상품 보러 가기
        </Link>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 p-5">
      {scored.map((it) => (
        <li key={it.product.id}>
          <ProductCard item={it} />
        </li>
      ))}
    </ul>
  );
}
