import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (m && !line.startsWith("#")) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const s = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY,
);

// 取出所有文章的 id / slug / 状态 / 发布时间，本地统计重复
const { data, error } = await s
  .from("posts")
  .select("id, slug, status, pub_date, title")
  .order("slug", { ascending: true });

if (error) {
  console.error("query error:", error.message);
  process.exit(1);
}

const groups = new Map();
for (const row of data) {
  if (!groups.has(row.slug)) groups.set(row.slug, []);
  groups.get(row.slug).push(row);
}

const dupes = [...groups.entries()].filter(([, rows]) => rows.length > 1);
console.log(`总文章数: ${data.length}，重复的 slug 数: ${dupes.length}\n`);
for (const [slug, rows] of dupes) {
  console.log(`slug = "${slug}"（${rows.length} 条）:`);
  for (const r of rows) {
    console.log(`  id=${r.id}  status=${r.status}  pub_date=${r.pub_date}  title="${r.title}"`);
  }
  console.log("");
}
