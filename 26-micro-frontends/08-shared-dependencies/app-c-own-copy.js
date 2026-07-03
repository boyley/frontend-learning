// =====================================================================
//  子应用 C —— 【反面教材】：没走 import map 共享，直接引入了自己的副本
//  它 import 的是 './shared-standalone.js'（另一个文件 URL）。
//  即便内容和 shared.js 一模一样，浏览器也会把它当成另一个模块重新执行，
//  于是 C 有自己独立的 instanceId 和 count，和 A/B 完全隔离。
//  => 这就是“没有共享依赖”的代价：同一个库被加载了两份、状态各算各的。
// =====================================================================
import * as ownCopy from './shared-standalone.js';

export function run(log) {
  log('C', `子应用 C 用的是自己的副本，instanceId = ${ownCopy.getInstanceId()}`);
  ownCopy.increment();
  log('C', `子应用 C increment() 后 count = ${ownCopy.getCount()}（从 0 开始，看不到 A/B 的修改 => 独立副本）`);
}
