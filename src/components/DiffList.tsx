import type { PartDiff } from "@/types/fitmap";
import { describeDiff } from "@/lib/fit";

const MAX = 6; // 막대가 꽉 차는 차이(cm)

export default function DiffList({ diffs }: { diffs: PartDiff[] }) {
  return (
    <ul className="space-y-3">
      {diffs.map((d) => {
        const ok = d.diff !== null;
        const pct = ok ? Math.min(Math.abs(d.diff as number) / MAX, 1) * 50 : 0;
        const color = d.status === "same" ? "bg-emerald-500" : d.status.startsWith("slightly") ? "bg-amber-400" : "bg-rose-400";
        return (
          <li key={d.part}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">{d.label}</span>
              <span className={ok ? "" : "text-neutral-400"}>{describeDiff(d)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="w-10 text-right">{d.reference ?? "-"}</span>
              <div className="relative h-2 flex-1 rounded-full bg-neutral-100">
                <div className="absolute left-1/2 top-0 h-2 w-px bg-neutral-300" />
                {ok ? (
                  <div
                    className={`absolute top-0 h-2 rounded-full ${color}`}
                    style={(d.diff as number) >= 0 ? { left: "50%", width: `${Math.max(pct, 1.5)}%` } : { right: "50%", width: `${Math.max(pct, 1.5)}%` }}
                  />
                ) : null}
              </div>
              <span className="w-10">{d.target ?? "-"}</span>
            </div>
          </li>
        );
      })}
      <li className="flex justify-between text-[11px] text-neutral-400">
        <span>← 기준 옷보다 작음</span>
        <span>기준 옷보다 큼 →</span>
      </li>
    </ul>
  );
}
