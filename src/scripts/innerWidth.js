/**
 * innerWidth.js — 把「不含竖向滚动条的可视宽度」交给 CSS
 *
 * 全站所有全幅出血（PageHero / FactoryTourRail / 首页色带 / About 深色带 / 灵感页导轨）
 * 都从 global.css 的 --inner-w 取宽度，这里只负责把它写成 documentElement.clientWidth。
 *
 * 为什么非要 JS：100vw 含竖向滚动条，而 .container 的居中按不含滚动条的 clientWidth 算，
 * 所以老写法 calc(50% - 50vw) 会比可视区宽一条滚动条（左右各溢出半个）。溢出被
 * body{overflow-x:clip} 裁掉看不见，但 html 的 scrollWidth 实测比 clientWidth 大 8px，
 * 任何读 scrollWidth 的判断都会被它误导。纯 CSS 没有「可视区宽度」这个量：
 * container-type 倒是能给出，但要给 html 加 containment，position:fixed 的悬浮球会改挂
 * 在它上面，代价远大于一条 resize 监听。
 *
 * 三个时机都要盯：
 * 1. 解析完成时（模块脚本天然 defer，此时 DOM 齐了，竖向滚动条在不在已经定死）；
 * 2. 窗口改尺寸时；
 * 3. 窗口没动、但滚动条自己出现/消失了 —— 图片延迟加载把文档推过一屏就属于这种，
 *    所以再加一个 ResizeObserver 盯 documentElement 的宽度变化。
 *
 * global.css 里 --inner-w 的默认值是 100vw，所以这段脚本没跑时行为和改动前一致：
 * 色带照样铺满，不会两侧露白。
 */

const doc = document.documentElement;

const sync = () => {
  doc.style.setProperty("--inner-w", `${doc.clientWidth}px`);
};

sync();
addEventListener("resize", sync);

if (typeof ResizeObserver === "function") {
  // --inner-w 只改子元素宽度，不改 documentElement 自身（它是 100% 视口宽），
  // 所以这里不会自激循环；真出现滚动条状态变化时，第二圈写入的值已经稳定。
  new ResizeObserver(sync).observe(doc);
}
