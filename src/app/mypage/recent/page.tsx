"use client";
import Header from "@/components/Header";
import SavedProducts from "@/components/SavedProducts";
import { clearRecent, useRecent } from "@/lib/storage";

export default function RecentPage() {
  const recent = useRecent();
  return (
    <main className="flex-1">
      <Header title="최근 본 상품" back="/mypage" />
      {recent && recent.length > 0 ? (
        <div className="flex justify-end px-5">
          <button onClick={clearRecent} className="text-xs text-neutral-400 underline">
            전체 삭제
          </button>
        </div>
      ) : null}
      <SavedProducts ids={recent} empty="최근 본 상품이 없어요." />
    </main>
  );
}
