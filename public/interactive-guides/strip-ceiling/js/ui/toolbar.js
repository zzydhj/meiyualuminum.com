/**
 * ui/toolbar.js —— 底部操作台：模式 / 工序步进 / 爆炸滑块 / 视角预设 / 显示开关 / 动作
 * 只做 DOM 事件绑定与状态回填，业务判断都在 main.js。
 */

export function createToolbar({ root, handlers }) {
  const $ = (sel) => root.querySelector(sel);
  const modeBtns = [...root.querySelectorAll('[data-mode]')];
  const viewBtns = [...root.querySelectorAll('[data-view]')];
  const chipBtns = [...root.querySelectorAll('[data-toggle]')];
  const range = $('#explodeRange');
  const rangeOut = $('#explodeValue');
  const stepNow = $('#stepNow');
  const stepTotal = $('#stepTotal');

  modeBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      modeBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      handlers.onMode(btn.dataset.mode);
    })
  );

  viewBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      viewBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      handlers.onView(btn.dataset.view);
    })
  );

  chipBtns.forEach((btn) =>
    btn.addEventListener('click', () => handlers.onToggle(btn.dataset.toggle))
  );

  range.addEventListener('input', () => {
    const value = Number(range.value) / 100;
    range.style.setProperty('--fill', `${range.value}%`);
    rangeOut.textContent = `${range.value}%`;
    handlers.onExplode(value);
  });

  $('#btnPrevStep').addEventListener('click', () => handlers.onStep(-1));
  $('#btnNextStep').addEventListener('click', () => handlers.onStep(1));
  $('#btnPlay').addEventListener('click', () => handlers.onPlay());
  $('#btnAllParts').addEventListener('click', () => handlers.onAllParts());
  $('#btnRestore').addEventListener('click', () => handlers.onRestore());
  $('#btnHome').addEventListener('click', () => handlers.onHome());

  return {
    setStep(order, total) {
      stepNow.textContent = order;
      if (total) stepTotal.textContent = total;
    },

    /** 爆炸模式下把滑块拉回与状态一致（切换模式时用） */
    setExplode(value) {
      const pct = Math.round(value * 100);
      range.value = pct;
      range.style.setProperty('--fill', `${pct}%`);
      rangeOut.textContent = `${pct}%`;
    },

    setMode(mode) {
      modeBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.mode === mode));
    },

    setToggle(name, on) {
      const btn = chipBtns.find((b) => b.dataset.toggle === name);
      if (btn) btn.classList.toggle('is-active', on);
    },

    setPlaying(on) {
      const btn = $('#btnPlay');
      btn.textContent = on ? '❚❚' : '▶';
      btn.classList.toggle('is-play', !on);
    },

    setActiveView(name) {
      viewBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.view === name));
    },

    /** 供主程序实测操作台高度，写入 --toolbar-h 让面板与取景避让 */
    measureHeight() {
      return root.getBoundingClientRect().height;
    },
  };
}
