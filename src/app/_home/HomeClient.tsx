"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { products } from "@/lib/data";
import { bySimilarity, useScored, type Scored } from "@/lib/useSimilarity";
import ProductImage from "@/components/ProductImage";
import SimilarityBadge from "@/components/SimilarityBadge";
import LikeButton from "@/components/LikeButton";

const MAX_PICKS = 8;

export default function HomeClient() {
  const { refs, scored } = useScored(products);
  const hasRef = (refs ?? []).length > 0;

  const picks = useMemo(
    () => scored.filter((s) => s.similarity !== null).sort(bySimilarity).slice(0, MAX_PICKS),
    [scored],
  );

  // 서버 렌더링 중에는 자리만 잡아 둔다
  if (refs === null) return <div className="h-80" aria-hidden />;

  if (!hasRef) return <RegisterGuide />;

  return (
    <section className="pt-7">
      <div className="px-5">
        <h2 className="font-bold">내 기준 옷과 핏이 비슷한 상품</h2>
        <p className="mt-1 text-xs text-neutral-500">핏 유사도가 높은 순서예요</p>
      </div>
      {picks.length === 0 ? (
        <p className="mx-5 mt-3 rounded-2xl bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
          아직 비교할 수 있는 상품이 없어요.
        </p>
      ) : (
        <Slider items={picks} />
      )}
    </section>
  );
}

/** 기준 옷이 없을 때 슬라이드 대신 보여주는 안내 */
function RegisterGuide() {
  return (
    <section className="px-5 pt-7">
      <Link href="/register" className="block rounded-2xl bg-neutral-900 p-5 text-white">
        <p className="text-xs text-neutral-400">FIT MAP 시작하기</p>
        <p className="mt-1 text-lg font-bold leading-snug">아끼는 옷 한 벌이면 충분해요</p>
        <p className="mt-1 text-sm text-neutral-300">핏이 마음에 들었던 옷을 등록하면 다른 브랜드 옷과 비교해 드려요.</p>
        <span className="mt-4 inline-block rounded-lg bg-white px-3 py-2 text-xs font-bold text-neutral-900">기준 옷 등록하기</span>
      </Link>
    </section>
  );
}

/** CSS scroll-snap 가로 슬라이드 + 현재 위치 점 */
function Slider({ items }: { items: Scored[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = listRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = first.offsetWidth + 12; // gap-3
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setActive(atEnd ? items.length - 1 : Math.min(items.length - 1, Math.round(el.scrollLeft / step)));
  };

  const goTo = (i: number) => {
    const target = listRef.current?.children[i] as HTMLElement | undefined;
    if (!listRef.current || !target) return;
    listRef.current.scrollTo({ left: target.offsetLeft - listRef.current.offsetLeft - 20, behavior: "smooth" });
  };

  return (
    <>
      <ul
        ref={listRef}
        onScroll={onScroll}
        className="mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto overscroll-x-contain px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="추천 상품"
      >
        {items.map((it) => (
          <li key={it.product.id} className="w-[148px] shrink-0 snap-start">
            <SlideCard item={it} />
          </li>
        ))}
      </ul>
      {items.length > 1 ? (
        <div className="mt-2 flex justify-center gap-1.5" role="tablist" aria-label="슬라이드 위치">
          {items.map((it, i) => (
            <button
              key={it.product.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`${i + 1}번째 상품으로 이동`}
              onClick={() => goTo(i)}
              className="flex h-4 items-center"
            >
              <span className={`block h-1.5 rounded-full transition-all ${i === active ? "w-4 bg-neutral-900" : "w-1.5 bg-neutral-300"}`} />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

function SlideCard({ item }: { item: Scored }) {
  const { product: p, similarity, size } = item;
  return (
    <Link href={`/products/${p.id}`} className="block">
      <div className="relative">
        <ProductImage label={p.brandName} className="aspect-[3/4] w-full" />
        <LikeButton productId={p.id} className="absolute bottom-1 right-1 h-11 w-11" />
      </div>
      <p className="mt-2 truncate text-xs text-neutral-500">{p.brandName}</p>
      <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug">{p.name}</p>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <SimilarityBadge value={similarity} />
        {size ? <span className="text-xs text-neutral-500">추천 {size}</span> : null}
      </div>
    </Link>
  );
}
