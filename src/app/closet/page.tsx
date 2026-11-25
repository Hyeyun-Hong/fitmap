"use client";
import Link from "next/link";
import Header from "@/components/Header";
import { removeReference, setPrimary, useReferences } from "@/lib/storage";
import { CATEGORY_LABEL, SUB_LABEL } from "@/lib/data";
import { PART_LABEL } from "@/types/fitmap";
import { partsOf } from "@/lib/fit";
import type { Category } from "@/types/fitmap";

export default function ClosetPage() {
  const refs = useReferences();
  return (
    <main className="flex-1">
      <Header title="내 옷장" />
      <div className="space-y-6 px-5 py-5">
        <Link href="/register" className="block rounded-xl border border-dashed border-neutral-300 py-4 text-center text-sm font-semibold text-neutral-600">
          + 기준 옷 추가
        </Link>
        {refs !== null && refs.length === 0 ? <p className="text-center text-sm text-neutral-500">아직 등록한 기준 옷이 없어요.</p> : null}
        {(["top", "bottom"] as Category[]).map((c) => {
          const list = (refs ?? []).filter((r) => r.category === c);
          if (list.length === 0) return null;
          return (
            <section key={c}>
              <h2 className="mb-2 font-bold">{CATEGORY_LABEL[c]}</h2>
              <ul className="space-y-2">
                {list.map((r) => (
                  <li key={r.id} className="rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-neutral-500">
                          {[r.brandName, SUB_LABEL[r.subCategory], r.size].filter(Boolean).join(" · ")}
                        </p>
                        <p className="font-semibold">{r.name}</p>
                      </div>
                      {r.isPrimary ? (
                        <span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">대표</span>
                      ) : (
                        <button onClick={() => setPrimary(r.id)} className="shrink-0 rounded-full border border-neutral-300 px-2 py-0.5 text-xs">
                          대표로
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      {partsOf(c)
                        .filter((p) => r.measurements[p] != null)
                        .map((p) => `${PART_LABEL[c][p]} ${r.measurements[p]}`)
                        .join(" · ")}
                    </p>
                    <button onClick={() => removeReference(r.id)} className="mt-2 text-xs text-neutral-400 underline">
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <Link href="/settings" className="block text-center text-xs text-neutral-400 underline">
          측정 가이드 · 서비스 안내
        </Link>
      </div>
    </main>
  );
}
