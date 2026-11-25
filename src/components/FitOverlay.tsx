"use client";
import { useState } from "react";
import type { Basis, Category, Part, PartDiff } from "@/types/fitmap";

/**
 * 트레이싱지 겹치기: 상품 실측(회색)을 깔고 기준 옷(초록 반투명)을 위에 겹친다.
 * 숫자 비교는 fit.ts가 만든 PartDiff 값을 그대로 쓰고, 여기서는 그림 좌표만 만든다.
 * 비교할 수 없는 부위는 그림이 그려지도록 상대 값이나 비율로 채우고, 아래에 따로 표시한다.
 */
type Dims = Partial<Record<Part, number>>;

const FALLBACK: Record<Category, (d: Dims) => Dims> = {
  top: (d) => {
    const chest = d.chest ?? (d.shoulder ? d.shoulder / 0.9 : 55);
    return { shoulder: d.shoulder ?? chest * 0.9, chest, length: d.length ?? chest * 1.3, sleeve: d.sleeve ?? 22 };
  },
  bottom: (d) => {
    const waist = d.waist ?? (d.thigh ? d.thigh * 1.3 : 40);
    const thigh = d.thigh ?? waist * 0.75;
    return { waist, thigh, rise: d.rise ?? 28, hem: d.hem ?? thigh * 0.6, length: d.length ?? 100 };
  },
};

function shapes(diffs: PartDiff[], category: Category) {
  const ref: Dims = {};
  const tgt: Dims = {};
  const approx: string[] = [];
  for (const d of diffs) {
    const ok = d.status !== "missing" && d.status !== "basis_mismatch";
    if (ok) {
      ref[d.part] = d.reference as number;
      tgt[d.part] = d.target as number;
    } else {
      // 한쪽만 있으면 그 값으로 양쪽을 같게 그린다(비교 불가 부위)
      const v = d.status === "basis_mismatch" ? d.reference : (d.reference ?? d.target);
      if (v !== null && v !== undefined) {
        ref[d.part] = v;
        tgt[d.part] = v;
      }
      approx.push(d.label);
    }
  }
  return { ref: FALLBACK[category](ref), tgt: FALLBACK[category](tgt), approx };
}

function topPath(d: Dims) {
  const S = d.shoulder!, C = d.chest!, L = d.length!, SL = d.sleeve!;
  const n = S * 0.18;
  const P = [S / 2, 2];
  const ang = (35 * Math.PI) / 180;
  const dir = [Math.cos(ang), Math.sin(ang)];
  const nor = [-Math.sin(ang), Math.cos(ang)];
  const w = Math.max(9, C * 0.3);
  const E = [P[0] + SL * dir[0], P[1] + SL * dir[1]];
  const F = [E[0] + w * nor[0], E[1] + w * nor[1]];
  const ah = 2 + C * 0.42;
  const A = [C / 2, ah];
  const right = [P, E, F, A, [C / 2, L]];
  const left = right.map(([x, y]) => [-x, y]).reverse();
  const pts = [...right, ...left].map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return { d: `M${-n},0 Q0,7 ${n},0 ${pts} Z`, maxX: Math.max(F[0], E[0], C / 2), maxY: Math.max(L, F[1]) };
}

function bottomPath(d: Dims, lengthBasis: Basis) {
  const W = d.waist!, T = d.thigh!, R = d.rise!, H = d.hem!;
  const L = lengthBasis === "inseam" ? R + d.length! : d.length!;
  const c = T / 2;
  const pts = [
    [W / 2, 0],
    [T, R],
    [c + H / 2, L],
    [Math.max(c - H / 2, 1), L],
    [0, R + 1],
    [-Math.max(c - H / 2, 1), L],
    [-(c + H / 2), L],
    [-T, R],
  ];
  return { d: `M${-W / 2},0 ` + pts.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " Z", maxX: Math.max(T, W / 2), maxY: L };
}

export default function FitOverlay({
  category,
  diffs,
  sizeLabel,
  lengthBasis = "total",
  refLengthBasis = "total",
}: {
  category: Category;
  diffs: PartDiff[];
  sizeLabel: string;
  /** 상품 하의 길이 기준(총장/인심) */
  lengthBasis?: Basis;
  /** 기준 옷 하의 길이 기준 */
  refLengthBasis?: Basis;
}) {
  // 길이를 비교할 수 없으면 양쪽 모두 기준 옷 값으로 그리므로 기준 옷의 길이 기준을 쓴다
  const lengthMismatch = diffs.some((d) => d.part === "length" && d.status === "basis_mismatch");
  const drawBasis = lengthMismatch ? refLengthBasis : lengthBasis;
  const [paper, setPaper] = useState(45);
  const { ref, tgt, approx } = shapes(diffs, category);
  const a = category === "top" ? topPath(tgt) : bottomPath(tgt, drawBasis);
  const b = category === "top" ? topPath(ref) : bottomPath(ref, drawBasis);
  const mx = Math.max(a.maxX, b.maxX) + 4;
  const my = Math.max(a.maxY, b.maxY) + 4;

  return (
    <div className="rounded-xl bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">트레이싱지 겹쳐 보기</p>
        <div className="flex gap-3 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-neutral-300" />
            상품 {sizeLabel}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-dashed border-emerald-600 bg-emerald-200" />내 기준 옷
          </span>
        </div>
      </div>
      <svg viewBox={`${-mx} -4 ${mx * 2} ${my + 4}`} className="mx-auto mt-2 block h-64 w-full">
        <path d={a.d} fill="#e5e5e5" stroke="#737373" strokeWidth={0.6} strokeLinejoin="round" />
        <path
          d={b.d}
          fill="#34d399"
          fillOpacity={paper / 100}
          stroke="#059669"
          strokeWidth={0.7}
          strokeDasharray="2 1.5"
          strokeLinejoin="round"
        />
      </svg>
      <label className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500">
        트레이싱지 진하기
        <input type="range" min={10} max={80} value={paper} onChange={(e) => setPaper(Number(e.target.value))} className="flex-1 accent-emerald-600" />
      </label>
      {approx.length ? <p className="mt-1 text-[11px] text-neutral-400">{approx.join(", ")}은 비교할 수 없어 같은 크기로 그렸어요.</p> : null}
    </div>
  );
}
