// ============================================================
// 各种异步代码，用来演示异步测试的三种写法 + 定时器 mock
// ============================================================

/** 返回 Promise 的函数 */
function fetchScore(pass) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      pass ? resolve(90) : reject(new Error('查询失败'));
    }, 100);
  });
}

/** 回调风格的老式异步（Node 风格 error-first callback） */
function loadConfig(callback) {
  setTimeout(() => callback(null, { theme: 'dark' }), 50);
}

/** 用了定时器的函数，测试时用假定时器加速 */
function delayGreet(name, delay, cb) {
  setTimeout(() => cb(`你好, ${name}`), delay);
}

module.exports = { fetchScore, loadConfig, delayGreet };
