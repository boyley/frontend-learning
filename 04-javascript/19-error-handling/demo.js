// 19 · 错误处理 demo
// 本文件聚焦：try/catch/finally、throw、内置 Error 子类型、自定义 Error、异步错误捕获
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

const lines = [];
function log(...args) {
  const text = args.map(String).join(' ');
  lines.push(text);
  console.log(text);
  if (typeof document !== 'undefined') {
    const pre = document.getElementById('output');
    if (pre) pre.textContent = lines.join('\n');
  }
}

// ============================================================
// 一、try / catch / finally 基本结构
// ============================================================
log('===== 一、try / catch / finally =====');

try {
  log('  try: 开始执行');
  // 故意制造一个错误：调用 undefined 上的方法会抛 TypeError
  const obj = null;
  obj.foo();
  log('  这行不会执行'); // 抛错后 try 块剩余代码被跳过
} catch (err) {
  // err 是被抛出的错误对象，含 name / message / stack
  log('  catch: 捕获到', err.name, '-', err.message);
} finally {
  // finally 一定执行，常用于释放资源
  log('  finally: 一定执行（清理资源）');
}

// ============================================================
// 二、throw 主动抛错（可以抛任何值，但推荐抛 Error 实例）
// ============================================================
log('===== 二、throw 主动抛错 =====');

function divide(a, b) {
  // 用 throw 表达"参数非法"这种业务约束
  if (b === 0) {
    throw new Error('除数不能为 0');
  }
  return a / b;
}

try {
  log('  10 / 2 =', divide(10, 2));
  log('  10 / 0 =', divide(10, 0));
} catch (err) {
  log('  catch:', err.message);
}

// ============================================================
// 三、内置错误子类型：TypeError / RangeError 等
// ============================================================
log('===== 三、内置错误类型 =====');

// TypeError：对值做了它不支持的操作
try {
  const n = 123;
  n.toUpperCase(); // 数字没有 toUpperCase
} catch (err) {
  log('  TypeError 示例:', err instanceof TypeError, '-', err.message);
}

// RangeError：数值超出允许范围
try {
  const arr = new Array(-1); // 数组长度不能为负
  log(arr);
} catch (err) {
  log('  RangeError 示例:', err instanceof RangeError, '-', err.message);
}

// ============================================================
// 四、自定义 Error 子类（继承 Error，带上业务字段）
// ============================================================
log('===== 四、自定义 Error =====');

class ValidationError extends Error {
  constructor(message, field) {
    super(message); // 调用父类构造，设置 message
    this.name = 'ValidationError'; // 覆盖默认 name，便于识别
    this.field = field; // 自定义字段：出错的表单项
  }
}

function checkAge(age) {
  if (typeof age !== 'number' || age < 0) {
    throw new ValidationError('年龄必须是非负数', 'age');
  }
  return true;
}

try {
  checkAge(-5);
} catch (err) {
  // 可以用 instanceof 区分不同错误类型，分别处理
  if (err instanceof ValidationError) {
    log('  自定义错误:', err.name, '| 字段:', err.field, '|', err.message);
  } else {
    throw err; // 不认识的错误继续向上抛
  }
}

// ============================================================
// 五、异步错误捕获：同步 try/catch 抓不到异步回调里的错误
// ============================================================
log('===== 五、异步错误捕获 =====');

// 5.1 Promise：用 .catch 捕获
Promise.reject(new Error('Promise 里的错误')).catch((err) =>
  log('  Promise.catch:', err.message)
);

// 5.2 async/await：用 try/catch 捕获（推荐写法）
async function asyncTask() {
  try {
    await Promise.reject(new Error('await 里的错误'));
  } catch (err) {
    log('  async try/catch:', err.message);
  }
}
asyncTask();

// 5.3 注意：try/catch 包不住 setTimeout 回调里的错误
//     因为回调是在未来的宏任务里执行，那时 try 早已退出
try {
  setTimeout(() => {
    // 这里若 throw，外层 try 抓不到；要在回调内部自己 try/catch
    try {
      throw new Error('定时器里的错误');
    } catch (e) {
      log('  setTimeout 内部自捕获:', e.message);
    }
  }, 0);
} catch (e) {
  log('  这里抓不到定时器错误'); // 不会执行
}
