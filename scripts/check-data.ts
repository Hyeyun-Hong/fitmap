/* eslint-disable @typescript-eslint/no-explicit-any -- 형식이 맞는지 모르는 JSON을 검사하는 스크립트라 any로 읽는다 */
// 데이터 파일 검사: npm run check:data
// data/products.json의 이미지 경로와 data/review-summaries.json의 형식을 확인한다.
// 문제가 있으면 어느 상품의 어느 칸인지 알려주고 실패(exit 1)로 끝난다.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const read = (f: string) => JSON.parse(readFileSync(join(root, "data", f), "utf8"));

const errors: string[] = [];
const warns: string[] = [];
const err = (where: string, msg: string) => errors.push(`✗ ${where}: ${msg}`);
const warn = (where: string, msg: string) => warns.push(`! ${where}: ${msg}`);

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isStr = (v: unknown): v is string => typeof v === "string";
const isStrArr = (v: unknown) => Array.isArray(v) && v.every(isStr);

// ---------- 상품 ----------
const products = read("products.json") as Record<string, any>[];
const brands = read("brands.json") as { id: string }[];
const brandIds = new Set(brands.map((b) => b.id));
const productIds = new Set<string>();

for (const p of products) {
  const at = `상품 ${p.id ?? "(id 없음)"}`;
  if (productIds.has(p.id)) err(at, "id가 중복돼요");
  productIds.add(p.id);
  if (!brandIds.has(p.brandId)) err(at, `brandId "${p.brandId}"가 brands.json에 없어요`);
  if (p.imageUrl !== null && p.imageUrl !== undefined) {
    if (!isStr(p.imageUrl)) err(at, "imageUrl은 문자열이나 null이어야 해요");
    else if (p.imageUrl.startsWith("/")) {
      if (!existsSync(join(root, "public", p.imageUrl))) err(at, `public${p.imageUrl} 파일이 없어요`);
    } else if (!p.imageUrl.startsWith("https://")) err(at, "imageUrl은 /images/products/… 또는 https://… 로 시작해야 해요");
    if (!p.source?.note) warn(at, "이미지를 넣었으면 source.note에 사용 권한 근거를 적어 주세요");
  }
  if (p.source?.checkedAt && !DATE.test(p.source.checkedAt)) err(at, "source.checkedAt은 YYYY-MM-DD 형식이어야 해요");
}

// ---------- 리뷰 분석 ----------
const OVERALL = ["작게 느껴짐", "정사이즈", "크게 느껴짐", "의견 갈림"];
const STRETCH = ["있음", "약간", "없음", "언급 없음"];
const CONF = ["높음", "보통", "낮음"];
const PARTS = ["어깨", "가슴", "기장", "소매", "허리", "허벅지", "밑위", "밑단"];

const reviews = read("review-summaries.json");
if (!Array.isArray(reviews)) {
  err("review-summaries.json", "맨 바깥이 [ ] 배열이어야 해요");
} else {
  const seen = new Set<string>();
  reviews.forEach((r: any, i: number) => {
    const at = `리뷰 ${r?.productId ?? `#${i + 1}`}`;
    if (!productIds.has(r?.productId)) err(at, "productId가 products.json에 없어요");
    if (seen.has(r?.productId)) err(at, "같은 상품의 리뷰 분석이 두 번 들어 있어요");
    seen.add(r?.productId);
    if (!Number.isInteger(r?.reviewCount) || r.reviewCount < 0) err(at, "reviewCount는 0 이상의 정수여야 해요");

    const sf = r?.sizeFit ?? {};
    if (!OVERALL.includes(sf.overall)) err(at, `sizeFit.overall은 ${OVERALL.join(" / ")} 중 하나여야 해요 (지금: "${sf.overall}")`);
    if (!STRETCH.includes(sf.stretch)) err(at, `sizeFit.stretch는 ${STRETCH.join(" / ")} 중 하나여야 해요 (지금: "${sf.stretch}")`);
    const ratio = sf.ratio ?? {};
    for (const k of ["small", "true", "large"]) {
      if (typeof ratio[k] !== "number" || ratio[k] < 0) err(at, `sizeFit.ratio.${k}는 0 이상의 숫자여야 해요`);
    }
    if (!Array.isArray(sf.byPart)) err(at, "sizeFit.byPart는 배열이어야 해요");
    else
      sf.byPart.forEach((b: any) => {
        if (!PARTS.includes(b?.part)) err(at, `byPart.part "${b?.part}"는 ${PARTS.join("·")} 중 하나여야 해요`);
        if (!isStr(b?.note) || !b.note) err(at, `byPart "${b?.part}"의 note가 비어 있어요`);
      });

    if (!isStrArr(r?.materialQuality?.pros) || !isStrArr(r?.materialQuality?.cons)) err(at, "materialQuality.pros / cons는 문자열 배열이어야 해요");
    if (!isStrArr(r?.cautions)) err(at, "cautions는 문자열 배열이어야 해요");

    if (!CONF.includes(r?.confidence)) err(at, `confidence는 ${CONF.join(" / ")} 중 하나여야 해요`);
    else if (Number.isInteger(r?.reviewCount)) {
      const expect = r.reviewCount >= 30 ? "높음" : r.reviewCount >= 10 ? "보통" : "낮음";
      if (expect !== r.confidence) warn(at, `리뷰가 ${r.reviewCount}개면 confidence를 "${expect}"(으)로 적어 주세요 (지금: "${r.confidence}")`);
    }

    if (!isStr(r?.source?.description) || !r.source.description) err(at, "source.description(어디서 모은 리뷰인지)을 적어 주세요");
    if (r?.source?.collectedAt !== null && !DATE.test(r?.source?.collectedAt ?? "")) err(at, "source.collectedAt은 YYYY-MM-DD 형식이나 null이어야 해요");

    // 프롬프트 양식을 고치지 않고 붙여 넣은 경우
    if (JSON.stringify(r).includes(" | ")) err(at, '"A | B" 같은 양식 문구가 남아 있어요. 하나만 골라 적어 주세요');
  });
}

// ---------- 결과 ----------
const imageCount = products.filter((p) => p.imageUrl).length;
const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
console.log(`상품 ${products.length}개 (이미지 있는 상품 ${imageCount}개) · 리뷰 분석 ${reviewCount}개`);
warns.forEach((w) => console.log(w));
errors.forEach((e) => console.log(e));
if (errors.length) {
  console.log(`\n문제 ${errors.length}개를 고친 뒤 다시 실행해 주세요.`);
  process.exit(1);
}
console.log("데이터 형식 문제 없음");
