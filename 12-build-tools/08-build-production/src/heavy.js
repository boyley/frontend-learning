// src/heavy.js —— 一个「较重」的模块，用来演示「按需加载 / 代码分割」
// main.js 用动态 import() 才加载它，所以它会被打成一个「独立 chunk」，
// 首屏不下载，点击按钮时才异步拉取。

export function renderReport() {
  // 假装这里有一坨复杂的报表逻辑
  const rows = Array.from({ length: 5 }, (_, i) => `<li>报表数据行 ${i + 1}</li>`).join('');
  return `<ul>${rows}</ul><p>（我是被动态 import 异步加载进来的独立 chunk）</p>`;
}
