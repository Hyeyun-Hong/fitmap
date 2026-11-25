import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ProductDetail from "./ProductDetail";
import { getProduct, getReview, products } from "@/lib/data";

export async function generateStaticParams() {
  return products.map((p) => ({ productId: p.id }));
}

export default async function ProductPage({ params }: PageProps<"/products/[productId]">) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();
  return (
    <main className="flex-1">
      <Header title={product.brandName} back={`/brands/${product.brandId}`} />
      <ProductDetail product={product} review={getReview(product.id)} />
    </main>
  );
}
