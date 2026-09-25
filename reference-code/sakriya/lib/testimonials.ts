/*
  ══════════════════════════════════════════════════════════════
  TESTIMONIALS — add new ones to the TOP of this list.
  Each entry: quote, name, role, and optional image.

  To add a photo: put the file in public/images/people/
  then set image: "/images/people/filename.jpg"
  No image? Just leave the image line out — initials show instead.

  ⚠ THESE ARE SAMPLE PLACEHOLDERS. Replace with real quotes from
  real people (with their permission) before sharing the site.
  Fewer real testimonials always beats many fake-sounding ones.
  ══════════════════════════════════════════════════════════════
*/

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  category?: string;
  image?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Sakriya pays more than fair, pays on time, every time, and keeps the work coming. In this trade that combination basically doesn't exist.",
    name: "Sample Contractor",
    role: "General Contractor · Virginia",
    category: "Contractors",
  },
  {
    quote:
      "He answers in minutes, not days. Decisions get made the same call. Projects with him just move.",
    name: "Sample Name",
    role: "Flooring & Tile",
    category: "Contractors",
  },
  {
    quote:
      "Best boss I've had. The schedule posts itself, the checklists are clear, and when something breaks there's an answer in seconds. You always know where you stand.",
    name: "Sample Employee",
    role: "Store Team",
    category: "Employees",
  },
  {
    quote:
      "The systems he set up in our store paid for themselves in the first month. Our numbers have not looked the same since.",
    name: "Sample Operator",
    role: "Convenience Store Owner",
    category: "Operators",
  },
  {
    quote:
      "Repairs get handled before I even follow up. Four years renting from him and I've never once had to chase.",
    name: "Sample Tenant",
    role: "Tenant · 4 years",
    category: "Tenants",
  },
  {
    quote:
      "Clear scope, clean communication, zero surprises at payment. We prioritize his jobs because working with him is easy.",
    name: "Sample Name",
    role: "Paving & Sitework",
    category: "Contractors",
  },
  {
    quote:
      "He walked our store, watched how we ran it for a day, and told us exactly what to fix. Six months later we run smoother with less staff stress.",
    name: "Sample Operator",
    role: "Store Owner · Shenandoah Valley",
    category: "Operators",
  },
  {
    quote:
      "Deliveries are checked, invoices are paid, and problems get a call the same day. As a vendor, that's all you can ask for.",
    name: "Sample Vendor",
    role: "Distributor Rep",
    category: "Vendors",
  },
  {
    quote:
      "Young, but more organized than operators twice his age. When he says a date, that's the date.",
    name: "Sample Partner",
    role: "Business Partner",
    category: "Partners",
  },
];
