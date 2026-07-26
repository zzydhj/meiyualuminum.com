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

const { data, error } = await s
  .from("pages")
  .select("id, slug, title, custom_css, custom_js")
  .order("id", { ascending: true });

if (error) {
  console.error("query error:", error.message);
  process.exit(1);
}

for (const row of data) {
  const hasCss = row.custom_css && row.custom_css.trim().length > 0;
  const hasJs = row.custom_js && row.custom_js.trim().length > 0;
  console.log(`id=${row.id}  slug=${JSON.stringify(row.slug)}`);
  console.log(`  custom_css: ${hasCss ? JSON.stringify(row.custom_css) : "(空)"}`);
  console.log(`  custom_js:  ${hasJs ? "有" : "(空)"}`);
}
