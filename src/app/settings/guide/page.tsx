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

export default function GuidePage() {
  return (
    <main className="flex-1">
      <Header title="측정 가이드" back="/settings" />
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
      </div>
    </main>
  );
}
