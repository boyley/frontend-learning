// src/main.js
// 这个文件会被 my-banner-plugin 的 transform 钩子处理：
// 打开浏览器 Network 面板看 main.js 的源码，顶部会多出一行 banner 注释。

document.querySelector('#app').innerHTML = `
  <h1>05 · Vite 插件机制</h1>
  <p>本页用了一个<strong>手写插件</strong> <code>my-banner-plugin</code>，它做了两件事：</p>
  <ol style="line-height:1.8">
    <li>给每个 .js 文件顶部加版权 banner（去 Network 面板看本文件源码顶部）</li>
    <li>往 index.html 注入构建时间（看页面底部灰色小字）</li>
  </ol>
  <p style="color:#888">启动 dev 时，终端会打印插件 configResolved 钩子的日志。</p>
`;

console.log('页面脚本执行了。请在 Network 面板查看本文件源码顶部的 banner 注释。');
