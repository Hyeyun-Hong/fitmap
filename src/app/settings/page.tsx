import Link from "next/link";
import Header from "@/components/Header";

const ITEMS = [
  { label: "측정 가이드", href: "/settings/guide" },
  { label: "서비스 안내", href: "/settings/about" },
  { label: "문의", href: "/settings/contact" },
];

export default function SettingsPage() {
  return (
    <main className="flex-1">
      <Header title="설정" back="/mypage" />
      <ul className="mx-5 divide-y divide-neutral-100 border-y border-neutral-100">
        {ITEMS.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="flex items-center justify-between py-4 text-[15px]">
              <span>{it.label}</span>
              <span className="text-neutral-400">›</span>
            </Link>
          </li>
        ))}
        <li className="flex items-center justify-between py-4 text-[15px] text-neutral-400">
          <span>로그아웃</span>
          <span className="text-xs">로그인 기능 준비 중</span>
        </li>
      </ul>
    </main>
  );
}
