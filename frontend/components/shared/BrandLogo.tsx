import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function BrandLogo({ className, imageClassName }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src="/images/brand/clinvara-logo.png"
        alt="CLINVARA"
        className={cn("h-full w-full object-contain", imageClassName)}
      />
    </span>
  );
}
