// 14 · ES Module（ESM）demo —— 入口模块
// 本文件聚焦：命名导入、默认导入、import * as 整体导入、动态 import()
// 运行方式（二选一，不能直接双击 file://，详见 README）：
//   1) node demo.js     （本目录有 package.json 的 "type":"module"）
//   2) 本地服务器 + 浏览器，index.html 用 <script type="module">

// ---- 顶层 import 必须写在模块最前面，且是静态的（路径不能用变量） ----
import { add, subtract, PI } from './math.js'; // 命名导入：花括号 + 对应名字
import { multiply } from './math.js'; // 同一模块可分多次导入
import createLogger, { version } from './logger.js'; // 默认导入(任意名) + 命名导入混用
import * as math from './math.js'; // 整体导入：所有命名导出挂到 math 命名空间

// 收集输出，浏览器里写进页面
const lines = [];
function log(...args) {
  const text = args
    .map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
    .join(' ');
  lines.push(text);
  console.log(text);
}

// ============================================================
// 一、命名导入（named import）
// ============================================================
log('===== 一、命名导入 =====');
log('add(2, 3) =', add(2, 3));
log('subtract(5, 2) =', subtract(5, 2));
log('multiply(4, 6) =', multiply(4, 6));
log('PI =', PI);

// ============================================================
// 二、默认导入（default import）：名字可自取
// ============================================================
log('\n===== 二、默认导入 =====');
const logger = createLogger('APP'); // createLogger 是 logger.js 的默认导出
log(logger('启动成功'));
log('logger 模块 version =', version);

// ============================================================
// 三、整体导入 import * as：命名空间对象
// ============================================================
log('\n===== 三、import * as 整体导入 =====');
log('math.add(1, 1) =', math.add(1, 1));
log('math.PI =', math.PI);
log('命名空间里有哪些导出:', Object.keys(math).join(', '));

// ============================================================
// 四、动态 import()：返回 Promise，运行时按需加载
// ============================================================
log('\n===== 四、动态 import() =====');
// import() 是函数式写法，可放在条件里、可用变量路径，返回 Promise
import('./lazy.js')
  .then((mod) => {
    log('动态加载完成 ->', mod.heavyTask());
    // 浏览器环境：异步结果回来后再刷新页面
    flushToPage();
  })
  .catch((err) => log('动态加载失败:', err.message));

log('（注意：上面这行先打印，动态模块的结果稍后才出现，因为它是异步的）');

// ============================================================
// 输出到页面（仅浏览器）；动态结果回来后会再刷新一次
// ============================================================
function flushToPage() {
  if (typeof document !== 'undefined') {
    const pre = document.getElementById('output');
    if (pre) pre.textContent = lines.join('\n');
  }
}
flushToPage();
