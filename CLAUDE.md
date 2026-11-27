# FIT MAP — Claude Code 작업 규칙

이 파일은 팀원 4명의 Claude Code가 같은 규칙으로 코드를 만들게 하기 위한 문서다. 작업 전에 반드시 읽고, 규칙을 바꿔야 하면 PR로 이 파일부터 고친다.

## 프로젝트 한 줄 요약

남성 사용자가 이미 입어보고 만족한 옷(기준 옷)의 실측을 입력하면, 다른 브랜드 상품의 사이즈별 실측과 비교해 핏 유사도·추천 사이즈·AI 리뷰 요약을 보여주는 모바일 웹서비스. 'AI 실무활용과 스마트비즈니스' 기말 프로젝트, 발표 2026-12-11.

## 범위

**발표까지 만든다 (MVP)**: 상단 헤더(좌 카테고리 메뉴 · 가운데 FIT MAP 로고 → 홈 · 우 프로필 → 마이페이지), 홈(검색 · 추천 상품 슬라이드 · 프로모션), 카테고리별·브랜드별 상품 목록, 상품 상세(핏 비교 · 트레이싱지 겹쳐 보기 · AI 비교 분석), 비교 결과, 마이페이지(등급 · 기준 옷 목록 · 찜 · 최근 본 상품 · 설정), 기준 의류 등록, 공식 상품 페이지 이동. 하단 탭바는 쓰지 않는다.

**시간이 남으면**: 비교함, 측정 가이드 그림, 실제 브랜드 프로모션(제휴 확인 후), 등급 기준 확정.

**만들지 않는다**: 로그인·회원가입(비회원 + localStorage로 대체), 데이터베이스, 크롤링·실시간 수집, 결제, 무신사 할인 탐지·코디 추천 등 이전 기획 기능.

## 기술 스택

- Next.js (App Router) + TypeScript + Tailwind CSS
- 데이터: `data/*.json` 파일 (DB 없음)
- 기준 옷 · 찜 · 최근 본 상품 저장: 브라우저 localStorage (`src/lib/storage.ts`에서만 접근)
- AI: Next.js API Route `src/app/api/opinion/route.ts`에서 Claude API 호출
- 배포: GitHub → Vercel 자동 배포

## 폴더 구조 (IA 기준)

```
src/
  app/
    layout.tsx                  # 공통 상단 헤더(AppHeader) 포함
    page.tsx                    # 홈: 검색창 · 추천 상품 슬라이드 · 프로모션
    search/page.tsx             # 검색
    category/[slug]/page.tsx    # 카테고리별 상품 (top, tshirt, bottom, denim, outer …)
    brands/page.tsx             # 브랜드 전체
    brands/[brandId]/page.tsx   # 브랜드별 상품 목록
    products/[productId]/page.tsx  # 상품 상세: 핏 비교 · 트레이싱지 겹쳐 보기 · AI 비교 분석
    compare/[productId]/page.tsx   # 비교 결과(사이즈 바꿔 보기)
    mypage/page.tsx             # 마이페이지: 등급 · 기준 옷 목록 · 메뉴(새 기준 옷 등록, 찜, 최근 본 상품, 설정)
    mypage/likes/page.tsx       # 찜
    mypage/recent/page.tsx      # 최근 본 상품
    register/page.tsx           # 기준 의류 등록
    settings/page.tsx           # 설정 메뉴: 측정 가이드 · 서비스 안내 · 문의 · 로그아웃(준비 중)
    settings/guide/page.tsx     # 측정 가이드
    settings/about/page.tsx     # 서비스 안내
    settings/contact/page.tsx   # 문의(준비 중)
    basket/page.tsx             # 비교함(준비 중, 메뉴에서는 빠짐)
    closet/page.tsx             # 예전 주소 → /mypage 로 이동만 함
    api/opinion/route.ts        # AI 종합 의견
  components/
    AppHeader.tsx, CategoryDrawer.tsx  # 상단 헤더, 왼쪽 카테고리 메뉴
    ProductCard.tsx             # 상품 카드(슬라이드·목록 공용)
    FitOverlay.tsx              # 트레이싱지 겹쳐 보기(그림만, 계산은 fit.ts)
    …                           # 그 밖의 공통 UI
  lib/
    fit.ts                      # 실측 비교 계산 (수정 시 테스트 필수)
    useSimilarity.ts            # 상품 목록에 유사도 붙이기(fit.ts 호출)
    grade.ts                    # 마이페이지 등급(시안)
    prompts.ts                  # AI 프롬프트, 고정 문장
    storage.ts                  # localStorage 접근
    data.ts                     # JSON 데이터 읽기, 카테고리 주소 정의(CATEGORY_SLUGS)
  types/
    fitmap.ts                   # 공통 타입 (팀 공유)
data/
  brands.json
  products.json
  review-summaries.json         # 리뷰 분석 결과(상품당 1개, 없으면 화면에서 숨김)
public/images/products/         # 사용 권한 확인된 상품 이미지(<상품ID>.jpg)
scripts/check-data.ts           # 데이터 형식 검사(npm run check:data)
```

새 페이지나 폴더를 만들 때 위 구조를 따른다. 같은 기능을 다른 위치에 또 만들지 않는다.

## 데이터 규칙

- 타입은 `src/types/fitmap.ts`만 쓴다. 컴포넌트 안에서 비슷한 타입을 새로 정의하지 않는다.
- 상품·브랜드·URL·실측값을 지어내지 않는다. 화면 확인용 더미 데이터가 필요하면 `id`를 `DUMMY-`로 시작하게 하고, 배포 전에 지운다.
- 실측이 없는 항목은 키를 빼거나 `null`. 다른 사이즈나 다른 상품 값으로 추정해서 채우지 않는다.
- 측정 기준이 단면이 아니면 `measurementBasis`에 적는다. 예: 유니클로 허리 둘레 → `{ "waist": "circumference" }`, 인심 → `{ "length": "inseam" }`, 화장 → `{ "sleeve": "center_back" }`.
- `source.url`, `source.checkedAt`(YYYY-MM-DD)을 채운다. 모르면 `null`로 두고 `note`에 이유를 적는다.
- `imageUrl`은 사용 권한이 확인된 경우에만 넣는다. 아니면 `null`로 두고 화면에서는 플레이스홀더를 보여준다. 파일은 `public/images/products/<상품ID>.jpg`에 두고 `imageUrl`에 `/images/products/<상품ID>.jpg`로 적는다. 권한 근거는 `source.note`에 남긴다.
- 리뷰 분석은 `REVIEW_ANALYSIS_PROMPT`로 만든 JSON을 `data/review-summaries.json` 배열에 상품당 하나씩 넣는다. 넣은 뒤 `npm run check:data`가 통과해야 PR을 올린다.

## 계산 규칙 (src/lib/fit.ts)

- 차이, 유사도, 추천 사이즈는 전부 `fit.ts`의 함수로 계산한다. 컴포넌트 안에서 따로 계산하지 않는다.
- 둘레는 ÷2 해서 단면으로 바꿔 비교한다.
- 총장 vs 인심, 소매길이 vs 화장은 서로 비교하지 않고 `basis_mismatch`로 표시한다.
- 비교 가능한 항목이 2개 미만이면 유사도는 `null`("비교 정보 부족").
- 상의와 하의는 서로 비교하지 않는다. 아우터와 일반 상의를 비교하면 경고를 붙인다.
- 차이 해석: |차이| ≤ 1cm "거의 같음", 1~3cm "약간", 3cm 초과 "큼".
- 허용 범위·가중치(`PARAMS`)는 팀이 정한 초기값이다. 바꾸면 `fit.test.ts`도 고치고 `npx tsx --test src/lib/fit.test.ts`가 통과해야 PR을 올린다.

## AI 규칙

- AI는 계산 결과를 설명만 한다. 숫자를 AI에게 계산시키지 않는다.
- 상품별 리뷰 분석은 미리 만들어 `data/review-summaries.json`에 저장한다(`REVIEW_ANALYSIS_PROMPT`). 앱이 실행 중에 리뷰를 수집하거나 AI로 분석하지 않는다.
- 실시간 호출은 `/api/opinion` 하나뿐이고, 시스템 프롬프트는 `OPINION_SYSTEM_PROMPT`를 쓴다.
- API 키는 서버에서만 쓴다(`process.env.ANTHROPIC_API_KEY`). 클라이언트 코드, 커밋, 스크린샷에 키가 나오면 안 된다. `.env.local`은 커밋하지 않는다.
- API 호출이 실패하거나 키가 없으면 `fallbackOpinion()`으로 고정 문장을 보여준다. 화면이 깨지면 안 된다.
- 리뷰 요약이 없는 상품은 AI 리뷰 영역을 숨기고, 종합 의견은 실측만으로 만든다.

## 화면·문구 규칙

- 모바일 우선 (기준 폭 375px). 데스크톱은 가운데 정렬된 모바일 폭으로 보여줘도 된다.
- 모든 문구는 한국어 존댓말(~요체).
- "핏 정확도"가 아니라 **"핏 유사도"**. "딱 맞아요", "보장" 같은 단정 표현 금지.
- 비교 결과 화면에는 항상 한 줄 안내를 둔다: "실측이 비슷해도 소재와 신축성에 따라 착용감은 다를 수 있어요."
- 상품 상세에 실측 출처(공식 페이지 링크)와 확인일을 보여준다.
- 프로모션 영역에 실제 브랜드 할인·기획전을 지어내 넣지 않는다. 제휴가 확인되기 전에는 서비스 안내나 빈 자리로 둔다.
- 비교할 수 없는 항목은 숨기지 말고 "비교 불가"로 표시한다.

## Git·브랜치 규칙

- `main`은 배포 브랜치다. 직접 push하지 않고 PR로만 병합한다.
- 브랜치 이름: `feat/home`, `feat/product`처럼 기능 단위로.
- PR을 올리면 Vercel 미리보기 URL에서 화면을 확인한 뒤 다른 팀원 1명이 승인하고 병합한다.
- 병합 전에 `main`을 받아 충돌을 먼저 해결한다. `src/types/fitmap.ts`, `src/lib/fit.ts`, `CLAUDE.md`를 고친 PR은 팀에 알린다.
- 커밋 메시지는 한국어로 무엇을 했는지 한 줄. 예: `상품 상세에 사이즈별 실측표 추가`

## 명령어

```
npm run dev                            # 로컬 실행
npx tsx --test src/lib/fit.test.ts     # 계산 로직 테스트
npm run check:data                     # 상품 이미지 경로 · 리뷰 분석 JSON 형식 검사(데이터 PR 전 필수)
npm run build                          # 배포 전 빌드 확인
```

## 하지 말 것

- 새 라이브러리 추가 (필요하면 PR 설명에 이유를 쓴다)
- DB, 인증, 크롤러 코드 추가
- 브랜드 사이트 이미지를 직접 링크하거나 다운로드해서 쓰기
- 다른 팀원 담당 폴더를 대규모로 고치기 (필요하면 먼저 이야기한다)


@AGENTS.md
