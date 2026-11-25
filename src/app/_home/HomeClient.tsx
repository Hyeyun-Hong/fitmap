"use client";
import Link from "next/link";
import { useMemo } from "react";
import { primaryOf, useReferences } from "@/lib/storage";
import { products, CATEGORY_LABEL } from "@/lib/data";
import { compareProduct } from "@/lib/fit";
import type { Category } from "@/types/fitmap";
import SimilarityBadge from "@/components/SimilarityBadge";
import ProductImage from "@/components/ProductImage";

export default function HomeClient() {
  const refs = useReferences();

  const picks = useMemo(() => {
    const out: { category: Category; items: { id: string; brand: string; name: string; size: string | null; sim: number | null }[] }[] = [];
    for (const category of ["top", "bottom"] as Category[]) {
      const ref = primaryOf(refs, category);
      if (!ref) continue;
      const items = products
        .filter((p) => p.category === category)
        .map((p) => {
          const r = compareProduct(ref, p);
          const best = r.bySize.find((s) => s.sizeLabel === r.recommendedSize);
          return { id: p.id, brand: p.brandName, name: p.name, size: r.recommendedSize, sim: best?.similarity ?? null };
        })
        .filter((x) => x.sim !== null)
        .sort((a, b) => (b.sim as number) - (a.sim as number))
        .slice(0, 3);
      out.push({ category, items });
    }
    return out;
  }, [refs]);

  if (refs === null) return <div className="h-40" />;

  if (refs.length === 0) {
    return (
      <section className="mx-5 rounded-2xl bg-neutral-900 p-5 text-white">
        <p className="text-sm text-neutral-300">시작하기</p>
        <p className="mt-1 text-lg font-bold">핏이 마음에 들었던 옷을 먼저 등록해 주세요</p>
        <p className="mt-2 text-sm text-neutral-300">그 옷의 실측을 기준으로 다른 브랜드 옷과 비교해 드려요.</p>
        <Link href="/register" className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-bold text-neutral-900">
          기준 옷 등록하기
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="px-5">
        <h2 className="mb-3 font-bold">내 기준 옷</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["top", "bottom"] as Category[]).map((c) => {
            const r = primaryOf(refs, c);
            return r ? (
              <Link key={c} href="/closet" className="rounded-xl border border-neutral-200 p-3">
                <p className="text-xs text-neutral-400">{CATEGORY_LABEL[c]}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold">{r.name}</p>
                <p className="mt-1 text-xs text-neutral-500">{r.size ? `${r.size} 사이즈` : ""}</p>
              </Link>
            ) : (
              <Link key={c} href="/register" className="flex items-center justify-center rounded-xl border border-dashed border-neutral-300 p-3 text-sm text-neutral-500">
                + {CATEGORY_LABEL[c]} 기준 옷 등록
              </Link>
            );
          })}
        </div>
      </section>
      {picks.map((g) => (
        <section key={g.category} className="px-5 pt-6">
          <h2 className="mb-3 font-bold">내 {CATEGORY_LABEL[g.category]}와 비슷한 상품</h2>
          <ul className="space-y-2">
            {g.items.map((it) => (
              <li key={it.id}>
                <Link href={`/products/${it.id}`} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
                  <ProductImage label={it.brand} className="h-14 w-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-500">{it.brand}</p>
                    <p className="truncate text-sm font-semibold">{it.name}</p>
                    <p className="mt-1 text-xs text-neutral-500">추천 사이즈 {it.size}</p>
                  </div>
                  <SimilarityBadge value={it.sim} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
