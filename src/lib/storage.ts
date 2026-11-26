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

export function getReference(id: string): ReferenceGarment | null {
  return read().find((r) => r.id === id) ?? null;
}

/**
 * 기준 옷 수정. 같은 id 항목을 덮어쓴다(새 항목을 만들지 않음).
 * id · createdAt · isPrimary · category는 기존 값을 유지한다. 대상이 없으면 null
 */
export function updateReference(
  id: string,
  patch: Omit<ReferenceGarment, "id" | "createdAt" | "isPrimary" | "category">,
): ReferenceGarment | null {
  const list = read();
  const target = list.find((r) => r.id === id);
  if (!target) return null;
  const item: ReferenceGarment = {
    ...patch,
    id: target.id,
    createdAt: target.createdAt,
    isPrimary: target.isPrimary,
    category: target.category,
  };
  write(list.map((r) => (r.id === id ? item : r)));
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

// ---------- 찜 · 최근 본 상품 (상품 ID 목록) ----------

const LIKES = "fitmap.likes.v1";
const RECENT = "fitmap.recent.v1";
const RECENT_MAX = 20;
const LIST_EVT = "fitmap-lists";

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event(LIST_EVT));
}

/** 찜한 상품 ID 목록(최근 찜한 순) */
export const getLikes = (): string[] => readIds(LIKES);

export const isLiked = (productId: string) => getLikes().includes(productId);

/** 찜 추가. 이미 있으면 그대로 둔다 */
export function addLike(productId: string) {
  const ids = getLikes();
  if (ids.includes(productId)) return;
  writeIds(LIKES, [productId, ...ids]);
}

export function removeLike(productId: string) {
  const ids = getLikes();
  if (!ids.includes(productId)) return;
  writeIds(LIKES, ids.filter((x) => x !== productId));
}

export function toggleLike(productId: string) {
  if (isLiked(productId)) removeLike(productId);
  else addLike(productId);
}

/** 상품 상세를 열 때 호출. 가장 최근 본 상품이 맨 앞 */
export function addRecent(productId: string) {
  const ids = readIds(RECENT);
  if (ids[0] === productId) return;
  writeIds(RECENT, [productId, ...ids.filter((x) => x !== productId)].slice(0, RECENT_MAX));
}

export function clearRecent() {
  writeIds(RECENT, []);
}

const subscribeLists = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(LIST_EVT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(LIST_EVT, cb);
  };
};

function useIds(key: string): string[] | null {
  const raw = useSyncExternalStore(subscribeLists, () => localStorage.getItem(key) ?? "[]", getServerSnapshot);
  return useMemo(() => {
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }, [raw]);
}

/** 찜한 상품 ID. 서버 렌더링 중에는 null */
export const useLikes = () => useIds(LIKES);
/** 최근 본 상품 ID(최신순). 서버 렌더링 중에는 null */
export const useRecent = () => useIds(RECENT);
