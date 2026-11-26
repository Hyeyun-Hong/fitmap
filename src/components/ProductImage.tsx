// 상품 이미지 자리. src(imageUrl)는 사용 권한이 확인된 경우에만 넘긴다.
// src가 없으면 플레이스홀더를 보여준다.
export default function ProductImage({
  label,
  src = null,
  alt = "",
  className = "",
}: {
  label: string;
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  if (src) {
    return (
      <div className={`overflow-hidden rounded-lg bg-neutral-50 ${className}`}>
        {/* 이미지 출처가 정해지기 전이라 next/image 원격 도메인 설정 없이 기본 img를 쓴다 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-lg bg-neutral-100 text-center text-xs text-neutral-400 ${className}`}>
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
        <path d="M18 6h12l3 4 9 5-4 9-4-2v20H14V22l-4 2-4-9 9-5z" />
      </svg>
      <span className="px-2">{label}</span>
    </div>
  );
}
