export default function SimilarityBadge({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return null;
  const tone = value >= 85 ? "bg-emerald-50 text-emerald-700" : value >= 65 ? "bg-amber-50 text-amber-700" : "bg-neutral-100 text-neutral-600";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>유사도 {value}%</span>;
}

/** 큰 숫자로 보여줄 때 쓰는 글자색 */
export const simText = (v: number | null | undefined) =>
  v === null || v === undefined ? "text-neutral-400" : v >= 85 ? "text-emerald-600" : v >= 65 ? "text-amber-600" : "text-neutral-500";
