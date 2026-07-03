// =====================================================================
//  shared-standalone.js —— 和 shared.js 内容【完全相同】的另一个文件
//
//  它代表“某个子应用没有做依赖共享，自己打包 / 自己 import 了一份副本”。
//  因为文件 URL 不同（./shared.js  vs  ./shared-standalone.js），
//  浏览器会把它当成【另一个模块】重新执行一次 =>
//  它有自己独立的 instanceId 和独立的 count，与 shared.js 互不相通。
//
//  这就是“没共享依赖”会发生的事：同样的库被加载了两份，各算各的。
// =====================================================================

export const instanceId = 'inst-' + Math.random().toString(36).slice(2, 8);

let count = 0;

console.log(`[shared-standalone.js] 副本模块被执行，instanceId = ${instanceId}`);

export function increment() {
  count += 1;
  return count;
}

export function getCount() {
  return count;
}

export function getInstanceId() {
  return instanceId;
}
