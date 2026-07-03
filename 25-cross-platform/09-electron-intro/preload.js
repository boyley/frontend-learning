// preload.js —— 【预加载脚本 Preload】
// 在渲染进程里、页面 JS 执行之前运行，是主进程能力与网页之间的"安全闸门"。
// 它能同时看到 Node API 和 window，但在 contextIsolation 下，
// 只能通过 contextBridge 把【白名单能力】暴露给页面，页面拿不到完整 Node。
const { contextBridge } = require('electron');

// 把只读信息挂到页面的 window.appInfo 上（页面无法反向拿到 require/process）
contextBridge.exposeInMainWorld('appInfo', {
  // 展示当前运行环境版本，证明预加载能访问 process（Node 能力）
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  platform: process.platform,
});
