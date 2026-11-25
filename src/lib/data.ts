// JSON 데이터 읽기. 화면에서는 data/*.json을 직접 import하지 말고 이 파일의 함수만 쓴다.
import productsJson from "../../data/products.json";
import brandsJson from "../../data/brands.json";
import reviewsJson from "../../data/review-summaries.sample.json";
import type { Brand, Category, Product, ReviewSummary, SubCategory } from "../types/fitmap";

export const products = productsJson as Product[];
export const brands = brandsJson as Brand[];
const reviews = reviewsJson as ReviewSummary[];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getBrand = (id: string) => brands.find((b) => b.id === id);
export const getReview = (productId: string) => reviews.find((r) => r.productId === productId) ?? null;

export const brandsByCategory = (category: Category) => brands.filter((b) => b.categories.includes(category));

export const productsByBrand = (brandId: string, category?: Category) =>
  products.filter((p) => p.brandId === brandId && (!category || p.category === category));

export const CATEGORY_LABEL: Record<Category, string> = { top: "상의", bottom: "하의" };

export const SUB_LABEL: Record<SubCategory, string> = {
  tshirt: "티셔츠",
  shirt: "셔츠",
  knit: "니트",
  sweat: "스웨트·플리스",
  outer: "아우터",
  denim: "데님",
  slacks: "슬랙스",
  cotton: "코튼",
  jogger: "조거",
  etc: "기타",
};

export const won = (n: number | null) => (n === null ? "-" : `${n.toLocaleString("ko-KR")}원`);
