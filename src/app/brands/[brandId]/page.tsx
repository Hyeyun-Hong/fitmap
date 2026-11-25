import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ProductList from "./ProductList";
import { brands, getBrand, productsByBrand } from "@/lib/data";

export async function generateStaticParams() {
  return brands.map((b) => ({ brandId: b.id }));
}

export default async function BrandPage({ params }: PageProps<"/brands/[brandId]">) {
  const { brandId } = await params;
  const brand = getBrand(brandId);
  if (!brand) notFound();
  const items = productsByBrand(brandId);
  return (
    <main className="flex-1">
      <Header title={brand.name} back="/brands" />
      <div className="flex items-center justify-between px-5 pt-4 text-xs text-neutral-500">
        <span>상품 {items.length}개</span>
        <Link href={brand.officialUrl} target="_blank" rel="noopener noreferrer" className="underline">
          공식 스토어
        </Link>
      </div>
      <ProductList items={items} />
    </main>
  );
}
