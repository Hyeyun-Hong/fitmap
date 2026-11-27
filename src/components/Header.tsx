import type { ReactNode } from "react";
import BackButton from "./BackButton";

/** back: 바로 들어왔을 때(직전 화면이 없을 때) 돌아갈 주소. action: 제목 바로 옆에 둘 버튼(예: 찜) */
export default function Header({ title, back, action }: { title: string; back?: string; action?: ReactNode }) {
  return (
    <header className="flex h-12 items-center gap-2 px-4">
      {back ? <BackButton fallback={back} /> : null}
      <h1 className="truncate text-base font-bold">{title}</h1>
      {action}
    </header>
  );
}
