// src/main.js —— 演示 Vite 的 HMR API（import.meta.hot）

import './style.css';                 // CSS 改动 → 自动样式热替换（无需手动接收）
import { setupCounter } from './counter.js';

document.querySelector('#app').innerHTML = `
  <div class="box">
    <h1>07 · HMR 热模块替换</h1>
    <p>① 改 <code>style.css</code> 的背景色保存 → 样式秒变，计数<strong>不归零</strong>。</p>
    <p>② 改 <code>counter.js</code> 的文字保存 → 模块热替换，看控制台日志。</p>
    <button id="btn"></button>
  </div>
`;
setupCounter(document.querySelector('#btn'));

// ─────────────────────────────────────────────
// import.meta.hot 是 Vite 暴露的 HMR API
// 只在「开发态」存在；生产构建时它是 undefined，所以要先判断（构建时这段会被摇掉）
// ─────────────────────────────────────────────
if (import.meta.hot) {
  // accept(deps, cb)：声明「当某个依赖更新时，我自己来处理，别整页刷新」
  // 这里监听 counter.js：它更新时，拿到新模块，重新挂载，从而保留页面其它状态
  import.meta.hot.accept('./counter.js', (newModule) => {
    console.log('🔥 [HMR] counter.js 更新了，用新模块重新挂载，无整页刷新');
    if (newModule) {
      newModule.setupCounter(document.querySelector('#btn'));
    }
  });

  // dispose：模块被替换「之前」执行，用来清理副作用（定时器、事件监听等）
  import.meta.hot.dispose(() => {
    console.log('🧹 [HMR] 旧模块即将被替换，这里做清理');
  });
}
