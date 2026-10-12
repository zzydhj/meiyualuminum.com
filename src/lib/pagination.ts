/**
 * pagination.ts — 分页全局配置与页码规整（单一来源）
 *
 * 列表页（blog / products / videos / 标签页及其分页路由）共用这里的常量与函数，
 * 调整每页数量或分页判定规则只需改这一处。
 */

/** 列表页每页条目数（博客 / 产品 / 视频 / 标签页共用） */
export const PAGE_SIZE = 16;

/**
 * SSR 分页路由用：把 URL 里的页码规整成可渲染的页号；返回 null 表示这一页不该存在。
 *
 * 三种情况都判为不存在：
 *   · 非整数（/page/abc/、/page/2.5/，多为手改 URL 或爬虫猜路径）
 *   · 小于 2（第 1 页已有规范地址 /xxx/，在这再渲染等于制造两份相同内容）
 *   · 大于总页数（内容变少后残留的旧链接）
 *
 * 调用方拿到 null 应当 302 回第 1 页，而不是返回 404 空白页。
 */
export function resolvePage(
    raw: string | undefined,
    totalPages: number,
): number | null {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 2 || n > totalPages) return null;
    return n;
}
