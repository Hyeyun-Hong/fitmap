import BackButton from "./BackButton";

/** back: 바로 들어왔을 때(직전 화면이 없을 때) 돌아갈 주소 */
export default function Header({ title, back }: { title: string; back?: string }) {
  return (
    <header className="flex h-12 items-center gap-2 px-4">
      {back ? <BackButton fallback={back} /> : null}
      <h1 className="truncate text-base font-bold">{title}</h1>
    </header>
  );
}
