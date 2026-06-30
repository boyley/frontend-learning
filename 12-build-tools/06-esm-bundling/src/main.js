// src/main.js —— 入口模块，依赖 format.js 和 data.js
// 形成依赖图：main.js → format.js（只用 formatPrice）、main.js → data.js

import { formatPrice } from './format.js'; // 只导入 formatPrice，不导入 unusedHugeFunction
import { products } from './data.js';

const rows = products
  .map((p) => `<li>${p.name}：<b>${formatPrice(p.price)}</b></li>`)
  .join('');

document.querySelector('#app').innerHTML = `
  <h1>06 · ESM 与打包原理</h1>
  <ul>${rows}</ul>
  <hr/>
  <p><b>开发态（npm run dev）</b>：打开 Network 面板，你会看到 main.js / format.js / data.js
     是<strong>三个独立请求</strong> —— Vite 没打包，浏览器靠原生 ESM 按需加载。</p>
  <p><b>生产态（npm run build）</b>：看 dist/assets/ 里，三个模块被<strong>打包合并成一个 JS 文件</strong>，
     并且 format.js 里没用到的 <code>unusedHugeFunction</code> 被 Tree-shaking 删掉了。</p>
`;
