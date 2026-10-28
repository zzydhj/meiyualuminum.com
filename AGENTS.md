## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Content & Company Facts

Two sources of truth — never hardcode company data in a page:

- `docs/blog-prompt-v5.md` 【附录 A】 = the only authority for company facts (founding year, plant
  size, certifications, MOQ, lead time, warranty, markets).
- `src/lib/companyProfile.ts` = the only code source for `companyFacts`, `certBadges`,
  `standardTerms`, `termsNote` (kept in sync with 附录 A).

Anything 附录 A does not state must be written as a capability sentence **without a number**.
Never borrow a number from a competitor's datasheet to fill a gap.

Content lives in Supabase (`products`, `posts`, `pages`, `videos`, `categories`). Read/write via the
PostgREST endpoint using `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY` from `.env`. Note that
`categories` uses `name` and has no `status` / `lang` column, unlike the other four tables.

Any query that lists `products` for an English page must filter `lang`. The table holds parked
translations, and `src/lib/i18n.ts` sets `MULTILINGUAL_ENABLED = false`, so there is no `/zh/` site —
an unfiltered list renders a Chinese card and inflates every count that reads it. Two category
routes had this bug before 2026-10-28; the visible symptom was `Products (2)` on a category with
one English product.

The anon key can UPDATE/DELETE `products`, `pages`, `categories` and `videos`, but **not** `posts`:
a PATCH on `posts` returns 204 and changes nothing. Generate SQL for the owner instead of assuming
a 2xx status means the write landed — always read the row back.

## SEO

Run the read-only audit before touching SEO, and after any bulk change:

```
python docs/seo-audit.py --csv docs/seo-audit.csv
```

It reports missing `seo_title` / `seo_description` / `keywords`, titles over 60 or descriptions over
160 characters (Google truncates these), duplicate `seo_title`, primary-keyword collisions between
pages (cannibalisation) and heavily overlapping keyword sets. `keywords[0]` is the page's target
term by convention. Static pages keep their SEO in the `.astro` source, so they are not covered.

`<title>` is rendered as `{pageTitle} | {titleSuffix}` by `src/layouts/BaseLayout.astro`, and the
audit reads that suffix from the source so it measures the real length — comparing the DB field
against 60 by itself let every 44–52 character title pass while 54 of 109 pages were truncated.

A category whose subtree (self + descendants) holds at most `THIN_CATEGORY_MAX` published English
products is a directory page for a single product that competes with that product for the same
target term, so it is `noindex, follow` and left out of the sitemap: the product page takes the
ranking. The threshold lives only in `src/lib/categoryPath.ts`, and the page, `sitemap.xml.ts` and
the audit all read it from there — add a second product and the category comes back to the index on
its own. Do not "fix" these collisions by rewriting category keywords.

## Images: real photos vs AI renders

Two separate R2 namespaces — never mix them, it is how the owner tells them apart:

- `products/<slug>/` — real photographs from the owner's material pack.
- `renders/<slug>/` — AI-generated imagery (cross-sections, exploded assemblies, installation-step
  diagrams, finish samples, packaging, scene renders). Everything here is a placeholder to be
  replaced; never let an AI render be described as a completed project.

Upload either kind with `python docs/r2-image-pipeline.py --plan plan.json` (set `prefix` to the
namespace; it names files by content hash and verifies each public URL returns 200).

**Before generating any product image, do a reference study.** Use the Browser sub-agent to search
the product on alibaba.com first (fall back to made-in-china.com if Alibaba presents a slider
captcha — do not attempt to bypass it). Look only: never download files, never copy an image URL
into this project, save screenshots to the OS temp folder and delete them afterwards. Extract only
construction facts from what you see — profile shape, how members join, edge detail, carrier type,
joint width, hole size and perforation rate, typical panel format. Then cross-check those facts
against the researched specification before writing the prompt. Do not reproduce a specific
photograph's composition, angle or lighting, and do not draw a competitor's proprietary profile as
if it were ours.

**Every product on this site is aluminium.** For any bare-metal image the prompt must state
explicitly: soft light mid-grey, low-gloss satin, no galvanising spangle, no stainless-steel mirror
glint, no blue-grey steel tint, no rust. AI models default metal to galvanised steel or stainless
otherwise. (Real exceptions that must stay: galvanised steel subframes behind a facade, stainless
fasteners to avoid galvanic corrosion, and warnings to isolate aluminium from carbon steel.)

AI images arrive with a "Qoder AI 生成" watermark in the bottom-right corner. Post-process before
upload: crop to `(0, 0, 920, 920)`, resize back to 1024×1024, save webp q85. Prompts must always
request no text, labels, numbers or arrows — rendered lettering comes out garbled.

## Template comments

`<!-- ... -->` inside an Astro template is emitted into the delivered HTML — view-source on any
page shows it, in Chinese, to every buyer and competitor. Roughly 100 of these existed before
2026-10-28, including notes admitting that an unsupported "SGS Tested" badge had been removed.
Maintainer notes belong in `{/* ... */}` (compile-time, never emitted) or in the frontmatter `---`
block. Never write a literal `*/}` inside such a note — it closes the comment and breaks the
template. Files under `public/` are served verbatim and have no compile-time comment form.

## Verification

- `astro build` must pass after any change.
- Product and blog pages are SSR (`prerender = false`) so database edits show on refresh.
  About is also SSR (its Factory Tour block reads `videos`), so its copy changes need a
  rebuild and redeploy — but a `pages`-table row is never used for it, because the literal
  route `about.astro` wins over the `[page]` catch-all. Same for `/contact/`, which is
  prerendered. Tools sub-pages, guides and the procurement page are prerendered.
- The dev server crashes on its own in this project. Check `astro dev status` before trusting any
  HTTP result, and use a fresh variable name when inspecting responses: a stale PowerShell variable
  from an earlier session has produced false "200" readings before.
- `DeleteFile` deletes text files but silently fails on images (`.webp` / `.jpg` / `.png`) while
  reporting success. Always re-list after deleting; to clear a whole scratch directory use
  `Remove-Item -LiteralPath <dir> -Recurse -Force` and confirm with `Test-Path`.
- Shell is PowerShell: separate statements with `;`, never `&&`.
