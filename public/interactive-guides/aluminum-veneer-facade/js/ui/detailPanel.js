/**
 * ui/detailPanel.js —— 右侧详情面板（Tab：工序说明 / 部件详情 / 系统参数）
 * 只负责渲染，不保存业务状态；数据来源 data/*。
 * 面板底部的品牌块由 data/brand.js 驱动，三个 Tab 共用一份。
 */

import { STEPS, STEP_COUNT } from '../data/steps.js';
import { PART_MAP, PARTS, LAYERS } from '../data/parts.js';
import { SYSTEM } from '../data/overview.js';
import { BRAND } from '../data/brand.js';

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function table(rows) {
  return `<table class="spec-table"><tbody>${rows
    .map((r) => `<tr><th>${esc(r.k)}</th><td>${esc(r.v)}</td></tr>`)
    .join('')}</tbody></table>`;
}

function chips(list) {
  return `<div class="chip-row">${list.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`;
}

/** 面板收口的品牌块：无论停在哪一个 Tab，出处与联系方式都在最后一屏 */
function brandBlock() {
  return `
    <div class="detail-brand">
      <p class="db-credit">${esc(BRAND.credit)}</p>
      <div class="db-actions">
        <a class="primary-btn db-cta" href="${BRAND.contactPage}" rel="noopener">${esc(BRAND.ctaLabel)}</a>
        <a class="db-link" href="${BRAND.productPage}" rel="noopener">${esc(BRAND.productLinkLabel)} ↗</a>
      </div>
      <p class="db-contact">
        <span>${esc(BRAND.legalName)}</span>
        <a href="mailto:${BRAND.email}">${esc(BRAND.email)}</a>
        <a href="tel:${BRAND.phone.replace(/\s/g, '')}">${esc(BRAND.phone)}</a>
        <span>reply within ${esc(BRAND.responseTime)}</span>
      </p>
    </div>`;
}

export function createDetailPanel({ titleEl, bodyEl, tabsEl, onJumpToStep, onFocusPart }) {
  let activeTab = 'step';
  let currentStep = 1;
  let currentPart = null;

  function renderStepTab(order) {
    const step = STEPS[order - 1];
    if (!step) return;
    titleEl.textContent = 'Step Notes';
    bodyEl.innerHTML = `
      <div class="detail-hero">
        <span class="detail-tag">Step ${order} / ${STEP_COUNT}</span>
        <h3>${esc(step.name)}</h3>
        <p class="sub">${esc(step.short)} · Duration ${esc(step.duration)}</p>
      </div>
      <div class="spec-block"><h4>Components in this step</h4>${stepScope(step)}</div>
      <div class="spec-block"><h4>Plant &amp; tools</h4>${chips(step.tools)}</div>
      <div class="spec-block"><h4>Materials</h4>${chips(step.materials)}</div>
      <div class="spec-block"><h4>Method</h4><ol class="method-list">${step.method
        .map((m) => `<li>${esc(m)}</li>`)
        .join('')}</ol></div>
      <div class="spec-block"><h4>Acceptance checks</h4><ul class="check-list">${step.check
        .map((c) => `<li>${esc(c)}</li>`)
        .join('')}</ul></div>
      <p class="note is-warn">${esc(step.note)}</p>
      <div class="detail-actions"><button class="primary-btn" data-jump="${order}">Build up to this step</button></div>`;
  }

  function stepParts(order) {
    return PARTS.filter((p) => p.step === order).map((p) => `${p.name} — ${p.keySpec}`);
  }

  /** 收口、调平、验收这三道不新增零件，用一句作用对象说明代替空的部件标签 */
  function stepScope(step) {
    const list = stepParts(step.order);
    if (list.length) return chips(list);
    return `<p class="list-empty">${esc(step.scope || 'This step adds no new components.')}</p>`;
  }

  function renderPartTab(id) {
    const spec = PART_MAP[id];
    if (!spec) {
      titleEl.textContent = 'Component Detail';
      bodyEl.innerHTML = `<p class="list-empty">Click any component in the 3D model to see its specification, material and method notes.</p>`;
      return;
    }
    const layer = LAYERS[spec.layer];
    titleEl.textContent = 'Component Detail';
    bodyEl.innerHTML = `
      <div class="detail-hero" style="border-color:${layer.color}55">
        <span class="detail-tag" style="background:${layer.color}">${esc(layer.name)}</span>
        <h3>${esc(spec.name)}</h3>
        <p class="sub">${esc(spec.keySpec)} · Step ${spec.step}</p>
      </div>
      <p class="detail-desc">${esc(spec.desc)}</p>
      <div class="spec-block"><h4>Specification</h4>${table(spec.params)}</div>
      <div class="spec-block"><h4>Composition</h4>${chips(spec.structure)}</div>
      <div class="spec-block"><h4>Installation</h4><p class="detail-desc" style="padding-bottom:0">${esc(spec.install)}</p></div>
      <div class="spec-block"><h4>Acceptance</h4><ul class="check-list"><li>${esc(spec.check)}</li></ul></div>
      <div class="detail-actions">
        <button class="ghost-btn" data-jump="${spec.step}">Go to this step</button>
        <button class="primary-btn" data-focus="${id}">Focus component</button>
      </div>`;
  }

  function renderSystemTab() {
    titleEl.textContent = 'System Data';
    bodyEl.innerHTML = `
      <div class="mini-grid">
        <div class="mini-card"><span>Components</span><b>${PARTS.length}</b></div>
        <div class="mini-card"><span>Steps</span><b>${STEP_COUNT}</b></div>
        <div class="mini-card"><span>Demo module</span><b>1200×800</b></div>
        <div class="mini-card"><span>Ceiling void</span><b>300 mm</b></div>
      </div>
      <div class="spec-block" style="margin-top:14px"><h4>${esc(SYSTEM.title)}</h4>${table(SYSTEM.params)}</div>
      <div class="spec-block"><h4>Permissible deviations</h4><ul class="check-list">${SYSTEM.tolerance
        .map((t) => `<li>${esc(t)}</li>`)
        .join('')}</ul></div>
      <div class="spec-block"><h4>Reference standards</h4>${chips(SYSTEM.standards)}</div>
      <div class="spec-block">
        <h4>${esc(BRAND.blockTitle)}</h4>
        ${table(BRAND.facts)}
        <p class="note">${esc(BRAND.termsNote)}</p>
      </div>
      <p class="note">${esc(SYSTEM.disclaimer)}</p>`;
  }

  function render() {
    if (activeTab === 'step') renderStepTab(currentStep);
    else if (activeTab === 'part') renderPartTab(currentPart);
    else renderSystemTab();
    bodyEl.insertAdjacentHTML('beforeend', brandBlock());

    bodyEl.querySelectorAll('[data-jump]').forEach((btn) =>
      btn.addEventListener('click', () => onJumpToStep(Number(btn.dataset.jump)))
    );
    bodyEl.querySelectorAll('[data-focus]').forEach((btn) =>
      btn.addEventListener('click', () => onFocusPart(btn.dataset.focus))
    );
  }

  tabsEl.querySelectorAll('.tab').forEach((tab) =>
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      tabsEl.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t === tab));
      render();
    })
  );

  return {
    get tab() {
      return activeTab;
    },

    /** 工具栏/键盘切换工序时只更新数据；停在其他 Tab 时不打断用户阅读 */
    showStep(order) {
      currentStep = order;
      if (activeTab === 'step') render();
    },

    /** 点击部件：自动切到部件详情 */
    showPart(id) {
      currentPart = id;
      activeTab = 'part';
      tabsEl.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t.dataset.tab === 'part'));
      render();
    },

    /** 手动点工序行：切回工序页 */
    focusStepTab(order) {
      currentStep = order;
      activeTab = 'step';
      tabsEl.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t.dataset.tab === 'step'));
      render();
    },

    render,
  };
}
