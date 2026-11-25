"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", match: (p: string) => p === "/" },
  { href: "/brands", label: "브랜드", match: (p: string) => p.startsWith("/brands") || p.startsWith("/products") || p.startsWith("/compare") },
  { href: "/basket", label: "비교함", match: (p: string) => p.startsWith("/basket") },
  { href: "/closet", label: "내 옷장", match: (p: string) => p.startsWith("/closet") || p.startsWith("/register") },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-neutral-200 bg-white">
      <ul className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex h-16 items-center justify-center text-sm ${active ? "font-bold text-neutral-900" : "text-neutral-400"}`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
