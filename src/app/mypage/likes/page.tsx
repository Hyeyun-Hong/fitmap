"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import SavedProducts from "@/components/SavedProducts";
import { getBrand, productsByBrand } from "@/lib/data";
import { useBrandLikes, useLikes } from "@/lib/storage";
import type { Brand } from "@/types/fitmap";

type Tab = "brand" | "product";

export default function LikesPage() {
  const likes = useLikes();
  const brandLikes = useBrandLikes();
  const [tab, setTab] = useState<Tab>("product");
  const tabs: { key: Tab; label: string; count: number | undefined }[] = [
    // 데이터에서 빠진 브랜드 ID는 목록에 안 나오므로 개수에서도 뺀다
    { key: "brand", label: "브랜드", count: brandLikes?.filter((id) => getBrand(id)).length },
    { key: "product", label: "상품", count: likes?.length },
  ];

  return (
    <main className="flex-1">
      <Header title="찜" back="/mypage" />
      <div role="tablist" className="grid grid-cols-2 border-b border-neutral-200 px-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 py-3 text-sm font-bold ${tab === t.key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"}`}
          >
            {t.label} {t.count ?? ""}
          </button>
        ))}
      </div>
      {tab === "product" ? (
        <SavedProducts ids={likes} empty="찜한 상품이 없어요. 상품의 하트를 눌러 담아 보세요." />
      ) : (
        <SavedBrands ids={brandLikes} />
      )}
    </main>
  );
}

function SavedBrands({ ids }: { ids: string[] | null }) {
  const items = useMemo(() => (ids ?? []).map(getBrand).filter((b): b is Brand => Boolean(b)), [ids]);
  if (ids === null) return null;
  if (items.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-sm text-neutral-500">찜한 브랜드가 없어요. 브랜드 페이지의 하트를 눌러 담아 보세요.</p>
        <Link href="/brands" className="mt-4 inline-block rounded-lg border border-neutral-300 px-4 py-2 text-sm">
          브랜드 보러 가기
        </Link>
      </div>
    );
  }
  return (
    <ul className="mx-5 divide-y divide-neutral-100 border-b border-neutral-100">
      {items.map((b) => (
        <li key={b.id}>
          <Link href={`/brands/${b.id}`} className="flex items-center justify-between py-4">
            <span className="text-[15px] font-semibold">{b.name}</span>
            <span className="text-sm text-neutral-400">상품 {productsByBrand(b.id).length}개 ›</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
