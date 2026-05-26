import { HeroCarousel } from "@/components/home/HeroCarousel";
import { BestSellers } from "@/components/home/BestSellers";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { ConcernFilter } from "@/components/home/ConcernFilter";
import { RoutineStrip } from "@/components/home/RoutineStrip";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { BlogPreview } from "@/components/home/BlogPreview";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <BestSellers />
      <CategoryFilter />
      <ConcernFilter />
      <RoutineStrip />
      <ReviewsSection />
      <BlogPreview />
    </>
  );
}
