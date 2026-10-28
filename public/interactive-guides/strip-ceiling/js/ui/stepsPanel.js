/**
 * ui/stepsPanel.js —— 左侧工序流程清单 + 层次图例
 */

import { STEPS, STEP_COUNT } from '../data/steps.js';
import { LAYERS } from '../data/parts.js';

export function createStepsPanel({ listEl, legendEl, onSelect }) {
  /* index.html ships a static copy of these operations for crawlers that do not run JavaScript. Empty the container first, or appendChild would stack the interactive list underneath it and every operation would appear twice. */
  listEl.innerHTML = '';
  const items = [];

  STEPS.forEach((step) => {
    const btn = document.createElement('button');
    btn.className = 'step-item';
    btn.type = 'button';
    btn.dataset.order = step.order;
    btn.innerHTML = `
      <span class="step-no">${step.order}</span>
      <span class="step-main">
        <span class="step-name">${step.name}</span>
        <span class="step-sub">${step.short}</span>
      </span>
      <span class="step-mark"></span>`;
    btn.addEventListener('click', () => onSelect(step.order));
    listEl.appendChild(btn);
    items.push(btn);
  });

  Object.entries(LAYERS).forEach(([key, layer]) => {
    const li = document.createElement('li');
    li.innerHTML = `<i></i><span>${layer.name}</span>`;
    li.querySelector('i').style.color = layer.color;
    li.querySelector('span').style.color = 'var(--text-dim)';
    legendEl.appendChild(li);
  });

  return {
    /** 高亮当前工序，并把它滚动到可视区域 */
    setStep(order) {
      items.forEach((btn, i) => {
        const n = i + 1;
        btn.classList.toggle('is-current', n === order);
        btn.classList.toggle('is-done', n < order);
        btn.querySelector('.step-mark').textContent = n < order ? '✓ Done' : n === order ? '▶ In progress' : 'Pending';
      });
      const current = items[order - 1];
      if (current) current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },

    total: STEP_COUNT,
  };
}
