"use client";
import { useEffect } from "react";
import { addRecent } from "@/lib/storage";

/** 상품 상세에 넣어 두면 최근 본 상품에 기록한다. 화면에는 아무것도 그리지 않는다. */
export default function RecentTracker({ productId }: { productId: string }) {
  useEffect(() => {
    addRecent(productId);
  }, [productId]);
  return null;
}
