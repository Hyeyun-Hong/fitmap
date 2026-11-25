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
