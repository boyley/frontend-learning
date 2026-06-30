// src/counter.js —— 计数逻辑，演示「状态保持」的 HMR
let count = 0;

export function setupCounter(el) {
  el.addEventListener('click', () => {
    count++;
    render(el);
  });
  render(el);
}

function render(el) {
  // 试着把下面这行的文字改一下保存，看模块如何被热替换
  el.textContent = `你点了 ${count} 次（改我试试 HMR）`;
}
