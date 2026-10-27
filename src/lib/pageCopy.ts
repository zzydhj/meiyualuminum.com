/**
 * pageCopy.ts — 跨路由复用、且必须保持一字不差的页面文案
 *
 * 为什么单独建这个文件：/blog/ 和 /blog/page/N/ 是同一个栏目的第 1 页与第 N 页，
 * description 各写一份迟早会漂移。历史上就真漂过 —— 两处都残留着建站模板留下的
 * "automotive parts"（我们是铝幕墙/铝吊顶厂，跟汽车配件毫无关系），
 * 而 Google 会把它直接显示在搜索结果的摘要行上。
 *
 * 只放「同一栏目多页共用」的文案。单页独有的描述仍写在各页面里。
 */

/**
 * 博客列表（含 /blog/page/N/）的 meta description。
 * 控制在 160 字符内 —— Google 桌面端约在此处截断，超出部分买家看不到。
 */
export const BLOG_LIST_DESCRIPTION =
    "Technical notes on aluminum ceiling systems, facade panels and surface treatments, written from our own production floor in Guangdong.";
