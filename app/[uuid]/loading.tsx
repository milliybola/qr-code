import Header from "@/components/Header";
import { HeroSkeleton, ProductGridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-milliy-cream pb-24">
      <Header />
      <HeroSkeleton />
      <ProductGridSkeleton />
    </div>
  );
}
