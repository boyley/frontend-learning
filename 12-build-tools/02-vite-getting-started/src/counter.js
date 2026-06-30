// src/counter.js —— 一个独立模块，演示模块拆分
export function setupCounter(element) {
  let count = 0;
  const setCount = (n) => {
    count = n;
    element.innerHTML = `点击了 ${count} 次`;
  };
  element.addEventListener('click', () => setCount(count + 1));
  setCount(0); // 初始化
}
