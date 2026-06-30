// math.js —— 一个 ES Module 模块
// 模块内的变量默认是「私有」的，不会污染全局 window
const VERSION = '1.0.0'; // 外部访问不到，除非 export

// 命名导出（named export）：可以导出多个
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// 也可以导出常量
export const PI = 3.14159;

// 默认导出（default export）：一个模块最多一个
export default function describe() {
  return `math 模块 v${VERSION}`;
}
