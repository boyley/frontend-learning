// lazy.js —— 演示「动态导入」目标模块
// 这个模块只有在 demo.js 真正需要时，才通过 import() 异步加载

export function heavyTask() {
  return '我是被动态加载进来的模块，按需才下载执行';
}
