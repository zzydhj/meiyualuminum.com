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
