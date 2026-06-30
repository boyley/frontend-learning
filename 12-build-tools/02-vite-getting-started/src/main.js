// src/main.js —— 应用入口（被 index.html 引用）
// Vite 允许你直接 import CSS、图片等非 JS 资源，它们会被当作模块处理。

import './style.css';        // 直接 import 一个 CSS 文件，Vite 会把它注入页面
import { setupCounter } from './counter.js';
import viteLogo from '/vite.svg'; // import 静态资源，得到最终可访问的 URL

// 用 JS 动态渲染页面内容
document.querySelector('#app').innerHTML = `
  <div class="card">
    <img src="${viteLogo}" class="logo" alt="Vite logo" width="80" />
    <h1>Hello Vite! 🎉</h1>
    <p>这是你的第一个 Vite 项目。试着修改这行文字，保存后页面会<strong>秒级热更新</strong>。</p>
    <button id="counter" type="button"></button>
    <p class="tip">打开浏览器开发者工具的 Network 面板，看看每个模块都是独立请求 —— 这就是「免打包」开发服务器。</p>
  </div>
`;

// 给按钮挂上计数逻辑
setupCounter(document.querySelector('#counter'));
