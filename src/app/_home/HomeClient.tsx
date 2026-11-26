"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { products } from "@/lib/data";
import { bySimilarity, useScored, type Scored } from "@/lib/useSimilarity";
import { simText } from "@/components/SimilarityBadge";
import ProductImage from "@/components/ProductImage";
import LikeButton from "@/components/LikeButton";

const MAX_PICKS = 8;
const AUTO_MS = 4000; // 자동으로 넘어가는 간격
const PAUSE_MS = 6000; // 손으로 넘긴 뒤 자동 넘김을 쉬는 시간
const GAP = 12; // 슬라이드 사이 간격(px), 아래 gap-3과 같게 유지

export default function HomeClient() {
  const { refs, scored } = useScored(products);
  const hasRef = (refs ?? []).length > 0;

  // 기준 옷이 있으면 유사도 순, 없으면 실측이 있는 상품을 데이터 순서대로 보여준다
  const picks = useMemo(
    () =>
      hasRef
        ? scored.filter((s) => s.similarity !== null).sort(bySimilarity).slice(0, MAX_PICKS)
        : scored.filter((s) => s.product.measurementStatus !== "none").slice(0, MAX_PICKS),
    [scored, hasRef],
  );

  // 서버 렌더링 중에는 자리만 잡아 둔다
  if (refs === null) return <div className="h-[30rem]" aria-hidden />;

  if (picks.length === 0) {
    return (
      <p className="mx-5 mt-4 rounded-2xl bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
        아직 비교할 수 있는 상품이 없어요.
      </p>
    );
  }

  return <HeroCarousel items={picks} hasRef={hasRef} />;
}

/**
 * 추천 상품 큰 이미지 슬라이드.
 * 가운데 상품이 크게 보이고 양옆 상품이 살짝 보인다. CSS scroll-snap + 자동 넘김.
 * 상품 이름과 핏 유사도는 가운데 상품 기준으로 이미지 아래에 한 줄로 보여준다.
 * 기준 옷이 없으면 유사도 대신 등록 안내 문구를 고정으로 보여준다.
 */
function HeroCarousel({ items, hasRef }: { items: Scored[]; hasRef: boolean }) {
  const listRef = useRef<HTMLUListElement>(null);
  const pausedUntil = useRef(0);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const step = () => {
    const first = listRef.current?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + GAP : 0;
  };

  const goTo = (i: number) => {
    const el = listRef.current;
    const s = step();
    if (!el || !s) return;
    el.scrollTo({ left: i * s, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = listRef.current;
    const s = step();
    if (!el || !s) return;
    const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / s)));
    activeRef.current = i;
    setActive(i);
  };

  const pause = () => {
    pausedUntil.current = Date.now() + PAUSE_MS;
  };

  // 자동 넘김. 손으로 만지는 중이거나 '동작 줄이기' 설정이면 멈춘다.
  useEffect(() => {
    if (items.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (Date.now() < pausedUntil.current || document.hidden) return;
      // 마지막 다음은 처음으로. 현재 위치는 onScroll이 맞춘다
      goTo((activeRef.current + 1) % items.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const cur = items[active];

  return (
    <section className="pt-4" aria-roledescription="carousel" aria-label="추천 상품">
      <ul
        ref={listRef}
        onScroll={onScroll}
        onPointerDown={pause}
        onTouchStart={pause}
        onWheel={pause}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[12%] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <li
            key={it.product.id}
            className="w-[76%] shrink-0 snap-center"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${items.length}`}
          >
            <Link href={`/products/${it.product.id}`} className="relative block">
              <ProductImage
                label={it.product.brandName}
                src={it.product.imageUrl}
                alt={`${it.product.brandName} ${it.product.name}`}
                className={`aspect-[4/5] w-full transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-50"}`}
              />
              <LikeButton productId={it.product.id} className="absolute bottom-2 right-2 h-11 w-11" />
            </Link>
          </li>
        ))}
      </ul>

      {/* 가운데 상품 설명: 브랜드 상품명 · 내 기준 옷 대비 핏 유사도 */}
      <Link href={`/products/${cur.product.id}`} className="mt-3 block px-5 text-center" aria-live="polite">
        <p className="truncate text-sm">
          <span className="font-bold">{cur.product.brandName}</span> {cur.product.name}
        </p>
        {hasRef ? (
          <p className="mt-0.5 text-xs text-neutral-500">
            내 기준 옷 대비 핏 유사도{" "}
            <span className={`text-sm font-bold ${simText(cur.similarity)}`}>{cur.similarity}%</span>
            {cur.size ? ` (${cur.size} 사이즈)` : ""}
          </p>
        ) : null}
      </Link>

      {items.length > 1 ? (
        <div className="mt-2 flex justify-center gap-1.5" role="tablist" aria-label="슬라이드 위치">
          {items.map((it, i) => (
            <button
              key={it.product.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`${i + 1}번째 상품으로 이동`}
              onClick={() => {
                pause();
                goTo(i);
              }}
              className="flex h-4 items-center"
            >
              <span className={`block h-1.5 rounded-full transition-all ${i === active ? "w-4 bg-neutral-900" : "w-1.5 bg-neutral-300"}`} />
            </button>
          ))}
        </div>
      ) : null}

      {/* 기준 옷이 없을 때 고정 안내. 슬라이드가 넘어가도 바뀌지 않는다 */}
      {!hasRef ? (
        <p className="mt-2 px-5 text-center text-xs text-neutral-400">
          기준 옷을 등록하면 핏 유사도를 보여 드려요.{" "}
          <Link href="/register" className="font-semibold text-neutral-700 underline underline-offset-2">
            등록하기
          </Link>
        </p>
      ) : null}
    </section>
  );
}
