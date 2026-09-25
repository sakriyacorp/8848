import { FAQ } from "@/lib/faq";
import { faqJsonLd } from "@/lib/jsonld";
import { restaurant } from "@/lib/menu";
import { Faq } from "@/components/Faq/Faq";

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-16 px-5 py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px] md:px-8 md:py-28"
    >
      <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <div>
          <h2 id="faq-title" className="display text-[36px] text-cream md:text-[48px]">
            Questions.
          </h2>
          <p className="mt-3 max-w-[40ch] text-[16px] text-cream-2">
            The things people ask before they visit. Anything else, call{" "}
            <a href={restaurant.phoneHref} className="text-cream underline underline-offset-4">
              {restaurant.phone}
            </a>
            .
          </p>
        </div>
        <Faq items={FAQ} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ)) }} />
    </section>
  );
}
