import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CategoryList from "./CategoryList";
import { CATEGORY_SLUGS, products } from "@/lib/data";

export async function generateStaticParams() {
  return Object.keys(CATEGORY_SLUGS).map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const cat = CATEGORY_SLUGS[slug];
  if (!cat) notFound();
  const items = products.filter(cat.match);
  const siblings = Object.entries(CATEGORY_SLUGS).filter(([, c]) => c.group === cat.group);
  const name = cat.label.replace(" 전체", "");
  // 비어 있을 때 이동할 곳: 아우터 → 상의 전체, 하위 카테고리 → 같은 그룹 전체
  const fallback = cat.group === "outer" || slug === cat.group ? "top" : cat.group;
  const fallbackLabel = fallback === "top" && cat.group === "outer" ? "상의 보러 가기" : `${CATEGORY_SLUGS[fallback].label} 보기`;
  return (
    <main className="flex-1">
      <Header title={cat.label} />
      {siblings.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {siblings.map(([s, c]) => (
            <Link
              key={s}
              href={`/category/${s}`}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${s === slug ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200"}`}
            >
              {c.label.replace(" 전체", "")}
            </Link>
          ))}
        </div>
      ) : null}
      {items.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-16 text-center">
          <p className="text-sm text-neutral-600">아직 등록된 {name} 상품이 없어요. 곧 추가할게요.</p>
          <Link href={`/category/${fallback}`} className="mt-4 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white">
            {fallbackLabel}
          </Link>
        </div>
      ) : (
        <CategoryList items={items} />
      )}
    </main>
  );
}
