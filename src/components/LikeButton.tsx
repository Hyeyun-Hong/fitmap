"use client";
import { toggleLike, useLikes } from "@/lib/storage";

export default function LikeButton({ productId, className = "" }: { productId: string; className?: string }) {
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
        toggleLike(productId);
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#e11d48" : "none"} stroke={liked ? "#e11d48" : "#525252"} strokeWidth="2">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
