"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { addReference } from "@/lib/storage";
import { products, CATEGORY_LABEL, SUB_LABEL } from "@/lib/data";
import { partsOf } from "@/lib/fit";
import type { Basis, Category, MeasurementBasis, Part, SubCategory } from "@/types/fitmap";

const PART_NAME: Record<Category, Partial<Record<Part, string>>> = {
  top: { shoulder: "어깨너비", chest: "가슴", length: "총장", sleeve: "소매" },
  bottom: { waist: "허리", thigh: "허벅지", rise: "밑위", hem: "밑단", length: "길이" },
};

const GUIDE: Record<Category, Partial<Record<Part, string>>> = {
  top: {
    shoulder: "양쪽 어깨 솔기 끝 사이",
    chest: "겨드랑이 바로 아래 가로 길이",
    length: "목 옆 어깨선에서 밑단까지",
    sleeve: "어깨 솔기에서 소매 끝까지",
  },
  bottom: {
    waist: "허리 밴드 양 끝 가로 길이",
    thigh: "가랑이 바로 아래 한쪽 다리 폭",
    rise: "가랑이에서 허리 밴드 위까지(앞)",
    hem: "밑단 한쪽 폭",
    length: "허리 위에서 밑단까지",
  },
};

const BASIS_OPTIONS: Record<Category, Partial<Record<Part, { value: Basis; label: string }[]>>> = {
  top: {
    chest: [
      { value: "flat", label: "단면" },
      { value: "circumference", label: "둘레" },
    ],
    sleeve: [
      { value: "shoulder_seam", label: "소매길이" },
      { value: "center_back", label: "화장(등 중심부터)" },
    ],
  },
  bottom: {
    waist: [
      { value: "flat", label: "단면" },
      { value: "circumference", label: "둘레" },
    ],
    thigh: [
      { value: "flat", label: "단면" },
      { value: "circumference", label: "둘레" },
    ],
    hem: [
      { value: "flat", label: "단면" },
      { value: "circumference", label: "둘레" },
    ],
    length: [
      { value: "total", label: "총장" },
      { value: "inseam", label: "인심(가랑이부터)" },
    ],
  },
};

const SUBS: Record<Category, SubCategory[]> = {
  top: ["tshirt", "shirt", "knit", "sweat", "outer"],
  bottom: ["denim", "slacks", "cotton", "jogger", "etc"],
};

export default function RegisterPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("top");
  const [subCategory, setSubCategory] = useState<SubCategory>("tshirt");
  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [size, setSize] = useState("");
  const [values, setValues] = useState<Partial<Record<Part, string>>>({});
  const [basis, setBasis] = useState<MeasurementBasis>({});
  const [method, setMethod] = useState<"manual" | "from_product">("manual");
  const [pickId, setPickId] = useState("");
  const [error, setError] = useState("");

  const candidates = useMemo(() => products.filter((p) => p.category === category && p.sizes.length > 0), [category]);
  const picked = candidates.find((p) => p.id === pickId);

  const switchCategory = (c: Category) => {
    setCategory(c);
    setSubCategory(SUBS[c][0]);
    setValues({});
    setBasis({});
    setPickId("");
  };

  const loadFromProduct = (label: string) => {
    if (!picked) return;
    const s = picked.sizes.find((x) => x.label === label);
    if (!s) return;
    const v: Partial<Record<Part, string>> = {};
    for (const part of partsOf(category)) {
      const n = s.measurements[part];
      if (n !== null && n !== undefined) v[part] = String(n);
    }
    setValues(v);
    setBasis(picked.measurementBasis ?? {});
    setName(picked.name);
    setBrandName(picked.brandName);
    setSize(label);
    setSubCategory(picked.subCategory);
    setMethod("from_product");
  };

  const save = () => {
    const measurements: Partial<Record<Part, number>> = {};
    for (const part of partsOf(category)) {
      const n = Number(values[part]);
      if (values[part] && !Number.isNaN(n) && n > 0) measurements[part] = n;
    }
    if (!name.trim()) return setError("옷 이름을 적어 주세요.");
    if (Object.keys(measurements).length < 2) return setError("실측을 2개 항목 이상 입력해 주세요.");
    addReference({
      name: name.trim(),
      brandName: brandName.trim() || undefined,
      category,
      subCategory,
      size: size.trim() || undefined,
      measurements,
      measurementBasis: basis,
      inputMethod: method,
    });
    router.push("/mypage");
  };

  return (
    <main className="flex-1">
      <Header title="기준 옷 등록" back="/mypage" />
      <div className="space-y-6 px-5 py-5">
        <p className="text-sm text-neutral-500">입어보고 핏이 마음에 들었던 옷을 등록해 주세요. 이 옷의 실측이 비교 기준이 돼요.</p>

        <div className="grid grid-cols-2 gap-2">
          {(["top", "bottom"] as Category[]).map((c) => (
            <button
              key={c}
              onClick={() => switchCategory(c)}
              className={`rounded-lg border py-3 text-sm font-bold ${category === c ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200"}`}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <section className="rounded-xl bg-neutral-50 p-4">
          <p className="text-sm font-bold">FIT MAP 상품에서 불러오기</p>
          <p className="mt-1 text-xs text-neutral-500">가지고 있는 옷이 목록에 있으면 실측이 자동으로 채워져요.</p>
          <select value={pickId} onChange={(e) => setPickId(e.target.value)} className="mt-3 w-full rounded-lg border border-neutral-200 bg-white p-2 text-sm">
            <option value="">상품 선택</option>
            {candidates.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brandName} - {p.name}
              </option>
            ))}
          </select>
          {picked ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {picked.sizes.map((s) => (
                <button key={s.label} onClick={() => loadFromProduct(s.label)} className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs">
                  {s.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <p className="text-sm font-bold">옷 정보</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="옷 이름 (예: 자주 입는 흰 티)" className="w-full rounded-lg border border-neutral-200 p-3 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="브랜드 (선택)" className="rounded-lg border border-neutral-200 p-3 text-sm" />
            <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="사이즈 (예: M, 30)" className="rounded-lg border border-neutral-200 p-3 text-sm" />
          </div>
          <select value={subCategory} onChange={(e) => setSubCategory(e.target.value as SubCategory)} className="w-full rounded-lg border border-neutral-200 p-3 text-sm">
            {SUBS[category].map((s) => (
              <option key={s} value={s}>
                {SUB_LABEL[s]}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-sm font-bold">실측 입력 (cm)</p>
            <p className="mt-1 text-xs text-neutral-500">옷을 평평하게 펼치고 재요. 모르는 항목은 비워도 돼요.</p>
          </div>
          {partsOf(category).map((part) => {
            const opts = BASIS_OPTIONS[category][part];
            return (
              <div key={part} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-center gap-2">
                  <label htmlFor={`m-${part}`} className="w-16 shrink-0 text-sm font-semibold">
                    {PART_NAME[category][part]}
                  </label>
                  <input
                    id={`m-${part}`}
                    inputMode="decimal"
                    value={values[part] ?? ""}
                    onChange={(e) => setValues({ ...values, [part]: e.target.value })}
                    placeholder="0.0"
                    className="w-20 rounded-md border border-neutral-200 p-2 text-right text-sm"
                  />
                  {opts ? (
                    <select
                      value={basis[part] ?? opts[0].value}
                      onChange={(e) => setBasis({ ...basis, [part]: e.target.value as Basis })}
                      className="min-w-0 flex-1 rounded-md border border-neutral-200 p-2 text-xs"
                    >
                      {opts.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-neutral-400">{GUIDE[category][part]}</p>
              </div>
            );
          })}
        </section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button onClick={save} className="w-full rounded-xl bg-neutral-900 py-4 font-bold text-white">
          등록 완료
        </button>
      </div>
    </main>
  );
}
