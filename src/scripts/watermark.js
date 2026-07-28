/**
 * watermark.js — 全站图片水印自动包裹
 *
 * 职责：给页面中的内容图片自动包一层 .img-watermark 容器，
 *       配合 global.css 的 ::after 伪元素实现 logo 平铺水印。
 *
 * 排除规则（不加水印）：
 *   - header / footer 内的图片（logo、社交图标等）
 *   - 已有 .img-watermark 包裹的图片（防重复）
 *   - 尺寸 ≤ 64px 的图片（图标 / favicon）
 *   - 带 data-no-watermark 属性的图片
 */

const LOGO_MIN_SIZE = 64;

function shouldSkip(img) {
  // 已包裹
  if (img.parentElement?.classList.contains('img-watermark')) return true;
  // 显式排除
  if (img.hasAttribute('data-no-watermark')) return true;
  // header / footer 内
  if (img.closest('header, footer, nav')) return true;
  // 太小（图标）
  if (img.width > 0 && img.width <= LOGO_MIN_SIZE) return true;
  if (img.height > 0 && img.height <= LOGO_MIN_SIZE) return true;
  return false;
}

function wrapImage(img) {
  const wrapper = document.createElement('div');
  wrapper.className = 'img-watermark';
  img.parentNode.insertBefore(wrapper, img);
  wrapper.appendChild(img);
}

function processImages(root = document) {
  root.querySelectorAll('img').forEach((img) => {
    if (shouldSkip(img)) return;
    // 图片已加载：直接判断尺寸
    if (img.complete && img.naturalWidth > 0) {
      if (img.naturalWidth <= LOGO_MIN_SIZE || img.naturalHeight <= LOGO_MIN_SIZE) return;
      wrapImage(img);
    } else {
      // 图片未加载：等 load 事件后再判断
      img.addEventListener('load', () => {
        if (shouldSkip(img)) return;
        if (img.naturalWidth <= LOGO_MIN_SIZE || img.naturalHeight <= LOGO_MIN_SIZE) return;
        wrapImage(img);
      }, { once: true });
    }
  });
}

// 首次执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => processImages());
} else {
  processImages();
}

// 监听动态插入的图片（如懒加载、SPA 切换等）
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.tagName === 'IMG') {
        if (!shouldSkip(node)) wrapImage(node);
      } else if (node.querySelectorAll) {
        processImages(node);
      }
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
