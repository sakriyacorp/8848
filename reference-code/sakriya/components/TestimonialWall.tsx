import Link from "next/link";
import WallMarquee from "./WallMarquee";
import { getTestimonials } from "@/lib/sheet";
import { TESTIMONIALS as SAMPLES } from "@/lib/testimonials";

/* Server component — pulls from the Google Sheet.
   While real testimonials are still few (<9), the wall pads itself with
   samples so it never looks empty; samples retire as real ones arrive. */

export default async function TestimonialWall() {
  const { list, live } = await getTestimonials();
  let wall = list.slice(0, 30);
  if (live && wall.length < 9) {
    wall = [...wall, ...SAMPLES.slice(0, 9 - wall.length)];
  }

  return (
    <section id="testimonials">
      <div className="container">
        <div className="eyebrow reveal">Word of Mouth</div>
        <h2 className="reveal">
          People I <em>build with</em>
        </h2>
        <p className="lede reveal">
          Contractors, employees, operators, tenants, and partners — the people
          closest to the work.
        </p>
        <WallMarquee items={wall} />
        <div className="btn-row reveal" style={{ justifyContent: "center", marginTop: 30 }}>
          <Link className="btn ghost" href="/testimonials">
            See every testimonial →
          </Link>
        </div>
      </div>
    </section>
  );
}
