/*
  这是一个「重组件」模块，被 after.html 用动态 import('./heavy-widget.js') 按需加载。
  关键点：
    - 用 ES module 语法 export default 一个函数；
    - 只有在用户点击按钮、真正调用 import() 时，浏览器/构建工具才会下载这个 chunk；
    - 首屏根本不会加载它，从而减小「初始 bundle」体积。
  ⚠️ file:// 协议下，Chrome 会因 CORS 拦截本地 ES module 的动态 import，
     所以这部分要用本地服务器（npx serve / python3 -m http.server）打开才生效。
*/

// 顶层日志：一旦这行打印出来，就证明「chunk 此刻才被下载并求值」
console.log("[heavy-widget] 模块被下载并求值 —— 只有点击按钮触发 import() 才会发生");

// 模拟一个「体积不小」的重组件：这里用一段渐变卡片 + 一点计算代表它的成本
export default function mountHeavyWidget(container) {
  console.log("[heavy-widget] mountHeavyWidget 被调用，开始渲染重组件");

  // 象征性做一点初始化计算（真实重组件可能是图表库、编辑器、地图等）
  const start = performance.now();
  let acc = 0;
  for (let i = 0; i < 5e5; i++) acc += Math.sqrt(i);
  const cost = (performance.now() - start).toFixed(1);

  // 往页面插入内容，证明模块确实执行了
  const card = document.createElement("div");
  card.style.cssText = `
    margin-top: 16px; padding: 20px; border-radius: 12px; color: #fff;
    background: linear-gradient(135deg, #7c3aed, #2563eb);
    box-shadow: 0 6px 18px rgba(37,99,235,.35);
  `;
  card.innerHTML = `
    <h3 style="margin:0 0 8px">🎉 重组件已按需加载并挂载</h3>
    <p style="margin:0">这段内容来自独立 chunk <code>heavy-widget.js</code>，
       点击按钮触发 <code>import()</code> 才下载执行（初始化耗时约 ${cost}ms）。</p>
  `;
  container.appendChild(card);

  console.log(`[heavy-widget] 渲染完成，初始化耗时约 ${cost}ms`);
}
