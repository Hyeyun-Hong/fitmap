import Header from "@/components/Header";
import BrandTabs from "./BrandTabs";
import { brands, products } from "@/lib/data";

export default function BrandsPage() {
  const list = brands.map((b) => ({
    ...b,
    topCount: products.filter((p) => p.brandId === b.id && p.category === "top").length,
    bottomCount: products.filter((p) => p.brandId === b.id && p.category === "bottom").length,
  }));
  return (
    <main className="flex-1">
      <Header title="브랜드 전체" back="/" />
      <BrandTabs brands={list} />
    </main>
  );
}
