// preload.js —— 安全桥：把 IPC 通道包装成白名单函数暴露给页面
// 页面只能调用这里明确暴露的 api.xxx，拿不到完整的 ipcRenderer（防滥用）。
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // invoke 模式：返回 Promise，页面里 await 拿结果
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),

  // send 模式：单向发消息给主进程
  log: (msg) => ipcRenderer.send('renderer:log', msg),

  // on 模式：订阅主进程的主动推送。只暴露"注册回调"，不暴露原始事件对象
  onMainReply: (callback) =>
    ipcRenderer.on('main:reply', (_event, text) => callback(text)),
});
