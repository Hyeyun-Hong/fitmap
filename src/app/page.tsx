import Link from "next/link";
import HomeClient from "./_home/HomeClient";
import { brands } from "@/lib/data";

export default function Home() {
  return (
    <main className="flex-1">
      <header className="px-5 pb-4 pt-8">
        <p className="text-xs font-semibold tracking-widest text-neutral-400">FIT MAP</p>
        <h1 className="mt-1 text-2xl font-bold leading-snug">
          내가 만족했던 옷으로
          <br />새 옷의 핏을 비교해요
        </h1>
      </header>
      <HomeClient />
      <section className="px-5 py-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">브랜드 바로가기</h2>
          <Link href="/brands" className="text-sm text-neutral-500">
            전체 보기
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {brands.map((b) => (
            <Link key={b.id} href={`/brands/${b.id}`} className="rounded-lg border border-neutral-200 px-2 py-3 text-center text-sm">
              {b.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
