/**
 * Node 端解析钩子：把裸说明符 three / three/addons/* 指到指南包自己 vendor 的那份。
 *
 * 为什么需要：包内 js 全部写 import * as THREE from 'three'，浏览器靠 index.html 里的
 * import map 解析，Node 没有 import map，所以闸门想 import builders.js 数构件时会直接
 * 报「Cannot find package 'three'」——上一版就是把这个失败 .catch(() => null) 吞掉了，
 * 于是 builderKeys 变成空数组，三份指南一起报「部件缺构造器」，看着像站点坏了。
 *
 * 不装 node_modules/three：那会让站点的依赖长出一个只为测试存在的副本，
 * 而且版本可能和包内 vendor 的那份不一致，测出来的就不是访客跑的那套代码。
 *
 * 用法见 docs/guide-steps-dump.mjs：register(url, { data: { vendor: <包>/vendor/three } })
 */
import { pathToFileURL } from 'node:url';
import { resolve as resolvePath } from 'node:path';

let VENDOR = null;

export function initialize(data) {
  VENDOR = data && data.vendor ? resolvePath(data.vendor) : null;
}

export async function resolve(specifier, context, next) {
  if (VENDOR) {
    if (specifier === 'three') {
      return { url: pathToFileURL(VENDOR + '/three.module.js').href, shortCircuit: true };
    }
    if (specifier.startsWith('three/addons/')) {
      return {
        url: pathToFileURL(VENDOR + '/' + specifier.slice('three/addons/'.length)).href,
        shortCircuit: true,
      };
    }
  }
  return next(specifier, context);
}
