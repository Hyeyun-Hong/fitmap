"use client";
import Link from "next/link";
import { useState } from "react";
import { useTrackNavigation } from "./BackButton";
import CategoryDrawer, { type DrawerBrand } from "./CategoryDrawer";

export default function AppHeader({ brands }: { brands: DrawerBrand[] }) {
  const [open, setOpen] = useState(false);
  useTrackNavigation();
  return (
    <>
      <header className="sticky top-0 z-20 grid h-14 grid-cols-[48px_1fr_48px] items-center border-b border-neutral-100 bg-white px-2">
        <button aria-label="카테고리 열기" onClick={() => setOpen(true)} className="flex h-10 w-10 flex-col items-center justify-center gap-[5px]">
          <span className="h-[2px] w-5 bg-neutral-900" />
          <span className="h-[2px] w-5 bg-neutral-900" />
          <span className="h-[2px] w-5 bg-neutral-900" />
        </button>
        <Link href="/" className="justify-self-center text-lg font-black tracking-widest">
          FIT MAP
        </Link>
        <Link href="/mypage" aria-label="마이페이지" className="flex h-10 w-10 items-center justify-center justify-self-end">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
          </svg>
        </Link>
      </header>
      <CategoryDrawer open={open} onClose={() => setOpen(false)} brands={brands} />
    </>
  );
}
