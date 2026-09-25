import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "longform");

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
};

export type Article = ArticleMeta & { content: string };

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(DIR, f), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: (data.title as string) || slug,
        date: (data.date ? String(data.date) : "").slice(0, 10),
        category: (data.category as string) || "Notes",
        excerpt:
          (data.excerpt as string) ||
          content.replace(/[#>*_`]/g, "").trim().slice(0, 150) + "…",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticle(slug: string): Article | null {
  const file = path.join(DIR, slug + ".md");
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: (data.title as string) || slug,
    date: (data.date ? String(data.date) : "").slice(0, 10),
    category: (data.category as string) || "Notes",
    excerpt: (data.excerpt as string) || "",
    content,
  };
}

export function fmtDate(d: string): string {
  if (!d) return "";
  const dt = new Date(d + "T12:00:00Z");
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
