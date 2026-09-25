import { Hero } from "@/components/Hero/Hero";
import { FeaturedMenu } from "@/components/Menu/FeaturedMenu";
import { KitchenGallery } from "@/components/Kitchen/KitchenGallery";
import { ReviewsSection } from "@/components/Reviews/ReviewsSection";
import { DiningRoom } from "@/components/Story/DiningRoom";
import { OrderSection } from "@/components/Story/OrderSection";
import { FamilyStory } from "@/components/Story/FamilyStory";
import { Rewards } from "@/components/Story/Rewards";
import { Visit } from "@/components/Visit/Visit";
import { FaqSection } from "@/components/Faq/FaqSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedMenu />
      <KitchenGallery />
      <ReviewsSection />
      <DiningRoom />
      <OrderSection />
      <FamilyStory />
      <Rewards />
      <Visit />
      <FaqSection />
    </>
  );
}
