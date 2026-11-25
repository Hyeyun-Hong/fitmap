import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <main className="flex-1">
      <Header title="서비스 안내" back="/settings" />
      <div className="space-y-5 px-5 py-5 text-sm leading-relaxed text-neutral-700">
        <section>
          <h2 className="mb-1 font-bold text-neutral-900">FIT MAP은요</h2>
          <p>입어 보고 핏이 마음에 들었던 옷을 기준으로, 다른 브랜드 옷의 실측이 얼마나 비슷한지 비교해 드리는 서비스예요.</p>
        </section>
        <section>
          <h2 className="mb-1 font-bold text-neutral-900">실측 데이터</h2>
          <p>상품 실측은 각 브랜드 공식 페이지에서 직접 확인한 값이에요. 브랜드마다 재는 방식이 달라서, 둘레로 적힌 값은 반으로 나눠 단면으로 바꾸고, 총장과 인심처럼 기준이 다른 항목은 비교하지 않아요.</p>
        </section>
        <section>
          <h2 className="mb-1 font-bold text-neutral-900">핏 유사도</h2>
          <p>핏 유사도는 실측이 얼마나 비슷한지를 보여줄 뿐, 착용감을 보장하지는 않아요. 실측이 비슷해도 소재와 신축성에 따라 착용감은 다를 수 있어요.</p>
        </section>
        <section>
          <h2 className="mb-1 font-bold text-neutral-900">내 정보 저장</h2>
          <p>등록한 기준 옷, 찜, 최근 본 상품은 지금 쓰는 브라우저에만 저장돼요.</p>
        </section>
      </div>
    </main>
  );
}
