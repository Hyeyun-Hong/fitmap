"use client";
// 상단 '뒤로'(‹) 버튼. 앱 안에서 이동해 왔으면 직전 화면으로, 바로 들어왔으면(공유 링크·새로고침) fallback 주소로 간다.
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// 앱 안에서 거쳐 온 주소 기록. 새로고침하면 비워진다.
const visited: string[] = [];

/** 공통 레이아웃(AppHeader)에서 한 번 호출해 화면 이동을 기록한다 */
export function useTrackNavigation() {
  const pathname = usePathname();
  useEffect(() => {
    if (visited[visited.length - 1] === pathname) return;
    // 브라우저 뒤로 가기로 직전 화면에 돌아온 경우
    if (visited[visited.length - 2] === pathname) visited.pop();
    else visited.push(pathname);
  }, [pathname]);
}

export default function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="뒤로"
      onClick={() => (visited.length > 1 ? router.back() : router.push(fallback))}
      className="-ml-2 px-2 text-xl text-neutral-500"
    >
      ‹
    </button>
  );
}
