'use strict';
/**
 * IntersectionObserver 交叉观察器演示
 *  - Demo 1：图片懒加载（进入视口才「加载」真图，然后 unobserve）
 *  - Demo 2：曝光统计（露出一半即计数高亮）
 *
 * 相比传统的「监听 scroll + getBoundingClientRect」：
 *  - 回调由浏览器异步批量触发，不在滚动主线程同步计算，性能更好、不阻塞滚动
 *  - 无需手写节流，浏览器内部已优化
 */

// 一组用于模拟「真图」的渐变色，避免依赖网络
const COLORS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f7971e,#ffd200)',
  'linear-gradient(135deg,#11998e,#38ef7d)',
  'linear-gradient(135deg,#fc466b,#3f5efb)',
  'linear-gradient(135deg,#43cea2,#185a9d)',
  'linear-gradient(135deg,#ff5f6d,#ffc371)',
  'linear-gradient(135deg,#1d976c,#93f9b9)',
  'linear-gradient(135deg,#8e2de2,#4a00e0)'
];

/* =========================================================
 * Demo 1：图片懒加载
 * =======================================================*/
(function lazyLoad() {
  const scroller = document.getElementById('lazyScroller');

  // 动态生成若干「图片」占位块，真图颜色放在 data-src
  for (let i = 0; i < COLORS.length; i++) {
    const box = document.createElement('div');
    box.className = 'lazy';
    box.dataset.src = COLORS[i];          // 「真图」资源，初始不加载
    box.dataset.index = i + 1;
    scroller.appendChild(box);
  }

  // 创建观察器
  // options.root：作为视口的容器（默认 null = 浏览器视口）。这里指定滚动容器。
  // options.rootMargin：把 root 的判定边界外扩，"100px" 表示提前 100px 触发（预加载）
  // options.threshold：交叉比例阈值，0 表示只要露出 1px 就触发
  const io = new IntersectionObserver((entries, observer) => {
    // 回调一次可能收到多个 entry（批量）
    entries.forEach(entry => {
      if (entry.isIntersecting) {                 // 进入视口
        const el = entry.target;
        el.style.background = el.dataset.src;     // 「加载真图」
        el.textContent = '✅ 图片 ' + el.dataset.index + ' 已加载';
        el.classList.add('loaded');
        observer.unobserve(el);                   // 加载完即停止观察，避免重复触发、释放资源
      }
    });
  }, {
    root: scroller,
    rootMargin: '60px',   // 提前 60px 开始加载，让用户滚到时图已就绪
    threshold: 0.01
  });

  // 开始观察每个懒加载块
  scroller.querySelectorAll('.lazy').forEach(el => io.observe(el));
})();


/* =========================================================
 * Demo 2：曝光统计
 * =======================================================*/
(function impression() {
  const scroller = document.getElementById('expoScroller');
  const countEl = document.getElementById('expoCount');
  let count = 0;

  for (let i = 0; i < 8; i++) {
    const box = document.createElement('div');
    box.className = 'expo';
    box.textContent = '广告卡片 ' + (i + 1) + '（露出一半即曝光）';
    scroller.appendChild(box);
  }

  // threshold: 0.5 → 当元素 50% 进入视口时回调触发，isIntersecting 为 true
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // intersectionRatio 是当前交叉比例（0~1）；isIntersecting 表示是否达到阈值
      if (entry.isIntersecting) {
        const el = entry.target;
        if (!el.classList.contains('seen')) {
          el.classList.add('seen');
          el.textContent = '👁️ 已曝光（比例 ' + entry.intersectionRatio.toFixed(2) + '）';
          count++;
          countEl.textContent = count;
          observer.unobserve(el); // 曝光只统计一次，处理完即取消观察
        }
      }
    });
  }, {
    root: scroller,
    threshold: 0.5
  });

  scroller.querySelectorAll('.expo').forEach(el => io.observe(el));
})();
