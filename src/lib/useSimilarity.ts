"use client";
import { useMemo } from "react";
import type { Product } from "../types/fitmap";
import { compareProduct } from "./fit";
import { primaryOf, useReferences } from "./storage";

export type Scored = { product: Product; similarity: number | null; size: string | null };

/** 상품 목록마다 대표 기준 옷과의 유사도를 붙인다. 계산은 fit.ts가 한다. */
export function useScored(items: Product[]): { refs: ReturnType<typeof useReferences>; scored: Scored[] } {
  const refs = useReferences();
  const scored = useMemo(
    () =>
      items.map((p) => {
        const ref = primaryOf(refs, p.category);
        if (!ref) return { product: p, similarity: null, size: null };
        const r = compareProduct(ref, p);
        const best = r.bySize.find((s) => s.sizeLabel === r.recommendedSize);
        return { product: p, similarity: best?.similarity ?? null, size: r.recommendedSize };
      }),
    [items, refs],
  );
  return { refs, scored };
}

export const bySimilarity = (a: Scored, b: Scored) => (b.similarity ?? -1) - (a.similarity ?? -1);
