import Header from "@/components/Header";
import { PARAMS, partsOf } from "@/lib/fit";
import { CATEGORY_LABEL } from "@/lib/data";
import { PART_LABEL } from "@/types/fitmap";
import type { Category } from "@/types/fitmap";

// 화면의 숫자는 전부 fit.ts의 PARAMS에서 읽는다. PARAMS를 바꾸면 이 페이지도 같이 바뀐다.
const pct = (w: number | undefined) => (w === undefined ? "-" : `${Math.round(w * 100)}%`);
const EX_TOL = PARAMS.tolerance.top.chest ?? 0;
const EX_DIFF = 2;
const EX_SCORE = EX_TOL > 0 ? Math.max(0, 1 - EX_DIFF / EX_TOL) : 0;

const STEPS: { title: string; body: string }[] = [
  {
    title: "단면으로 맞춰요",
    body: "둘레로 적힌 값은 반으로 나눠 단면으로 바꿔요. 총장과 인심, 소매길이와 화장처럼 재는 위치가 다른 항목은 서로 비교하지 않고 \"비교 불가\"로 표시해요.",
  },
  {
    title: "항목별 차이를 구해요",
    body: `같은 항목끼리 "상품 실측 − 기준 옷 실측"을 cm로 구해요. 차이가 ${PARAMS.sameThreshold}cm 이하면 "거의 같음", ${PARAMS.slightThreshold}cm 이하면 "약간", 그보다 크면 "큼"으로 보여드려요.`,
  },
  {
    title: "항목마다 점수를 매겨요",
    body: `점수 = max(0, 1 − |차이| ÷ 허용범위). 차이가 없으면 1점이고, 차이가 허용범위만큼 벌어지면 0점이에요. 예를 들어 가슴단면 허용범위가 ${EX_TOL}cm일 때 ${EX_DIFF}cm 차이 나면 ${EX_SCORE.toFixed(2)}점이에요.`,
  },
  {
    title: "가중평균을 내서 100점 만점으로 바꿔요",
    body: "핏에 크게 영향을 주는 항목일수록 가중치가 커요. 비교할 수 있는 항목만 모아 가중평균을 내고 100을 곱해 핏 유사도로 보여드려요. 비교할 수 없는 항목은 계산에서 빼고, 남은 항목의 가중치 합으로 나눠요.",
  },
  {
    title: "비교할 항목이 적으면 계산하지 않아요",
    body: `비교할 수 있는 항목이 ${PARAMS.minComparableParts}개 미만이면 숫자가 믿기 어려워서 핏 유사도를 계산하지 않고 "비교 정보 부족"으로 보여드려요.`,
  },
  {
    title: "핏 유사도가 가장 높은 사이즈를 추천해요",
    body: "상품의 사이즈마다 같은 방법으로 계산한 뒤 가장 높은 사이즈를 추천해요. 점수가 같으면 항목별 차이를 더한 값이 작은 사이즈를 골라요.",
  },
];

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
          <h2 className="mb-2 font-bold text-neutral-900">핏 유사도는 이렇게 계산해요</h2>
          <ol className="space-y-3">
            {STEPS.map((st, i) => (
              <li key={st.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">{i + 1}</span>
                <div>
                  <p className="font-semibold text-neutral-900">{st.title}</p>
                  <p>{st.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="mb-1 font-bold text-neutral-900">항목별 허용범위와 가중치</h2>
          <p className="mb-3 text-xs text-neutral-500">허용범위는 점수가 0이 되는 차이예요. 팀이 정한 초기값이라 바뀔 수 있어요.</p>
          <div className="space-y-4">
            {(["top", "bottom"] as Category[]).map((c) => (
              <table key={c} className="w-full border-collapse text-left">
                <caption className="mb-1 text-left text-xs font-semibold text-neutral-500">{CATEGORY_LABEL[c]}</caption>
                <thead>
                  <tr className="border-b border-neutral-900 text-xs text-neutral-500">
                    <th className="py-2 font-semibold">항목</th>
                    <th className="py-2 text-right font-semibold">허용범위</th>
                    <th className="py-2 text-right font-semibold">가중치</th>
                  </tr>
                </thead>
                <tbody>
                  {partsOf(c).map((part) => {
                    const tol = PARAMS.tolerance[c][part];
                    return (
                      <tr key={part} className="border-b border-neutral-100">
                        <td className="py-2">{PART_LABEL[c][part] ?? part}</td>
                        <td className="py-2 text-right">{tol === undefined ? "-" : `${tol}cm`}</td>
                        <td className="py-2 text-right">{pct(PARAMS.weight[c][part])}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-1 font-bold text-neutral-900">내 정보 저장</h2>
          <p>등록한 기준 옷, 찜, 최근 본 상품은 지금 쓰는 브라우저에만 저장돼요.</p>
        </section>
      </div>
    </main>
  );
}
