"use client";
// 기준 옷 저장소 (MVP: 브라우저 localStorage). 다른 파일에서 localStorage를 직접 쓰지 않는다.
import { useMemo, useSyncExternalStore } from "react";
import type { Category, ReferenceGarment } from "../types/fitmap";

const KEY = "fitmap.references.v1";
const EVT = "fitmap-references";

function read(): ReferenceGarment[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReferenceGarment[]) : [];
  } catch {
    return [];
  }
}

function write(list: ReferenceGarment[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

export function addReference(ref: Omit<ReferenceGarment, "id" | "createdAt" | "isPrimary">) {
  const list = read();
  const hasPrimary = list.some((r) => r.category === ref.category && r.isPrimary);
  const item: ReferenceGarment = {
    ...ref,
    id: `R${Date.now()}`,
    createdAt: new Date().toISOString(),
    isPrimary: !hasPrimary,
  };
  write([...list, item]);
  return item;
}

export function removeReference(id: string) {
  const list = read();
  const target = list.find((r) => r.id === id);
  let next = list.filter((r) => r.id !== id);
  // 대표 옷을 지우면 같은 카테고리의 첫 번째 옷을 대표로
  if (target?.isPrimary) {
    const first = next.find((r) => r.category === target.category);
    if (first) next = next.map((r) => (r.id === first.id ? { ...r, isPrimary: true } : r));
  }
  write(next);
}

export function setPrimary(id: string) {
  const list = read();
  const target = list.find((r) => r.id === id);
  if (!target) return;
  write(list.map((r) => (r.category === target.category ? { ...r, isPrimary: r.id === id } : r)));
}

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVT, cb);
  };
};
const getSnapshot = () => localStorage.getItem(KEY) ?? "[]";
const getServerSnapshot = () => null;

/** 저장된 기준 옷 목록. 서버 렌더링 중에는 null */
export function useReferences(): ReferenceGarment[] | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as ReferenceGarment[];
    } catch {
      return [];
    }
  }, [raw]);
}

export const primaryOf = (refs: ReferenceGarment[] | null, category: Category) =>
  refs?.find((r) => r.category === category && r.isPrimary) ?? refs?.find((r) => r.category === category) ?? null;
