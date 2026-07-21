import { supabase } from "./supabase";

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

/**
 * Build the full category chain from a given category up to the root.
 * e.g., given "Brake Pads" (parent: Brake System), returns:
 *   [{ name: "Brake System", url: "/categories/brake-system/" }, { name: "Brake Pads", url: "/categories/brake-pads/" }]
 */
export async function getCategoryChain(categoryId: number | null): Promise<{ name: string; url: string }[]> {
  if (!categoryId) return [];

  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id");

  if (!allCategories) return [];

  const categoryMap = new Map<number, CategoryNode>();
  for (const cat of allCategories) {
    categoryMap.set(cat.id, cat as CategoryNode);
  }

  const chain: { name: string; url: string }[] = [];
  let current: CategoryNode | undefined = categoryMap.get(categoryId);

  while (current) {
    chain.unshift({ name: current.name, url: `/categories/${current.slug}/` });
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
