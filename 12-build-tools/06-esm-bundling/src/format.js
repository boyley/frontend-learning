// src/format.js —— 模块 A：故意导出两个函数，但 demo 只用其中一个，
// 用来演示「Tree-shaking 摇树」：没被用到的 unusedHugeFunction 在生产构建里会被删掉。

export function formatPrice(n) {
  return '¥' + n.toFixed(2);
}

// 这个函数没有任何地方 import 它 → 生产构建会被 Tree-shaking 摇掉，不进产物
export function unusedHugeFunction() {
  // 假装这是一大坨没用到的代码
  return 'I am dead code, tree-shaking should remove me in production build.';
}
