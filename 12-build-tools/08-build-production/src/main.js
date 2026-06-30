// src/main.js —— 演示代码分割（动态 import）

document.querySelector('#app').innerHTML = `
  <h1>08 · 生产构建与产物分析</h1>
  <p>点下面的按钮，才会<strong>异步加载</strong> heavy.js（代码分割 / 懒加载）。</p>
  <button id="load">点击异步加载报表模块</button>
  <div id="report"></div>
`;

document.querySelector('#load').addEventListener('click', async () => {
  // ⭐ 动态 import()：返回 Promise，运行到这里才去下载 heavy.js
  // 构建时 Rollup 会把 heavy.js 单独打成一个 chunk，实现「按需加载」
  const { renderReport } = await import('./heavy.js');
  document.querySelector('#report').innerHTML = renderReport();
  console.log('heavy.js 已按需加载，去 Network 面板看它是点击后才请求的独立 chunk');
});
