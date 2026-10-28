import { supabase } from "./supabase";

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  /** 分类描述（列表页展示用；部分查询不选该列，故可选） */
  description?: string | null;
  /**
   * 以下三列是分类页的 SEO 字段，仅在需要渲染 meta 的路由里 select。
   * 设为可选是因为面包屑、索引页等查询不取它们。
   * 踩过的坑：categories/[slug].astro 读了这三列但 select 漏了，
   * 导致数据库里写好的 SEO 标题与描述始终走 fallback，且不报任何错。
   */
  seo_title?: string | null;
  seo_description?: string | null;
  keywords?: string[] | null;
}

/**
 * Build the full category chain from a given category up to the root.
 * e.g., given "Brake Pads" (parent: Brake System), returns:
 *   [{ name: "Brake System", url: "/categories/brake-system/" }, { name: "Brake Pads", url: "/categories/brake-pads/" }]
 */
export async function getCategoryChain(categoryId: number | null): Promise<{ name: string; url: string; slug: string }[]> {
  if (!categoryId) return [];

  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id");

  if (!allCategories) return [];

  const categoryMap = new Map<number, CategoryNode>();
  for (const cat of allCategories) {
    categoryMap.set(cat.id, cat as CategoryNode);
  }

  const chain: { name: string; url: string; slug: string }[] = [];
  let current: CategoryNode | undefined = categoryMap.get(categoryId);

  while (current) {
    chain.unshift({ name: current.name, url: `/categories/${current.slug}/`, slug: current.slug });
    current = current.parent_id ? categoryMap.get(current.parent_id) : undefined;
  }

  return chain;
}

/**
 * Get all child category IDs (including the given category itself).
 * Useful for querying products in a category and all its subcategories.
 */
export function getChildCategoryIds(parentId: number, allCategories: CategoryNode[]): number[] {
  const ids = [parentId];
  const children = allCategories.filter((c) => c.parent_id === parentId);
  for (const child of children) {
    ids.push(...getChildCategoryIds(child.id, allCategories));
  }
  return ids;
}

/** 判定一个分类页厚薄只需要这两个字段 */
export type CategoryProductRow = {
  slug: string;
  category_ids?: (string | number)[] | null;
};

/**
 * 「薄分类」阈值：子树（含自身与所有后代）里已发布英文产品 ≤ 1 个。
 *
 * 为什么是 1：只有一个产品的分类页本质上就是那个产品页的目录页 ——
 * 一张卡片 + 一段导言，而产品页有 2–4 万字正文。两边填的又是同一个主攻词
 * （2026-10-28 审计报出 6 组，mesh 那组连 seo_title 都一字不差），
 * Google 只能在两个近似页里二选一，而选择权不在我们手上。
 *
 * 所以这类分类页退出索引（noindex, follow：仍要跟随链接，产品页靠它被发现），
 * 并从 sitemap 里排除。判定写成数据驱动而不是人工挑名单：以后往这个分类里
 * 补上第二个产品，两页不再重复，分类页就自动恢复收录 —— 不用再回来改代码。
 */
export const THIN_CATEGORY_MAX = 1;

/** 该分类子树里列出了几个产品（分类页展示的就是这个集合，故口径共用） */
export function countSubtreeProducts(
  categoryId: number,
  allCategories: CategoryNode[],
  products: CategoryProductRow[],
): number {
  const allIds = getChildCategoryIds(categoryId, allCategories);
  return products.filter((p) => {
    if (!p.category_ids?.length) return false;
    // category_ids 从 jsonb 取回可能是 string[] 或 number[]
    return p.category_ids.some((id) => allIds.includes(Number(id)));
  }).length;
}

export function isThinCategory(productCount: number): boolean {
  return productCount <= THIN_CATEGORY_MAX;
}

/**
 * 一次算出全部薄分类 id。
 * sitemap.xml.ts 与 categories/[slug].astro 必须用同一份判定：
 * 一边漏掉某个页就是不收录但还在递清单，自相矛盾。
 */
export function thinCategoryIds(
  allCategories: CategoryNode[],
  products: CategoryProductRow[],
): Set<number> {
  const thin = new Set<number>();
  for (const c of allCategories) {
    if (isThinCategory(countSubtreeProducts(c.id, allCategories, products))) {
      thin.add(c.id);
    }
  }
  return thin;
}
