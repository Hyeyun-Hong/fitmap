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

      {/* 프로모션 배너: 제휴 프로모션이 확인되기 전까지는 서비스 소개만 넣는다. 할인 정보를 지어내지 않는다 */}
      <section className="space-y-3 px-5 pt-8" aria-label="프로모션">
        <h2 className="font-bold">프로모션</h2>
        <Link
          href="/settings/about"
          className="flex h-[120px] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-5 text-white"
        >
          <span className="text-xs font-semibold text-emerald-100">FIT MAP 소개</span>
          <span className="mt-1 text-base font-bold leading-snug">
            만족했던 옷 하나로
            <br />
            다른 브랜드 핏을 비교해 보세요
          </span>
        </Link>
        <Link href="/settings/guide" className="flex h-[72px] items-center justify-between rounded-2xl bg-emerald-50 px-5">
          <span>
            <span className="block text-xs text-emerald-700">측정 가이드</span>
            <span className="block text-sm font-bold">줄자 하나로 5분, 실측 재는 법</span>
          </span>
          <span className="text-emerald-700" aria-hidden>→</span>
        </Link>
        <div className="flex h-[72px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-center">
          <p className="text-sm font-semibold text-neutral-500">브랜드 기획전</p>
          <p className="mt-0.5 text-xs text-neutral-400">제휴 브랜드 프로모션이 들어갈 자리예요.</p>
        </div>
      </section>
    </main>
  );
}
