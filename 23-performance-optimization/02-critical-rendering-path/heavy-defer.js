/*
  这是 after.html 用 <script defer> 引入的「首屏初始化脚本」。
  对照 before.html：before 把重脚本「同步」放在 <head> 忙等 800ms，卡住解析器；
  这里用 defer，它满足两点：
    1. 并行下载，不打断 HTML 解析（解析器不再停顿）；
    2. 在 DOM 构建完成后、DOMContentLoaded 之前，按文档顺序执行。
  因此 FCP / LCP 在脚本执行前就已产生，首屏不被它拖延。

  ⚠️ 关键认知：defer 脚本在 DCL 之前执行，所以脚本本身必须「轻量」，
     否则一样会推迟 DCL。首屏初始化只做必要的事，重活留到交互后或丢给 Web Worker。
*/
(function initApp() {
  console.log("[after] defer 脚本执行：此刻 HTML 已解析完，首屏应已绘制（FCP/LCP 已记录）");

  // 轻量初始化示例：绑定一些交互、读一点配置等（这里只做象征性的极小工作）
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < 1e5; i++) sum += i; // 极小工作量，几乎不耗时，绝不忙等
  const cost = (performance.now() - start).toFixed(1);

  console.log(`[after] defer 初始化完成，用时约 ${cost}ms（远小于 before 的 800ms 阻塞），DCL 随之提前`);
})();
