import Header from "@/components/Header";

export default function ContactPage() {
  return (
    <main className="flex-1">
      <Header title="문의" back="/settings" />
      <div className="px-5 py-16 text-center">
        <p className="font-bold">문의 창구를 준비하고 있어요</p>
        <p className="mt-2 text-sm text-neutral-500">이메일이나 채팅 상담이 들어갈 자리예요.</p>
      </div>
    </main>
  );
}
