// src/index.js —— Webpack 入口文件（对应 webpack.config.js 的 entry）

// 在 JS 里 import CSS —— 这能成立，靠的就是 css-loader + style-loader
import './style.css';

document.querySelector('#app').innerHTML = `
  <h1>09 · Webpack 核心概念 <span class="tag">Webpack 5</span></h1>
  <p>这个页面的样式是通过 <code>import './style.css'</code> + css-loader/style-loader 注入的。</p>
  <p>本页 index.html 是由 <code>html-webpack-plugin</code> 自动生成、自动注入打包脚本的。</p>
  <ul>
    <li><b>entry</b>：从 src/index.js 出发</li>
    <li><b>output</b>：打包到 dist/[name].[contenthash].js</li>
    <li><b>loader</b>：css-loader 解析 CSS、style-loader 注入页面</li>
    <li><b>plugin</b>：html-webpack-plugin 生成 HTML</li>
    <li><b>mode</b>：dev 不压缩 / prod 压缩优化</li>
  </ul>
`;

console.log('Webpack demo 运行成功。');
