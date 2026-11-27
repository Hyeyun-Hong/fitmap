# FIT MAP (회의용 뼈대)

내가 만족했던 옷의 실측을 기준으로 다른 브랜드 옷의 핏을 비교하는 웹서비스 MVP.

## 내 컴퓨터에서 실행
Node.js 20 이상이 필요해요.

```bash
npm install
npm run dev
```
브라우저에서 http://localhost:3000 을 열면 됩니다. 휴대폰 크기로 보려면 개발자도구(F12)에서 모바일 보기를 켜 주세요.

## 들어 있는 화면
- 홈: 기준 옷이 없으면 등록 안내, 있으면 비슷한 상품 TOP 3
- 기준 옷 등록 (/register): 직접 입력 또는 FIT MAP 상품에서 불러오기
- 브랜드 (/brands) → 브랜드별 상품 → 상품 상세(핏 분석, 실측표)
- 핏 비교 결과 (/compare/상품ID): 사이즈별로 눌러가며 비교
- 내 옷장 (/closet): 기준 옷 관리, 대표 지정, 삭제
- 비교함 (/basket): 자리만 있음

## 데이터
- data/products.json: 22개 상품 (P021~P040은 진이 공식 페이지에서 확인한 실측, P001·P002는 팀원 샘플)
- data/brands.json: 13개 브랜드
- data/review-summaries.sample.json: 리뷰 분석 결과 (아직 비어 있음)
- 기준 옷은 서버가 아니라 각자 브라우저에 저장돼요. 로그인·DB 없음.
- 상품 이미지는 사용 권한 확인 전이라 회색 자리만 표시해요.

## AI 종합 의견
.env.local 파일에 `ANTHROPIC_API_KEY=...`를 넣으면 AI 문장이 나오고, 없으면 계산 결과로 만든 기본 문장이 나와요. 키는 절대 깃허브에 올리지 마세요.

## 확인 명령
```bash
npm test        # 실측 비교 계산 테스트
npm run build   # 배포 전 빌드 확인
```

## Vercel 배포
1. 이 폴더를 GitHub 새 저장소에 올린다.
2. vercel.com → Add New → Project → 그 저장소 Import → Deploy.
3. AI 의견까지 쓰려면 Vercel 프로젝트 Settings → Environment Variables에 ANTHROPIC_API_KEY 추가 후 Redeploy.

자세한 작업 규칙은 CLAUDE.md 참고.

## 이미지 · 리뷰 데이터 넣는 법

### 상품 이미지
1. 사용 권한을 확인한 이미지를 `public/images/products/`에 상품 ID 이름으로 넣어요. 예: `P021.jpg`
2. `data/products.json`에서 그 상품의 `"imageUrl": null`을 `"imageUrl": "/images/products/P021.jpg"`로 바꿔요.
3. 같은 상품의 `source.note`에 권한 근거를 한 줄 적어요.

이미지가 있으면 상품 카드, 홈 슬라이드, 상품 상세에 자동으로 나오고, 없으면 회색 자리로 남아요.

### 리뷰 분석
1. 상품 리뷰를 모아요(어디서 언제 모았는지 메모).
2. Claude 채팅에 `src/lib/prompts.ts`의 `REVIEW_ANALYSIS_PROMPT` 내용을 붙여 넣고, `[브랜드] [상품명]`을 채운 뒤 맨 아래에 리뷰 원문을 붙여요.
3. 받은 JSON에서 `productId`를 상품 ID(예: `P024`)로 채우고, `source.description`에 출처, `collectedAt`에 수집일을 적어요.
4. `data/review-summaries.json`의 `[ ]` 안에 붙여 넣어요. 여러 상품이면 쉼표로 이어요.
5. `npm run check:data`로 확인해요. `✗` 표시가 나오면 그 칸을 고치면 돼요.

리뷰 분석이 있는 상품은 상품 상세와 비교 결과의 "AI 비교 분석"에 자동으로 나오고, 없는 상품은 그 영역이 숨겨져요.
