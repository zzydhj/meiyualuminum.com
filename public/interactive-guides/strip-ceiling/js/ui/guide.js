/**
 * ui/guide.js —— 首次进入的操作引导（4 张卡片，可跳过 / 重新打开）
 */

import { GUIDE } from '../data/overview.js';

export function createGuide({ el, titleEl, descEl, dotsEl, nextBtn, skipBtn, reopenBtn }) {
  let index = 0;

  GUIDE.forEach(() => {
    const li = document.createElement('li');
    dotsEl.appendChild(li);
  });
  const dots = [...dotsEl.children];

  function paint() {
    const item = GUIDE[index];
    titleEl.textContent = item.title;
    descEl.textContent = item.desc;
    dots.forEach((d, i) => d.classList.toggle('is-done', i <= index));
    nextBtn.textContent = index === GUIDE.length - 1 ? 'Get started' : 'Next';
  }

  function open() {
    index = 0;
    paint();
    el.hidden = false;
  }

  function close() {
    el.hidden = true;
  }

  nextBtn.addEventListener('click', () => {
    if (index >= GUIDE.length - 1) return close();
    index += 1;
    paint();
  });
  skipBtn.addEventListener('click', close);
  if (reopenBtn) reopenBtn.addEventListener('click', open);

  return { open, close };
}
