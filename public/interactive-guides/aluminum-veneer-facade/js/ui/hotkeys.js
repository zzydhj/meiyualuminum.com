/**
 * ui/hotkeys.js —— 键盘快捷键绑定 + 左下角脚注渲染
 * 键位说明与 HOTKEYS 数据同源，改一处即可。
 */

import { HOTKEYS } from '../data/overview.js';

const STEP_KEYS = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 };

export function createHotkeys({ app, handlers }) {
  const bar = document.createElement('div');
  bar.className = 'hotkeys';
  bar.innerHTML = HOTKEYS.map((h) => `<kbd>${h.keys.join(' / ')}</kbd> ${h.desc}`).join('&nbsp;&nbsp;·&nbsp;&nbsp;');
  app.appendChild(bar);

  function onKeyDown(e) {
    if (e.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const key = e.key;

    if (key === 'ArrowLeft') return handlers.step(-1);
    if (key === 'ArrowRight') return handlers.step(1);
    if (key === ' ') {
      e.preventDefault();
      return handlers.play();
    }
    if (STEP_KEYS[key]) return handlers.jump(STEP_KEYS[key]);

    switch (key.toLowerCase()) {
      case 'e':
        return handlers.allParts();
      case 'l':
        return handlers.toggle('labels');
      case 'g':
        return handlers.toggle('ghost');
      case 'm':
        return handlers.grid();
      case 'r':
        return handlers.reset();
      case 'f':
        return handlers.focusView();
      case 'escape':
        return handlers.deselect();
      default:
        return undefined;
    }
  }

  window.addEventListener('keydown', onKeyDown);

  return {
    dispose() {
      window.removeEventListener('keydown', onKeyDown);
      bar.remove();
    },
  };
}
