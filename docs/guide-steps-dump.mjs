/**
 * 把一份指南包的工序与构件数据按「运行时真实值」导成 JSON，供 Python 闸门消费。
 *
 * 为什么不能像以前那样用正则数源码里的 name:：
 * 铝单板包的工序是 placePanel(n) / screwPanel(n) 生成的，源码里只有 2 个 name:
 * 字面量，运行时展开成 8 个，加上 4 个静态工序共 12 道。数源码必然数错，
 * 而且错得看起来很正常（4 道），会把后面每一条步数一致性检查全带偏。
 *
 * 用法：node docs/guide-steps-dump.mjs public/interactive-guides/<slug>
 * 输出：{ count, orders, names, partSteps }
 */
import { pathToFileURL } from 'node:url';
import { register } from 'node:module';
import { join, resolve } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('用法：node docs/guide-steps-dump.mjs <包目录>');
  process.exit(2);
}

// 先挂上 three 的解析钩子，再 import 任何碰 three 的模块（见那个文件顶部的说明）。
register(new URL('./guide-three-resolver.mjs', import.meta.url), {
  data: { vendor: resolve(join(dir, 'vendor', 'three')) },
});

const steps = await import(pathToFileURL(join(dir, 'js', 'data', 'steps.js')).href);
const parts = await import(pathToFileURL(join(dir, 'js', 'data', 'parts.js')).href).catch(() => null);
// builders.js 不吞错：导不进来就是闸门的错（解析钩子没挂好），不能当成「站点缺构造器」报出去。
const builders = await import(pathToFileURL(join(dir, 'js', 'model', 'builders.js')).href);

const STEPS = steps.STEPS || [];
console.log(
  JSON.stringify({
    count: STEPS.length,
    declaredCount: steps.STEP_COUNT ?? null,
    orders: STEPS.map((s) => s.order),
    names: STEPS.map((s) => s.name),
    // 部件登记在自己身上的工序号：越界就说明部件指向了一道不存在的工序
    partSteps: [...new Set((parts?.PARTS || []).map((p) => p.step).filter((n) => Number.isFinite(n)))].sort(
      (a, b) => a - b
    ),
    partIds: (parts?.PARTS || []).map((p) => p.id),
    // 构造器表的键也是运行时才能定（铝单板包用 spread 生成 panel-N）
    builderKeys: Object.keys(builders.BUILDERS),
  })
);
