import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CompareView from "./CompareView";
import { getProduct, getReview, products } from "@/lib/data";

export async function generateStaticParams() {
  return products.map((p) => ({ productId: p.id }));
}

export default async function ComparePage({ params }: PageProps<"/compare/[productId]">) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();
  return (
    <main className="flex-1">
      <Header title="핏 비교 결과" back={`/products/${product.id}`} />
      <CompareView product={product} review={getReview(product.id)} />
    </main>
  );
}
