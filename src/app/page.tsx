import { isOn } from "@/config/features";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/setpieces/Intro";
import { StorySnippet } from "@/components/home/StorySnippet";
import { Signatures } from "@/components/home/Signatures";
import { ClimbSection } from "@/components/home/ClimbSection";
import { BarTeaser } from "@/components/home/BarTeaser";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { VisitSection } from "@/components/home/VisitSection";
import { GlobeSection } from "@/components/home/GlobeSection";

/* Home is the whole climb: the table → through the arc → the mountain → the story → a menu to
   read → a menu to climb → the bar at the summit → postcards home → base camp in Harrisonburg. */
export default function HomePage() {
  return (
    <>
      {isOn("intro") && <Intro />}
      <Hero />
      <div className="relative z-10">
        <StorySnippet />
        <Signatures />
        <ClimbSection />
        <BarTeaser />
        <TestimonialsSection />
        <GlobeSection />
        <VisitSection />
      </div>
    </>
  );
}
