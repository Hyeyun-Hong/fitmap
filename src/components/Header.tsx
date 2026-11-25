import Link from "next/link";

export default function Header({ title, back }: { title: string; back?: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-neutral-100 bg-white px-4">
      {back ? (
        <Link href={back} aria-label="뒤로" className="-ml-2 px-2 text-xl text-neutral-500">
          ‹
        </Link>
      ) : null}
      <h1 className="truncate text-base font-bold">{title}</h1>
    </header>
  );
}
