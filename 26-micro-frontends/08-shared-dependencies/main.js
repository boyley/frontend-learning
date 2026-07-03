// =====================================================================
//  main.js —— 基座/主入口：按顺序“挂载”三个子应用，把结果打到页面
//  这个文件本身也是 ES Module，用来编排演示。
// =====================================================================
import { run as runA } from './app-a.js';
import { run as runB } from './app-b.js';
import { run as runC } from './app-c-own-copy.js';
// 主入口自己也引用共享库，验证“主应用与子应用共享同一实例”
import * as shared from 'shared-lib';

// ---- 往页面日志区追加一行 ----
const logEl = document.getElementById('log');
function log(who, msg) {
  const line = document.createElement('div');
  line.className = 'line who-' + who;
  line.innerHTML = `<span class="who">[${who}]</span> ${msg}`;
  logEl.appendChild(line);
}

log('main', `主入口拿到的共享实例 instanceId = ${shared.getInstanceId()}`);
log('main', '—— 开始按顺序挂载子应用 ——');

// 依次运行三个子应用
runA(log);   // A: instanceId 记下来，count -> 2
runB(log);   // B: 同一 instanceId，count 读到 2（看到 A 的修改），再 +1 -> 3
runC(log);   // C: 不同 instanceId（自己的副本），count 独立从 0 -> 1

// ---- 结论比对 ----
log('main', '—— 结论 ——');
log('main', `A/B/main 三者 instanceId 相同 = ${shared.getInstanceId()}，共享 count 最终 = ${shared.getCount()}`);
log('main', 'C 的 instanceId 与上面不同、count 独立，证明它加载了一份多余的副本。');
