"use client";
// 브랜드 찜(하트) 버튼. 상품 찜 버튼(LikeButton)과 모양·색을 맞춘다. 저장은 storage.ts가 한다.
import { toggleBrandLike, useBrandLikes } from "@/lib/storage";

export default function BrandLikeButton({ brandId, className = "h-11 w-11" }: { brandId: string; className?: string }) {
  const likes = useBrandLikes();
  const liked = likes?.includes(brandId) ?? false;
  return (
    <button
      type="button"
      aria-label={liked ? "브랜드 찜 해제" : "브랜드 찜하기"}
      aria-pressed={liked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBrandLike(brandId);
      }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm transition active:scale-90 ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#e11d48" : "none"} stroke={liked ? "#e11d48" : "#525252"} strokeWidth="2">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
