// 상품 이미지 자리. 이미지 사용 권한이 확인되기 전까지는 플레이스홀더만 보여준다.
export default function ProductImage({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg bg-neutral-100 text-center text-xs text-neutral-400 ${className}`}>
      <span className="px-2">{label}</span>
    </div>
  );
}
