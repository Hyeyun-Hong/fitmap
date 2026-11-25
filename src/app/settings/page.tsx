import Header from "@/components/Header";

const TOP = [
  ["어깨너비", "양쪽 어깨 솔기 끝 사이를 일직선으로"],
  ["가슴단면", "겨드랑이 바로 아래를 가로로"],
  ["총장", "목 옆 어깨선에서 밑단까지"],
  ["소매길이", "어깨 솔기에서 소매 끝까지"],
];
const BOTTOM = [
  ["허리단면", "허리 밴드 양 끝을 가로로"],
  ["허벅지단면", "가랑이 바로 아래 한쪽 다리 폭"],
  ["밑위", "가랑이 봉제선에서 허리 밴드 위까지(앞쪽)"],
  ["밑단단면", "밑단 한쪽 폭"],
  ["총장", "허리 위에서 밑단까지"],
];

export default function SettingsPage() {
  return (
    <main className="flex-1">
      <Header title="측정 가이드 · 서비스 안내" back="/closet" />
      <div className="space-y-6 px-5 py-5 text-sm">
        <p className="text-neutral-600">옷을 바닥에 평평하게 펼치고 줄자로 재요. 단위는 cm예요.</p>
        {[
          ["상의", TOP],
          ["하의", BOTTOM],
        ].map(([title, rows]) => (
          <section key={title as string}>
            <h2 className="mb-2 font-bold">{title as string}</h2>
            <dl className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
              {(rows as string[][]).map(([k, v]) => (
                <div key={k} className="flex gap-3 px-4 py-3">
                  <dt className="w-20 shrink-0 font-semibold">{k}</dt>
                  <dd className="text-neutral-600">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <section className="rounded-xl bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-600">
          <p className="mb-1 font-bold text-neutral-900">알아두세요</p>
          <p>상품 실측은 각 브랜드 공식 페이지에서 직접 확인한 값이에요. 브랜드마다 재는 방식이 달라서, 둘레로 적힌 값은 반으로 나눠 단면으로 바꾸고, 총장과 인심처럼 기준이 다른 항목은 비교하지 않아요.</p>
          <p className="mt-2">핏 유사도는 실측이 얼마나 비슷한지를 보여줄 뿐, 착용감을 보장하지는 않아요.</p>
          <p className="mt-2">등록한 기준 옷은 이 브라우저에만 저장돼요.</p>
        </section>
      </div>
    </main>
  );
}
