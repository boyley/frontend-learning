// =====================================================================
//  子应用 B —— 同样用裸模块名 'shared-lib' 引入共享依赖
//  因为 import map 把 'shared-lib' 映射到同一个 URL（./shared.js），
//  而同一 URL 的 ES Module 是单例，所以 B 拿到的就是 A 用的同一份实例。
//  => B 读到的 count 里，能看到 A 之前 +1 的结果！这就是“共享单例”。
// =====================================================================
import * as shared from 'shared-lib';

export function run(log) {
  log('B', `子应用 B 拿到的共享实例 instanceId = ${shared.getInstanceId()}`);
  // B 不重置、也没自己加，直接读 —— 却能看到 A 改过的值
  log('B', `子应用 B 读到的 count = ${shared.getCount()}（若为 2，说明看到了 A 的修改 => 同一实例）`);
  shared.increment();
  log('B', `子应用 B 再 increment() 一次后，count = ${shared.getCount()}`);
}
