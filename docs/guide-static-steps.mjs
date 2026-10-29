/**
 * 把两份 3D 指南的工序文案静态化进 index.html。
 *
 * 用法：在仓库根跑 `node docs/guide-static-steps.mjs`。可重复跑：每次从 steps.js
 * 重新生成整块替换旧的，所以改了工序文案只要重跑一次就同步。
 * 跑完再跑 `python docs/guides-audit.py` 确认没漂移。
 *
 * 为什么要静态化：public/ 下的指南页只有一层裸 HTML，8 道工序的名字、机具、
 * 材料、工艺、验收全在 js/data/steps.js 里等 JS 注入。Google 会渲染 JS（第二波，
 * 且要这个 WebGL 应用真起得来），而 Bing 偏弱、GPTBot / PerplexityBot / ClaudeBot
 * 这类基本不执行 JS —— 对它们来说这一页只有 114 个词。业主 2026-10-28 明确要求
 * 「一定要让谷歌和别的 AI 审查时抓得到」，所以正文必须出现在交付的 HTML 里。
 *
 * 为什么不会破坏演示效果：静态块就放在左侧面板那个 #stepsList 容器里，
 * stepsPanel.js 在填充前先把容器清空（新增的一行 innerHTML = ''），
 * 所以开着 JS 的人永远看不到它，看到的还是原来的交互列表。
 * 禁用 JS 的访客则直接读到全部工序——那正是没有 WebGL 时该有的样子。
 *
 * 文案不手写：直接从各包的 steps.js import 出来生成，杜绝两处文字打架。
 * 重复执行会整块重建（占位正则能匹配已生成的块，因为块内没有嵌套 div）。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const ROOT = process.cwd();
const GUIDES = join(ROOT, 'public', 'interactive-guides');
// 包列表从目录读，不写死：写死的清单会让第四份指南悄悄漏掉静态文案
const SLUGS = existsSync(GUIDES)
  ? readdirSync(GUIDES).filter((d) => statSync(join(GUIDES, d)).isDirectory()).sort()
  : [];
if (!SLUGS.length) {
  console.error('public/interactive-guides 下没找到任何指南包');
  process.exit(1);
}
const MARK = 'st-list';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CSS = `
/* Static copy of the eight operations, living in #stepsList of index.html.
   stepsPanel.js empties that container before building the interactive list,
   so this block is what a no-JS crawler or a JS-disabled visitor reads. */
.st-list-wrap {
  list-style: none;
  margin: 0;
  padding: 0;
}
.st-lead {
  margin: 0 0 12px;
  font-size: 0.76rem;
  line-height: 1.55;
  color: var(--text-dim, #93a1b0);
}
.st-item {
  padding: 12px 0;
  border-top: 1px solid var(--line, rgba(255, 255, 255, 0.08));
}
.st-item:first-child {
  border-top: 0;
  padding-top: 0;
}
.st-name {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin: 0 0 4px;
  font-size: 0.92rem;
  font-weight: 650;
  color: var(--text, #e8edf2);
}
.st-no {
  flex: none;
  font-variant-numeric: tabular-nums;
  color: var(--accent, #c0a882);
}
.st-short {
  margin: 0 0 6px;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--text-dim, #93a1b0);
}
.st-row,
.st-note {
  margin: 4px 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--text-dim, #93a1b0);
}
.st-row b {
  color: var(--text, #e8edf2);
  font-weight: 650;
}
.st-h {
  margin: 8px 0 3px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent, #c0a882);
}
.st-list,
.st-checks {
  margin: 0;
  padding-left: 18px;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--text-dim, #93a1b0);
}
.st-list li,
.st-checks li {
  margin: 2px 0;
}
`;

/**
 * 字段归一化：各包的形状不完全一致——条扣与方通的 check 是数组，
 * 铝单板包的 screwPanel() 把 check 写成了三元后的字符串。
 * 不归一就是一份新模板变体把整块静态文案打断（arr.map is not a function）。
 */
const list = (v) =>
  Array.isArray(v) ? v.filter(Boolean) : v === undefined || v === null || v === '' ? [] : [v];

function stepHtml(s) {
  const tools = list(s.tools).filter((t) => t && t !== '—').join(' · ');
  const materials = list(s.materials).filter((t) => t && t !== '—').join(' · ');
  const li = (arr) => list(arr).map((x) => `    <li>${esc(x)}</li>`).join('\n');
  const method = li(s.method);
  const check = li(s.check);
  const rows = [
    `  <p class="st-row"><b>Duration</b> ${esc(s.duration)}</p>`,
    tools ? `  <p class="st-row"><b>Tools</b> ${esc(tools)}</p>` : '',
    materials ? `  <p class="st-row"><b>Materials</b> ${esc(materials)}</p>` : '',
    `  <p class="st-h">Method</p>\n  <ol class="st-list">\n${method}\n  </ol>`,
    `  <p class="st-h">Acceptance</p>\n  <ul class="st-checks">\n${check}\n  </ul>`,
    s.note ? `  <p class="st-note">${esc(s.note)}</p>` : '',
  ].filter(Boolean);

  // 输出时缩进列 0，由调用方统一按目标文件的缩进对齐
  return [
    `<li class="st-item">`,
    `  <h3 class="st-name"><span class="st-no">${s.order}</span>${esc(s.name)}</h3>`,
    `  <p class="st-short">${esc(s.short)}</p>`,
    ...rows,
    `</li>`,
  ].join('\n');
}

for (const slug of SLUGS) {
  const dir = join(ROOT, 'public', 'interactive-guides', slug);
  const idxPath = join(dir, 'index.html');
  const cssPath = join(dir, 'css', 'panels.css');
  const panelPath = join(dir, 'js', 'ui', 'stepsPanel.js');

  const { STEPS } = await import(pathToFileURL(join(dir, 'js', 'data', 'steps.js')).href);
  const idx = readFileSync(idxPath, 'utf8');
  const again = idx.includes(MARK);

  const placeholder = /(\s*)<div class="panel-body" id="stepsList">[\s\S]*?<\/div>/;
  const m = idx.match(placeholder);
  if (!m) throw new Error(`${slug}: 找不到 #stepsList 占位`);
  // 占位前的空白包含换行：lead 给首行用（原样还回去），pad 只留缩进。
  // 两者不分开的话，每一行都会被 lead 里的换行多顶出一个空行。
  const lead = m[1];
  const pad = lead.replace(/^[\s\S]*[\r\n]/, '');
  // 插入块沿用目标文件的行尾，不把 CRLF 文件写成混行尾
  const eol = idx.includes('\r\n') ? '\r\n' : '\n';

  const block = [
    `${lead}<div class="panel-body" id="stepsList">`,
    `${pad}  <!-- Static copy of the eight operations, for crawlers that do not run JavaScript`,
    `${pad}       and for visitors with JS disabled. js/ui/stepsPanel.js empties this container`,
    `${pad}       before building the interactive list, so nothing is ever shown twice.`,
    `${pad}       Generated from js/data/steps.js - do not edit by hand. -->`,
    `${pad}  <p class="st-lead">The eight site operations, with the tools, materials, method and`,
    `${pad}    acceptance check for each. The interactive viewer beside this list plays the same`,
    `${pad}    sequence on a to-scale model.</p>`,
    `${pad}  <ol class="st-list-wrap">`,
    STEPS.map(stepHtml)
      .map((b) =>
        b
          .split('\n')
          .map((l) => `${pad}    ${l}`)
          .join('\n')
      )
      .join('\n'),
    `${pad}  </ol>`,
    `${pad}</div>`,
  ].join('\n');

  // 先把整块归成 LF 再转目标行尾：pad 是从 CRLF 文件里抓的，自带 \r，
  // 不先剥掉就会被我自己的 \n→\r\n 替换顶成 \r\r\n（每行之间多一个空行）。
  const body = block.replace(/\r/g, '').replace(/\n/g, eol);
  writeFileSync(idxPath, idx.replace(placeholder, () => body), 'utf8');
  console.log(`${slug}: index.html ${again ? '已重建' : '已注入'} ${STEPS.length} 道工序静态文案`);

  let css = readFileSync(cssPath, 'utf8');
  if (!css.includes('/* static-steps */')) {
    const eol = css.includes('\r\n') ? '\r\n' : '\n';
    css = `/* static-steps */\n${CSS}\n`.replace(/\n/g, eol) + css;
    writeFileSync(cssPath, css, 'utf8');
    console.log(`${slug}: panels.css 已加 .st-* 规则`);
  }

  let panel = readFileSync(panelPath, 'utf8');
  if (!panel.includes("listEl.innerHTML = '';")) {
    // 包内 .js 是 CRLF，所以这里用 \r?\n 容错，插入时沿用原文件行尾
    const eol = panel.includes('\r\n') ? '\r\n' : '\n';
    const inject =
      '  /* index.html ships a static copy of these operations for crawlers that do not run ' +
      'JavaScript. Empty the container first, or appendChild would stack the interactive ' +
      'list underneath it and every operation would appear twice. */\n' +
      "  listEl.innerHTML = '';\n";
    panel = panel.replace(
      /(export function createStepsPanel\(\{ listEl, legendEl, onSelect \}\) \{\r?\n)(\s*const items = \[\];)/,
      `$1${inject.replace(/\n/g, eol)}$2`
    );
    if (!panel.includes("listEl.innerHTML = '';")) {
      throw new Error(`${slug}: stepsPanel.js 锚点没匹配上，请手工加 listEl.innerHTML = ''`);
    }
    writeFileSync(panelPath, panel, 'utf8');
    console.log(`${slug}: stepsPanel.js 已加清空一行`);
  }
}
