"use client";
// 마이페이지 '찜한 브랜드' 가로 목록. PREVIEW개까지만 보여주고, 나머지는 끝에서 더 밀거나 '전체 보기'로 본다.
import Link from "next/link";
import { productsByBrand } from "@/lib/data";
import type { Brand } from "@/types/fitmap";
import PullToAllRow, { PREVIEW } from "./PullToAllRow";

export default function LikedBrandsRow({ brands }: { brands: Brand[] }) {
  return (
    <PullToAllRow allHref="/mypage/likes?tab=brand" hasMore={brands.length > PREVIEW}>
      {brands.slice(0, PREVIEW).map((b) => (
        <li key={b.id} className="shrink-0">
          <Link href={`/brands/${b.id}`} className="flex min-w-28 flex-col rounded-xl border border-neutral-200 px-4 py-3">
            <span className="whitespace-nowrap text-[15px] font-semibold">{b.name}</span>
            <span className="mt-1 text-xs text-neutral-400">상품 {productsByBrand(b.id).length}개 ›</span>
          </Link>
        </li>
      ))}
    </PullToAllRow>
  );
}
