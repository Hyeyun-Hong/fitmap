import Link from "next/link";
import HomeClient from "./_home/HomeClient";

export default function Home() {
  return (
    <main className="flex-1">
      <div className="px-5 pt-4">
        <Link href="/search" className="flex h-11 items-center gap-2 rounded-xl bg-neutral-100 px-4 text-sm text-neutral-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          브랜드나 상품명을 검색해 보세요
        </Link>
      </div>

      {/* 상단 배너: 제휴 프로모션이 확인되기 전까지는 서비스 소개만 보여준다 */}
      <section className="px-5 pt-4" aria-label="서비스 소개">
        <Link
          href="/settings/about"
          className="flex h-[140px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white"
        >
          <span className="text-xs font-semibold text-emerald-100">FIT MAP 소개</span>
          <span className="text-lg font-bold leading-snug">
            만족했던 옷 하나로
            <br />
            다른 브랜드 핏을 비교해 보세요
          </span>
          <span className="text-xs text-emerald-100">실측으로 사이즈를 비교해 드려요 →</span>
        </Link>
      </section>

      <HomeClient />

      <section className="space-y-3 px-5 pt-8">
        <h2 className="font-bold">함께 보면 좋아요</h2>
        <Link href="/settings/guide" className="block rounded-2xl bg-emerald-50 p-5">
          <p className="text-xs text-emerald-700">측정 가이드</p>
          <p className="mt-1 font-bold">줄자 하나로 5분, 실측 재는 법</p>
        </Link>
        <div className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center">
          <p className="text-sm font-semibold text-neutral-500">브랜드 기획전</p>
          <p className="mt-1 text-xs text-neutral-400">제휴 브랜드 프로모션이 들어갈 자리예요.</p>
        </div>
      </section>
    </main>
  );
}
