// math.js —— 被导入的子模块：演示「命名导出」（named export）
// 一个模块可以有多个命名导出，导入时名字必须对应（或重命名）

// 写法一：声明的同时导出
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// 写法二：先声明，最后统一用 export { } 导出
function multiply(a, b) {
  return a * b;
}
export { multiply };
