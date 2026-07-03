// ========================================================================
// host 的真正业务代码：运行时远程加载 remote 暴露的 Button 模块并使用。
// ========================================================================

const container = document.getElementById('remote-button-container');

// 【核心 API】动态 import('remote/Button')
//   - 'remote'  → 对应 webpack.config.js remotes 里的 key
//   - '/Button' → 对应 remote exposes 里的 './Button'
// 这行代码在【运行时】才会：
//   1) 去 http://localhost:3001/remoteEntry.js 加载远端清单（如果还没加载过）；
//   2) 从清单里找到 './Button' 对应的分包并下载；
//   3) 返回该模块，拿到 remote 里 export default 的 createButton 函数。
// 因为是异步的，所以 remote 即使换了实现、重新部署，host 不用重新构建也能拿到最新版。
import('remote/Button')
  .then((module) => {
    // ESModule default 导出挂在 .default 上
    const createButton = module.default;
    container.appendChild(createButton('这个按钮由 Host 远程加载 Remote 得到'));
    console.log('[host] 成功从 remote 加载了 Button 模块');
  })
  .catch((err) => {
    container.textContent =
      '加载远端 Button 失败，请确认 remote(3001) 已启动。错误：' + err.message;
    console.error('[host] 远程加载失败：', err);
  });
