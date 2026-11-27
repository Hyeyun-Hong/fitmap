"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import SavedProducts from "@/components/SavedProducts";
import { getBrand, productsByBrand } from "@/lib/data";
import { removeBrandLike, useBrandLikes, useLikes } from "@/lib/storage";
import type { Brand } from "@/types/fitmap";

type Tab = "brand" | "product";

// /mypage/likes → 상품 탭, /mypage/likes?tab=brand → 브랜드 탭
export default function LikesPage() {
  return (
    <Suspense fallback={null}>
      <Likes />
    </Suspense>
  );
}

function Likes() {
  const router = useRouter();
  const likes = useLikes();
  const brandLikes = useBrandLikes();
  const tab: Tab = useSearchParams().get("tab") === "brand" ? "brand" : "product";
  // 탭을 주소에 남겨 두면 브랜드 페이지에 갔다가 뒤로 와도 같은 탭이 열린다
  const setTab = (t: Tab) => router.replace(t === "brand" ? "/mypage/likes?tab=brand" : "/mypage/likes", { scroll: false });
  const tabs: { key: Tab; label: string; count: number | undefined }[] = [
    // 데이터에서 빠진 브랜드 ID는 목록에 안 나오므로 개수에서도 뺀다
    { key: "brand", label: "브랜드", count: brandLikes?.filter((id) => getBrand(id)).length },
    { key: "product", label: "상품", count: likes?.length },
  ];

  return (
    <main className="flex-1">
      <Header title="찜" back="/mypage" />
      <div role="tablist" className="grid grid-cols-2 border-b border-neutral-200 px-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 py-3 text-sm font-bold ${tab === t.key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"}`}
          >
            {t.label} {t.count ?? ""}
          </button>
        ))}
      </div>
      {tab === "product" ? (
        <SavedProducts ids={likes} empty="찜한 상품이 없어요. 상품의 하트를 눌러 담아 보세요." />
      ) : (
        <SavedBrands ids={brandLikes} />
      )}
    </main>
  );
}

/** 찜한 브랜드 목록. '편집'을 누르면 각 브랜드 왼쪽에 삭제 버튼이 나온다 */
function SavedBrands({ ids }: { ids: string[] | null }) {
  const items = useMemo(() => (ids ?? []).map(getBrand).filter((b): b is Brand => Boolean(b)), [ids]);
  const [editing, setEditing] = useState(false);
  if (ids === null) return null;
  if (items.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-sm text-neutral-500">찜한 브랜드가 없어요. 브랜드 페이지의 하트를 눌러 담아 보세요.</p>
        <Link href="/brands" className="mt-4 inline-block rounded-lg border border-neutral-300 px-4 py-2 text-sm">
          브랜드 보러 가기
        </Link>
      </div>
    );
  }
  return (
    <div className="px-5">
      <div className="flex items-center justify-between border-b border-neutral-100 py-3">
        <p className="text-sm text-neutral-500">
          찜한 브랜드 <span className="font-semibold text-neutral-900">{items.length}</span>
        </p>
        <button type="button" onClick={() => setEditing(!editing)} className="text-sm font-semibold text-neutral-700">
          {editing ? "완료" : "편집"}
        </button>
      </div>
      <ul className="divide-y divide-neutral-100 border-b border-neutral-100">
        {items.map((b) => {
          const count = <span className="text-sm text-neutral-400">상품 {productsByBrand(b.id).length}개{editing ? "" : " ›"}</span>;
          return (
            <li key={b.id}>
              {editing ? (
                // 편집 중에는 실수로 브랜드 페이지로 넘어가지 않게 링크를 끈다
                <div className="flex items-center gap-3 py-4">
                  <button
                    type="button"
                    onClick={() => removeBrandLike(b.id)}
                    aria-label={`${b.name} 찜 삭제`}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <span className="block h-0.5 w-3 rounded bg-white" />
                  </button>
                  <span className="flex-1 text-[15px] font-semibold">{b.name}</span>
                  {count}
                </div>
              ) : (
                <Link href={`/brands/${b.id}`} className="flex items-center justify-between py-4">
                  <span className="text-[15px] font-semibold">{b.name}</span>
                  {count}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {editing ? (
        <div className="py-4 text-center">
          <button
            type="button"
            onClick={() => {
              // 한 번에 다 지워지므로 한 번 더 묻는다
              if (!window.confirm(`찜한 브랜드 ${items.length}개를 모두 삭제할까요?`)) return;
              // 목록에 안 보이는 브랜드 ID(데이터에서 빠진 것)까지 같이 지운다
              for (const id of [...(ids ?? [])]) removeBrandLike(id);
              setEditing(false);
            }}
            className="text-xs text-neutral-400 underline"
          >
            전체 삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}
