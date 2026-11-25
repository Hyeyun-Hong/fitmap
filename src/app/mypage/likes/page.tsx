"use client";
import Header from "@/components/Header";
import SavedProducts from "@/components/SavedProducts";
import { useLikes } from "@/lib/storage";

export default function LikesPage() {
  const likes = useLikes();
  return (
    <main className="flex-1">
      <Header title={`찜 ${likes?.length ?? ""}`} back="/mypage" />
      <SavedProducts ids={likes} empty="찜한 상품이 없어요. 상품의 하트를 눌러 담아 보세요." />
    </main>
  );
}
