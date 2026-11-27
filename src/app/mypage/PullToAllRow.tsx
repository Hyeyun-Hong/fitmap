"use client";
// 마이페이지 찜 미리보기용 가로 목록(찜한 상품·찜한 브랜드 공용).
// 가로 스크롤바는 숨기고, hasMore면 끝에 '더 밀면 전체 보기' 안내를 둔다.
// 오른쪽 끝에 닿은 상태에서 한 번 더 끌었다가 놓으면 allHref로 넘어간다.
// (관성으로 끝에 닿거나 끝에서 탭만 한 경우에는 넘어가지 않는다)
import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/** 마이페이지에 미리 보여줄 개수 */
export const PREVIEW = 5;
/** 끝에서 이만큼(px) 더 끌어야 넘어간다(터치) */
const PULL_TOUCH = 60;
/** 끝에서 휠·트랙패드로 이만큼 더 밀어야 넘어간다(데스크톱) */
const PULL_WHEEL = 200;

const isAtEnd = (el: HTMLElement) => el.scrollLeft > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;

/** children: <li> 항목들 */
export default function PullToAllRow({ allHref, hasMore, children }: { allHref: string; hasMore: boolean; children: ReactNode }) {
  const router = useRouter();
  const moved = useRef(false);
  // 끝에 닿은 상태에서 시작한 터치의 시작 x좌표. 끝이 아닌 곳에서 시작했으면 null
  const pullStart = useRef<number | null>(null);
  const wheelPull = useRef(0);
  const [atEnd, setAtEnd] = useState(false);

  const go = () => {
    if (moved.current) return;
    moved.current = true;
    router.push(allHref);
  };

  const onScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const end = isAtEnd(e.currentTarget);
    setAtEnd(end);
    if (!end) wheelPull.current = 0;
  };

  const onTouchStart = (e: React.TouchEvent<HTMLUListElement>) => {
    pullStart.current = hasMore && isAtEnd(e.currentTarget) ? e.touches[0].clientX : null;
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLUListElement>) => {
    const start = pullStart.current;
    pullStart.current = null;
    if (start === null || !isAtEnd(e.currentTarget)) return;
    // 왼쪽으로(다음 쪽으로) PULL_TOUCH 이상 끌었다가 놓았을 때만
    if (start - e.changedTouches[0].clientX >= PULL_TOUCH) go();
  };

  const onWheel = (e: React.WheelEvent<HTMLUListElement>) => {
    if (!hasMore || !isAtEnd(e.currentTarget) || e.deltaX <= 0) return;
    wheelPull.current += e.deltaX;
    if (wheelPull.current >= PULL_WHEEL) go();
  };

  return (
    <ul
      onScroll={onScroll}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      // 가로 스크롤바 숨김(Firefox: scrollbar-width, Chrome·Safari: ::-webkit-scrollbar)
      className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
      {hasMore ? (
        // 끝에 닿으면 안내를 보여준다. 여기서 한 번 더 끌었다 놓으면 넘어간다
        // (누르는 전체 보기는 영역 오른쪽 위 '전체 보기 ›' 링크)
        <li aria-hidden="true" className="flex w-14 shrink-0 items-center justify-center text-center text-[11px] leading-tight text-neutral-400">
          {atEnd ? (
            <span>
              더 밀면
              <br />
              전체 보기
            </span>
          ) : (
            "›"
          )}
        </li>
      ) : null}
    </ul>
  );
}
