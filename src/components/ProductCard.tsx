import Link from "next/link";
import type { Scored } from "@/lib/useSimilarity";
import { won } from "@/lib/data";
import ProductImage from "./ProductImage";
import SimilarityBadge from "./SimilarityBadge";
import LikeButton from "./LikeButton";

export default function ProductCard({ item, className = "" }: { item: Scored; className?: string }) {
  const { product: p, similarity, size } = item;
  return (
    <Link href={`/products/${p.id}`} className={`block ${className}`}>
      <div className="relative">
        <ProductImage label={p.brandName} className="aspect-[3/4] w-full" />
        <LikeButton productId={p.id} className="absolute bottom-2 right-2 h-8 w-8" />
      </div>
      <p className="mt-2 text-xs text-neutral-500">{p.brandName}</p>
      <p className="line-clamp-2 text-sm font-semibold leading-snug">{p.name}</p>
      <p className="mt-1 text-sm">{won(p.price.sale ?? p.price.regular)}</p>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        {p.sizes.length === 0 ? <span className="text-xs text-neutral-400">실측 없음</span> : <SimilarityBadge value={similarity} />}
        {size ? <span className="text-xs text-neutral-500">{size}</span> : null}
      </div>
    </Link>
  );
}
