// ============================================================
// ESM 模块（.mjs 后缀强制按 ECMAScript Module 解析）
// 导出方式：export / export default
// ============================================================

// 命名导出（named export）：可以有多个
export function add(a, b) {
  return a + b;
}

export function sub(a, b) {
  return a - b;
}

// 也可以先声明再统一导出
const PI = 3.14159;
export { PI };

// 默认导出（default export）：一个模块只能有一个
export default function multiply(a, b) {
  return a * b;
}
