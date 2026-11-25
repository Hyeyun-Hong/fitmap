"use client";
import Link from "next/link";
import type { ReferenceGarment } from "@/types/fitmap";

export default function RefPicker({
  refs,
  value,
  onChange,
  categoryLabel,
}: {
  refs: ReferenceGarment[];
  value: string;
  onChange: (id: string) => void;
  categoryLabel: string;
}) {
  if (refs.length === 0) {
    return (
      <div className="rounded-xl bg-neutral-900 p-4 text-white">
        <p className="text-sm font-bold">{categoryLabel} 기준 옷을 등록하면 핏을 비교해 드려요</p>
        <Link href="/register" className="mt-3 inline-block rounded-lg bg-white px-3 py-2 text-xs font-bold text-neutral-900">
          기준 옷 등록하기
        </Link>
      </div>
    );
  }
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="shrink-0 text-neutral-500">기준 옷</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-neutral-200 p-2">
        {refs.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
            {r.size ? ` (${r.size})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
