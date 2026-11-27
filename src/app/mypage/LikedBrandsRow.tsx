"use client";
// 마이페이지 '찜한 브랜드' 가로 목록.
// PREVIEW개까지만 보여주고, 더 있으면 끝에 '전체 보기' 카드를 둔다.
// 그 카드 뒤까지 끝까지 밀면 찜 페이지 브랜드 탭으로 넘어간다.
import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { productsByBrand } from "@/lib/data";
import type { Brand } from "@/types/fitmap";

/** 마이페이지에 미리 보여줄 찜 브랜드 수 */
const PREVIEW = 5;
const ALL_HREF = "/mypage/likes?tab=brand";

export default function LikedBrandsRow({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const moved = useRef(false);
  const hasMore = brands.length > PREVIEW;

  const onScroll = (e: React.UIEvent<HTMLUListElement>) => {
    if (!hasMore || moved.current) return;
    const el = e.currentTarget;
    // 사용자가 밀어서 오른쪽 끝에 닿았을 때만 (처음 화면에서 바로 넘어가지 않게 scrollLeft > 0)
    if (el.scrollLeft > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
      moved.current = true;
      router.push(ALL_HREF);
    }
  };

  return (
    <ul
      onScroll={onScroll}
      // 가로 스크롤바 숨김(Firefox: scrollbar-width, Chrome·Safari: ::-webkit-scrollbar)
      className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {brands.slice(0, PREVIEW).map((b) => (
        <li key={b.id} className="shrink-0">
          <Link href={`/brands/${b.id}`} className="flex min-w-28 flex-col rounded-xl border border-neutral-200 px-4 py-3">
            <span className="whitespace-nowrap text-[15px] font-semibold">{b.name}</span>
            <span className="mt-1 text-xs text-neutral-400">상품 {productsByBrand(b.id).length}개 ›</span>
          </Link>
        </li>
      ))}
      {hasMore ? (
        <>
          <li className="shrink-0">
            <Link href={ALL_HREF} className="flex h-full min-w-24 flex-col items-center justify-center rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700">
              전체 보기
              <span className="mt-1 text-xs font-normal text-neutral-400">+{brands.length - PREVIEW}개 →</span>
            </Link>
          </li>
          {/* 끝까지 밀었을 때 넘어가기 위한 여백. 이만큼 더 밀어야 이동한다 */}
          <li aria-hidden="true" className="w-10 shrink-0" />
        </>
      ) : null}
    </ul>
  );
}
