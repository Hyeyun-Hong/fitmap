"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { addReference, updateReference, useReferences } from "@/lib/storage";
import { products, CATEGORY_LABEL, SUB_LABEL } from "@/lib/data";
import { partsOf } from "@/lib/fit";
import type { Basis, Category, MeasurementBasis, Part, ReferenceGarment, SubCategory } from "@/types/fitmap";

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

// /register → 새로 등록, /register?edit=<기준 옷 id> → 같은 폼으로 수정
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterRoute />
    </Suspense>
  );
}

function RegisterRoute() {
  const editId = useSearchParams().get("edit");
  const refs = useReferences();
  if (!editId) return <RegisterForm />;
  if (refs === null) return null;
  const target = refs.find((r) => r.id === editId);
  if (!target) {
    return (
      <main className="flex-1">
        <Header title="기준 옷 수정" back="/mypage" />
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-neutral-500">수정할 기준 옷을 찾지 못했어요.</p>
          <Link href="/mypage" className="mt-4 inline-block rounded-lg border border-neutral-300 px-4 py-2 text-sm">
            마이페이지로 가기
          </Link>
        </div>
      </main>
    );
  }
  return <RegisterForm key={target.id} initial={target} />;
}

const toInputs = (r: ReferenceGarment) => {
  const v: Partial<Record<Part, string>> = {};
  for (const part of partsOf(r.category)) {
    const n = r.measurements[part];
    if (n !== null && n !== undefined) v[part] = String(n);
  }
  return v;
};

/** 등록·수정 공용 폼. initial이 있으면 수정 모드 */
function RegisterForm({ initial }: { initial?: ReferenceGarment }) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [category, setCategory] = useState<Category>(initial?.category ?? "top");
  const [subCategory, setSubCategory] = useState<SubCategory>(initial?.subCategory ?? "tshirt");
  const [name, setName] = useState(initial?.name ?? "");
  const [brandName, setBrandName] = useState(initial?.brandName ?? "");
  const [size, setSize] = useState(initial?.size ?? "");
  const [values, setValues] = useState<Partial<Record<Part, string>>>(() => (initial ? toInputs(initial) : {}));
  const [basis, setBasis] = useState<MeasurementBasis>(initial?.measurementBasis ?? {});
  const [method, setMethod] = useState<"manual" | "from_product">(initial?.inputMethod ?? "manual");
  const [pickId, setPickId] = useState("");
  const [error, setError] = useState("");

  const candidates = useMemo(() => products.filter((p) => p.category === category && p.sizes.length > 0), [category]);
  const picked = candidates.find((p) => p.id === pickId);

  const switchCategory = (c: Category) => {
    // 수정 중에는 상의/하의를 바꾸지 않는다(대표 지정이 카테고리별이라서)
    if (editing || c === category) return;
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
    const fields = {
      name: name.trim(),
      brandName: brandName.trim() || undefined,
      subCategory,
      size: size.trim() || undefined,
      officialUrl: initial?.officialUrl,
      measurements,
      measurementBasis: basis,
      inputMethod: method,
    };
    if (initial) {
      if (!updateReference(initial.id, fields)) return setError("수정할 기준 옷을 찾지 못했어요.");
    } else {
      addReference({ ...fields, category });
    }
    router.push("/mypage");
  };

  return (
    <main className="flex-1">
      <Header title={editing ? "기준 옷 수정" : "기준 옷 등록"} back="/mypage" />
      <div className="space-y-6 px-5 py-5">
        <p className="text-sm text-neutral-500">
          {editing
            ? "저장된 실측을 고쳐 주세요. 저장하면 비교 결과와 추천이 새 실측으로 다시 계산돼요."
            : "입어보고 핏이 마음에 들었던 옷을 등록해 주세요. 이 옷의 실측이 비교 기준이 돼요."}
        </p>

        <div>
          <div className="grid grid-cols-2 gap-2">
            {(["top", "bottom"] as Category[]).map((c) => (
              <button
                key={c}
                onClick={() => switchCategory(c)}
                disabled={editing && category !== c}
                className={`rounded-lg border py-3 text-sm font-bold disabled:text-neutral-300 ${category === c ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200"}`}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          {editing ? <p className="mt-2 text-xs text-neutral-400">수정할 때는 상의/하의를 바꿀 수 없어요. 바꾸려면 새로 등록해 주세요.</p> : null}
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
          {editing ? "수정 완료" : "등록 완료"}
        </button>
      </div>
    </main>
  );
}
