// ========================================================================
// 这是 remote 要「暴露（exposes）」出去的模块。
// 它就是一个普通的 JS 模块，返回一个 DOM 按钮。
// 关键点：它对自己被谁使用「毫不知情」——既能在 remote 自己页面用，
// 也能被 host 在运行时远程加载来用。这正是 Module Federation 的价值。
// ========================================================================

/**
 * 创建一个按钮 DOM 节点
 * @param {string} text 按钮文字
 * @returns {HTMLButtonElement}
 */
export default function createButton(text = '我来自 Remote') {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.cssText =
    'padding:8px 16px;background:#42b983;color:#fff;border:none;border-radius:4px;cursor:pointer';
  btn.addEventListener('click', () => {
    alert('点击了 Remote 暴露出来的按钮！');
  });
  return btn;
}
