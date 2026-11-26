"use client";
// 찜(하트) 버튼. 저장은 storage.ts가 한다. 카드 링크 안에 넣어도 상품 상세로 이동하지 않는다.
import { addLike, removeLike, useLikes } from "@/lib/storage";

export default function LikeButton({ productId, className = "h-11 w-11" }: { productId: string; className?: string }) {
  const likes = useLikes();
  const liked = likes?.includes(productId) ?? false;
  return (
    <button
      type="button"
      aria-label={liked ? "찜 해제" : "찜하기"}
      aria-pressed={liked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (liked) removeLike(productId);
        else addLike(productId);
      }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm transition active:scale-90 ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#e11d48" : "none"} stroke={liked ? "#e11d48" : "#525252"} strokeWidth="2">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
