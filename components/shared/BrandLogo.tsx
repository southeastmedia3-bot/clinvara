type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <div
      className={`flex items-center font-display text-2xl font-semibold tracking-wide ${className}`}
    >
      CLINVARA
    </div>
  );
}