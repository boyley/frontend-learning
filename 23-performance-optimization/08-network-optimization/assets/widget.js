// assets/widget.js —— 一个本地脚本资源，用于演示 Resource Timing 里的 script 条目。
// 内容无关紧要，重点是它作为「一个网络资源」被观察到耗时。
window.__widgetLoaded = true;
console.log('[widget.js] 本地脚本资源已加载（会出现在 PerformanceObserver 的 resource 条目里）');
