// ============================================================
// 一个“组件” = 渲染 UI + 封装状态 + 响应用户交互
// 这里用【原生 DOM】演示组件测试的通用范式（不绑定框架）；
// React / Vue 的组件本质一样，测试写法也一样（见 README 对照）。
// ============================================================

/**
 * 创建一个计数器组件，返回其根 DOM 节点。
 * @param {number} initialCount 初始值
 * @returns {HTMLElement} 组件根节点
 */
function createCounter(initialCount = 0) {
  let count = initialCount; // 组件内部状态

  const root = document.createElement('div');

  // <output> 天生带 ARIA role="status"，测试可用 role 或文本查询
  const display = document.createElement('output');
  display.setAttribute('aria-label', '当前计数');

  const incBtn = document.createElement('button');
  incBtn.textContent = '加一';

  const resetBtn = document.createElement('button');
  resetBtn.textContent = '重置';

  // 把状态渲染到视图（组件的“render”）
  function render() {
    display.textContent = String(count);
  }

  // 交互：点击更新状态并重渲染
  incBtn.addEventListener('click', () => {
    count += 1;
    render();
  });
  resetBtn.addEventListener('click', () => {
    count = initialCount;
    render();
  });

  render(); // 首次渲染
  root.append(display, incBtn, resetBtn);
  return root;
}

module.exports = { createCounter };
