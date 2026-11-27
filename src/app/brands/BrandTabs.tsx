"use client";
import Link from "next/link";
import { useState } from "react";
import type { Brand, Category } from "@/types/fitmap";
import { CATEGORY_LABEL } from "@/lib/data";
import BrandLikeButton from "@/components/BrandLikeButton";

type Row = Brand & { topCount: number; bottomCount: number };

export default function BrandTabs({ brands }: { brands: Row[] }) {
  const [tab, setTab] = useState<Category>("top");
  const shown = brands.filter((b) => (tab === "top" ? b.topCount : b.bottomCount) > 0);
  return (
    <div>
      <div className="grid grid-cols-2 border-b border-neutral-200">
        {(["top", "bottom"] as Category[]).map((c) => (
          <button key={c} onClick={() => setTab(c)} className={`py-3 text-sm ${tab === c ? "border-b-2 border-neutral-900 font-bold" : "text-neutral-400"}`}>
            {CATEGORY_LABEL[c]} 브랜드
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-3 p-5">
        {shown.map((b) => (
          <li key={b.id} className="relative">
            <Link href={`/brands/${b.id}`} className="flex h-24 flex-col items-center justify-center rounded-xl border border-neutral-200 px-3 pt-6 text-center">
              <span className="font-bold">{b.name}</span>
              <span className="mt-1 text-xs text-neutral-400">상품 {tab === "top" ? b.topCount : b.bottomCount}개</span>
            </Link>
            <BrandLikeButton brandId={b.id} className="absolute right-2 top-2 h-8 w-8" />
          </li>
        ))}
      </ul>
    </div>
  );
}
