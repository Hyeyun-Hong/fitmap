"use client";
import Link from "next/link";
import { CATEGORY_SLUGS } from "@/lib/data";

export type DrawerBrand = { id: string; name: string; count: number };

const GROUPS: { title: string; slugs: string[] }[] = [
  { title: "상의", slugs: ["top", "tshirt", "shirt", "knit", "sweat"] },
  { title: "하의", slugs: ["bottom", "denim", "slacks", "cotton", "jogger"] },
  { title: "아우터", slugs: ["outer"] },
];

export default function CategoryDrawer({ open, onClose, brands }: { open: boolean; onClose: () => void; brands: DrawerBrand[] }) {
  return (
    <div className={`fixed inset-y-0 left-0 right-0 z-30 mx-auto max-w-md overflow-hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <nav
        className={`absolute inset-y-0 left-0 w-72 max-w-[80%] overflow-y-auto bg-white transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-100 px-5">
          <span className="font-bold">카테고리</span>
          <button onClick={onClose} aria-label="닫기" className="text-2xl leading-none text-neutral-400">
            ×
          </button>
        </div>
        <div className="space-y-6 px-5 py-5">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h2 className="mb-2 text-xs font-semibold text-neutral-400">{g.title}</h2>
              <ul className="space-y-1">
                {g.slugs.map((s) => (
                  <li key={s}>
                    <Link href={`/category/${s}`} onClick={onClose} className="block py-1.5 text-[15px]">
                      {CATEGORY_SLUGS[s].label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section>
            <h2 className="mb-2 text-xs font-semibold text-neutral-400">브랜드</h2>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
              {brands.map((b) => (
                <li key={b.id}>
                  <Link href={`/brands/${b.id}`} onClick={onClose} className="block py-1.5 text-[15px]">
                    {b.name}
                    <span className="ml-1 text-xs text-neutral-400">{b.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </nav>
    </div>
  );
}
