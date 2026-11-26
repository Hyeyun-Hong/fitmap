"use client";
// 상품 목록 정렬 선택 버튼. 정렬 계산은 useSimilarity.ts의 sortScored가 한다.
import type { ListSort } from "@/types/fitmap";

const OPTIONS: { value: ListSort; label: string }[] = [
  { value: "default", label: "기본순" },
  { value: "price_asc", label: "낮은 가격순" },
  { value: "price_desc", label: "높은 가격순" },
];

export default function SortTabs({ value, onChange }: { value: ListSort; onChange: (v: ListSort) => void }) {
  return (
    <div role="radiogroup" aria-label="정렬" className="flex gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${value === o.value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
