import Header from "@/components/Header";

export default function BasketPage() {
  return (
    <main className="flex-1">
      <Header title="비교함" />
      <div className="px-5 py-16 text-center">
        <p className="font-bold">준비 중인 기능이에요</p>
        <p className="mt-2 text-sm text-neutral-500">여러 상품을 담아 한 번에 비교하는 화면이 들어갈 자리예요.</p>
      </div>
    </main>
  );
}
