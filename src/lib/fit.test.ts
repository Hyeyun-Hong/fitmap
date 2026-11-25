// 실행: npx tsx --test src/lib/fit.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { compareProduct, compareSize, describeDiff, normalize } from "./fit";
import { fallbackOpinion } from "./prompts";
import type { Product, ReferenceGarment } from "../types/fitmap";
import products from "../../data/products.sample.json";

const jeans = (products as Product[]).find((p) => p.id === "P002")!;
const cardigan = (products as Product[]).find((p) => p.id === "P001")!;

const refJeans: ReferenceGarment = {
  id: "R1",
  name: "내가 만족한 청바지",
  category: "bottom",
  subCategory: "denim",
  size: "30",
  measurements: { waist: 42, thigh: 34, rise: 26.5, hem: 25, length: 107 },
  inputMethod: "manual",
  isPrimary: true,
  createdAt: "2026-11-25",
};

test("둘레는 ÷2 해서 단면으로 바꾼다", () => {
  assert.deepEqual(normalize("waist", 84, { waist: "circumference" }), { value: 42, basis: "flat" });
  assert.deepEqual(normalize("waist", 42), { value: 42, basis: "flat" });
});

test("값이 같으면 유사도 100, 상태 same", () => {
  const r = compareSize(
    "top",
    { measurements: { shoulder: 50, chest: 60, length: 70, sleeve: 60 } },
    { label: "M", measurements: { shoulder: 50, chest: 60, length: 70, sleeve: 60 } },
  );
  assert.equal(r.similarity, 100);
  assert.ok(r.diffs.every((d) => d.status === "same"));
});

test("총장과 인심은 서로 비교하지 않는다", () => {
  const r = compareSize(
    "bottom",
    { measurements: { waist: 42, thigh: 34, length: 107 } },
    { label: "30", measurements: { waist: 42, thigh: 34, length: 80 }, basis: { length: "inseam" } },
  );
  const len = r.diffs.find((d) => d.part === "length")!;
  assert.equal(len.status, "basis_mismatch");
  assert.equal(len.diff, null);
  assert.equal(r.comparableCount, 2);
  assert.equal(r.similarity, 100);
});

test("비교 항목이 2개 미만이면 유사도를 계산하지 않는다", () => {
  const r = compareSize("top", { measurements: { chest: 60 } }, { label: "M", measurements: { chest: 61, shoulder: 50 } });
  assert.equal(r.comparableCount, 1);
  assert.equal(r.similarity, null);
});

test("샘플 청바지: 기준 옷과 가장 가까운 M을 추천한다", () => {
  const result = compareProduct(refJeans, jeans);
  assert.equal(result.recommendedSize, "M");
  const m = result.bySize.find((s) => s.sizeLabel === "M")!;
  assert.equal(m.diffs.find((d) => d.part === "thigh")!.diff, 0.3);
  assert.equal(describeDiff(m.diffs.find((d) => d.part === "waist")!), "거의 같음");
  assert.ok((m.similarity as number) >= 95);
});

test("둘레로 입력한 기준 옷도 같은 결과", () => {
  const refCirc: ReferenceGarment = {
    ...refJeans,
    id: "R2",
    measurements: { ...refJeans.measurements, waist: 84 },
    measurementBasis: { waist: "circumference" },
  };
  assert.equal(compareProduct(refCirc, jeans).recommendedSize, "M");
});

test("상의 기준 옷으로 하의를 비교하면 경고만 낸다", () => {
  const refTop: ReferenceGarment = { ...refJeans, id: "R3", category: "top", subCategory: "knit", measurements: { chest: 60, shoulder: 52 } };
  const result = compareProduct(refTop, jeans);
  assert.equal(result.bySize.length, 0);
  assert.equal(result.recommendedSize, null);
  assert.equal(result.warnings.length, 1);
});

test("아우터와 일반 상의를 비교하면 경고를 붙인다", () => {
  const refOuter: ReferenceGarment = {
    ...refJeans,
    id: "R4",
    category: "top",
    subCategory: "outer",
    measurements: { shoulder: 53.5, chest: 62, length: 64, sleeve: 60.7 },
  };
  const result = compareProduct(refOuter, cardigan);
  assert.equal(result.recommendedSize, "M");
  assert.ok(result.warnings.some((w) => w.includes("아우터")));
});

test("API가 없을 때 고정 문장을 만든다", () => {
  const op = fallbackOpinion(compareProduct(refJeans, jeans));
  assert.equal(op.fallback, true);
  assert.equal(op.recommendedSize, "M");
  assert.ok(op.headline.startsWith("M 사이즈 유사도"));
});
