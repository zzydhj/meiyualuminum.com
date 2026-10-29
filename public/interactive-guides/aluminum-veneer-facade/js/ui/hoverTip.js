/**
 * ui/hoverTip.js —— 鼠标悬停时跟随的小气泡（部件名 + 所属工序）
 */

export function createHoverTip({ el }) {
  return {
    show(text, clientX, clientY) {
      const host = el.parentElement.getBoundingClientRect();
      el.textContent = text;
      el.style.transform = `translate(${clientX - host.left + 14}px, ${clientY - host.top + 14}px)`;
      el.classList.add('is-visible');
    },

    hide() {
      el.classList.remove('is-visible');
    },
  };
}
