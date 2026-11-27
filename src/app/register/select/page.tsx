"use client";
// 기준 옷 등록 > FIT MAP 상품에서 불러오기: 상품 고르기
// /register/select?category=top|bottom[&edit=<기준 옷 id>] → 고르면 /register?pick=<상품 id>[&edit=…]로 돌아간다
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { brands, products, hasMeasurements, matchesQuery, normalizeQuery, CATEGORY_LABEL, SUB_LABEL } from "@/lib/data";
import type { Category, Product } from "@/types/fitmap";

export default function SelectProductPage() {
  return (
    <Suspense fallback={null}>
      <SelectProduct />
    </Suspense>
  );
}

function SelectProduct() {
  const params = useSearchParams();
  const raw = params.get("category");
  const category: Category | null = raw === "top" || raw === "bottom" ? raw : null;
  const editId = params.get("edit");
  const [q, setQ] = useState("");
  const query = normalizeQuery(q);

  const registerHref = (pick?: string) => {
    const sp = new URLSearchParams();
    if (editId) sp.set("edit", editId);
    if (pick) sp.set("pick", pick);
    const s = sp.toString();
    return s ? `/register?${s}` : "/register";
  };

  // 브랜드 목록 순서대로 묶는다. 상품이 없는 브랜드는 뺀다
  const groups = useMemo(() => {
    const list = products.filter((p) => (!category || p.category === category) && (!query || matchesQuery(p, query)));
    const known = new Set(brands.map((b) => b.id));
    const out = brands
      .map((b) => ({ id: b.id, name: b.name, items: list.filter((p) => p.brandId === b.id) }))
      .filter((g) => g.items.length > 0);
    // brands.json에 없는 브랜드의 상품도 빠뜨리지 않는다
    const rest = list.filter((p) => !known.has(p.brandId));
    for (const p of rest) {
      const g = out.find((x) => x.id === p.brandId);
      if (g) g.items.push(p);
      else out.push({ id: p.brandId, name: p.brandName, items: [p] });
    }
    return out;
  }, [category, query]);

  const count = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <main className="flex-1">
      <Header title="상품 선택" back={registerHref()} />
      <div className="sticky top-14 z-10 bg-white px-5 pb-3 pt-1">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="상품명이나 브랜드명을 검색해 보세요"
          className="h-11 w-full rounded-xl bg-neutral-100 px-4 text-sm outline-none"
        />
        <p className="mt-2 text-xs text-neutral-500">
          {category ? `${CATEGORY_LABEL[category]} ` : ""}상품 {count}개 · 실측이 없는 상품은 불러올 수 없어요
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="px-5 py-16 text-center text-sm text-neutral-500">검색 결과가 없어요. 목록에 없으면 실측을 직접 입력해 주세요.</p>
      ) : (
        <div className="space-y-6 px-5 pb-8 pt-2">
          {groups.map((g) => (
            <section key={g.id}>
              <h2 className="mb-2 text-sm font-bold">{g.name}</h2>
              <ul className="divide-y divide-neutral-100 border-y border-neutral-100">
                {g.items.map((p) => (
                  <li key={p.id}>
                    <ProductRow product={p} href={registerHref(p.id)} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function ProductRow({ product: p, href }: { product: Product; href: string }) {
  const body = (
    <>
      <span className="min-w-0">
        <span className="block truncate text-[15px]">{p.name}</span>
        <span className="block text-xs text-neutral-400">{SUB_LABEL[p.subCategory]}</span>
      </span>
      {hasMeasurements(p) ? (
        <span className="shrink-0 text-sm text-neutral-400">선택 ›</span>
      ) : (
        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-400">실측 없음</span>
      )}
    </>
  );
  if (!hasMeasurements(p)) {
    return (
      <div aria-disabled="true" className="flex items-center justify-between gap-3 py-3 text-neutral-400">
        {body}
      </div>
    );
  }
  // replace: 고른 뒤 뒤로 가기를 누르면 선택 페이지가 아니라 등록 이전 화면으로
  return (
    <Link href={href} replace className="flex items-center justify-between gap-3 py-3">
      {body}
    </Link>
  );
}
