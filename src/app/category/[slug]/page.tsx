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
        <p className="px-5 py-16 text-center text-sm text-neutral-500">아직 실측을 확인한 상품이 없어요.</p>
      ) : (
        <CategoryList items={items} />
      )}
    </main>
  );
}
