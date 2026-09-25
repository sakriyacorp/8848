import { TESTIMONIALS_SHEET_CSV_URL } from "./config";
import { TESTIMONIALS as FALLBACK, type Testimonial } from "./testimonials";

/* Robust CSV parser (handles quoted fields, commas, newlines inside quotes) */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (c !== "\r") cur += c;
    }
  }
  row.push(cur);
  if (row.length > 1 || (row[0] && row[0].trim() !== "")) rows.push(row);
  return rows;
}

const isTrue = (v: string) => /^(true|yes|1|checked|x|✓)$/i.test((v || "").trim());
const isNA = (v: string) => /^(n\/?a|none|-|\.)$/i.test((v || "").trim());

/* Google Forms file uploads land as Drive links — rewrite them to a
   directly-renderable thumbnail URL. Anything else passes through. */
function normalizeImage(u: string): string | undefined {
  const v = (u || "").trim();
  if (!v) return undefined;
  if (v.includes("drive.google.com") || v.includes("docs.google.com")) {
    const m = v.match(/[-\w]{25,}/);
    if (m) return `https://drive.google.com/thumbnail?id=${m[0]}&sz=w400`;
    return undefined;
  }
  return v;
}

export async function getTestimonials(): Promise<{ list: Testimonial[]; live: boolean }> {
  const url = TESTIMONIALS_SHEET_CSV_URL.trim();
  if (!url) return { list: FALLBACK, live: false };
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(String(res.status));
    const rows = parseCSV(await res.text());
    if (rows.length < 2) return { list: FALLBACK, live: false };

    const head = rows[0].map((h) => h.toLowerCase().trim());
    const col = (kw: string) => head.findIndex((h) => h.includes(kw));
    const qi = col("quote") >= 0 ? col("quote") : col("testimonial");
    const fi = col("first");
    const li = col("last");
    const nameOnly = head.findIndex(
      (h) => h.includes("name") && !h.includes("first") && !h.includes("last") && !h.includes("company")
    );
    const ri = col("role");
    const coI = col("company");
    const ci = col("category");
    const ii = col("image") >= 0 ? col("image") : col("photo");
    const ai = col("approved");
    if (qi < 0 || (fi < 0 && nameOnly < 0)) return { list: FALLBACK, live: false };

    const list: Testimonial[] = [];
    for (let r = 1; r < rows.length; r++) {
      const g = (i: number) => (i >= 0 && rows[r][i] ? rows[r][i].trim() : "");
      const quote = g(qi);
      const name = fi >= 0 ? `${g(fi)} ${g(li)}`.trim() : g(nameOnly);
      if (!quote || !name) continue;
      if (ai >= 0 && !isTrue(g(ai))) continue; /* moderation gate */
      const company = g(coI);
      const roleBase = g(ri);
      let role = roleBase;
      if (company && !isNA(company)) role = roleBase ? `${roleBase} · ${company}` : company;
      if (!role) role = "Worked with Sakriya";
      list.push({
        quote,
        name,
        role,
        category: g(ci) || undefined,
        image: normalizeImage(g(ii)),
      });
    }
    if (!list.length) return { list: FALLBACK, live: false };
    return { list: list.reverse(), live: true }; /* newest submissions first */
  } catch {
    return { list: FALLBACK, live: false };
  }
}
