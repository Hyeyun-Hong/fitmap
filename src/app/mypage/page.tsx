"use client";
import Link from "next/link";
import Header from "@/components/Header";
import SavedProducts from "@/components/SavedProducts";
import { removeReference, setPrimary, useLikes, useRecent, useReferences } from "@/lib/storage";
import { gradeOf } from "@/lib/grade";
import { CATEGORY_LABEL, SUB_LABEL } from "@/lib/data";
import { PART_LABEL } from "@/types/fitmap";
import { partsOf } from "@/lib/fit";
import type { Category } from "@/types/fitmap";

/** 마이페이지에 미리 보여줄 찜 상품 수 */
const LIKE_PREVIEW = 4;

export default function MyPage() {
  const refs = useReferences();
  const grade = gradeOf(refs ?? []);
  const likes = useLikes();
  const recent = useRecent();
  const menu = [
    { label: "새 기준 옷 등록", href: "/register", note: "" },
    { label: "찜", href: "/mypage/likes", note: likes ? String(likes.length) : "" },
    { label: "최근 본 상품", href: "/mypage/recent", note: recent ? String(recent.length) : "" },
    { label: "설정", href: "/settings", note: "" },
  ];

  return (
    <main className="flex-1">
      <Header title="마이페이지" />
      <div className="space-y-8 px-5 pb-6 pt-2">
        <section className="rounded-2xl bg-neutral-900 p-5 text-white">
          <p className="text-xs text-neutral-400">내 등급</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-2xl font-bold">{refs === null ? "" : grade.name}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={`h-1.5 w-6 rounded-full ${n <= grade.level ? "bg-emerald-400" : "bg-neutral-700"}`} />
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm text-neutral-300">{grade.next ?? "모든 등급을 달성했어요."}</p>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              내 기준 옷 <span className="text-emerald-600">{refs?.length ?? 0}</span>
            </h2>
            <Link href="/register" className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white">
              + 등록
            </Link>
          </div>
          {refs !== null && refs.length === 0 ? (
            <Link href="/register" className="block rounded-xl border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
              핏이 마음에 들었던 옷을 등록해 주세요
            </Link>
          ) : null}
          <div className="space-y-5">
            {(["top", "bottom"] as Category[]).map((c) => {
              const list = (refs ?? []).filter((r) => r.category === c);
              if (list.length === 0) return null;
              return (
                <div key={c}>
                  <p className="mb-2 text-xs font-semibold text-neutral-400">{CATEGORY_LABEL[c]}</p>
                  <ul className="space-y-2">
                    {list.map((r) => (
                      <li key={r.id} className={`rounded-xl border p-4 ${r.isPrimary ? "border-neutral-900" : "border-neutral-200"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-500">{[r.brandName, SUB_LABEL[r.subCategory], r.size].filter(Boolean).join(" · ")}</p>
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
                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/register?edit=${encodeURIComponent(r.id)}`}
                            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold"
                          >
                            수정
                          </Link>
                          <button onClick={() => removeReference(r.id)} className="rounded-full px-3 py-1 text-xs text-neutral-400 underline"
                          >
                            삭제
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              찜한 상품 <span className="text-emerald-600">{likes?.length ?? 0}</span>
            </h2>
            {likes && likes.length > LIKE_PREVIEW ? (
              <Link href="/mypage/likes" className="text-xs text-neutral-500">
                전체 보기 ›
              </Link>
            ) : null}
          </div>
          <div className="-mx-5">
            <SavedProducts ids={likes} limit={LIKE_PREVIEW} empty="찜한 상품이 없어요. 상품의 하트를 눌러 담아 보세요." />
          </div>
        </section>

        <ul className="divide-y divide-neutral-100 border-y border-neutral-100">
          {menu.map((it) => (
            <li key={it.href}>
              <Link href={it.href} className="flex items-center justify-between py-4 text-[15px]">
                <span>{it.label}</span>
                <span className="flex items-center gap-2 text-sm text-neutral-400">
                  {it.note ? <span className="font-semibold text-neutral-900">{it.note}</span> : null}›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
