import type { Metadata } from "next";
import TestimonialBrowser from "@/components/TestimonialBrowser";
import { getTestimonials } from "@/lib/sheet";

export const metadata: Metadata = {
  title: "Testimonials — Sakriya",
  description:
    "What contractors, employees, store operators, tenants, and partners say about working with Sakriya.",
};

export default async function TestimonialsPage() {
  const { list } = await getTestimonials();
  return (
    <main>
      <div className="container">
        <div className="page-head">
          <div className="eyebrow reveal">Word of Mouth</div>
          <h1 className="reveal">
            The <em style={{ color: "var(--ember-soft)" }}>whole</em> wall
          </h1>
          <p className="lede reveal" style={{ marginTop: 14 }}>
            Every voice — contractors, employees, operators, tenants, vendors,
            and partners.
          </p>
        </div>
        <TestimonialBrowser list={list} />
      </div>
    </main>
  );
}
