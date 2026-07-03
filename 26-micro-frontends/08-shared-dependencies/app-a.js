// =====================================================================
//  子应用 A —— 通过【裸模块名 'shared-lib'】引入共享依赖
//  注意：import 的是 'shared-lib'，这个名字不是路径，而是由页面里的
//  <script type="importmap"> 把它映射到真实 URL（./shared.js）。
// =====================================================================
import * as shared from 'shared-lib';

export function run(log) {
  log('A', `子应用 A 拿到的共享实例 instanceId = ${shared.getInstanceId()}`);
  // A 把计数器 +1 两次
  shared.increment();
  shared.increment();
  log('A', `子应用 A 调用 increment() 两次后，count = ${shared.getCount()}`);
}
