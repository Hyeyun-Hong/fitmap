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

      <HomeClient />

      <div className="px-5 pt-6">
        <Link
          href="/brands"
          className="flex h-12 items-center justify-center gap-1 rounded-xl border border-neutral-900 text-sm font-bold"
        >
          브랜드 둘러보기
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* 프로모션 배너: 제휴 프로모션이 확인되기 전까지는 빈 자리로 둔다. 할인 정보를 지어내지 않는다 */}
      <section className="space-y-3 px-5 pt-8" aria-label="프로모션">
        <h2 className="font-bold">프로모션</h2>
        <div className="flex h-[72px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-center">
          <p className="text-sm font-semibold text-neutral-500">브랜드 기획전</p>
          <p className="mt-0.5 text-xs text-neutral-400">제휴 브랜드 프로모션이 들어갈 자리예요.</p>
        </div>
      </section>
    </main>
  );
}
