// =====================================================================
//  shared.js —— 被多个子应用共享的“依赖库”
//  这里模拟一个真实的第三方库（如 React / 一个状态库）：
//  它内部持有“模块级私有状态”（instanceId、count）。
//
//  关键点：ES Module 是“单例”的——同一个 URL 只会被浏览器解析、执行【一次】，
//  之后所有 import 拿到的都是【同一份模块记录】（同一份内部状态）。
//  谁改了它的内部状态，其他 import 者立刻能看到。
// =====================================================================

// 模块被“执行”的时刻生成一个随机实例 ID。
// 如果两个子应用拿到的 instanceId 相同 => 它们共享的是同一份实例；
// 如果不同 => 说明各自加载了一份副本（多实例）。
export const instanceId = 'inst-' + Math.random().toString(36).slice(2, 8);

// 模块级私有变量：相当于库内部维护的状态（比如 React 的内部 hooks 队列）
let count = 0;

// 打印一次“我被执行了”，用来证明同一个 URL 只执行一次
console.log(`[shared.js] 模块被执行，instanceId = ${instanceId}`);

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
