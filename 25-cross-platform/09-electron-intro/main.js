// main.js —— 【主进程 Main Process】
// 跑在完整的 Node.js 环境里（能用 fs/path/require），是应用的入口和"大脑"：
// 管理窗口(BrowserWindow)、应用生命周期(app)、菜单/托盘/原生对话框等系统能力。
// 每个 Electron 应用有且仅有一个主进程。
const { app, BrowserWindow } = require('electron');
const path = require('node:path');

// 创建一个应用窗口 —— 每个 BrowserWindow 会开一个独立的【渲染进程】
function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 640,
    webPreferences: {
      // 安全基线（Electron 默认值，务必保持）：
      contextIsolation: true, // 预加载脚本与页面 JS 隔离，防止污染 window
      nodeIntegration: false, // 渲染进程默认不能直接用 Node（防 XSS 提权）
      // preload：在页面加载前、渲染进程里先执行的桥接脚本（见模块 10）
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 加载界面。这里直接加载本地 HTML；真实项目常 loadURL('http://localhost:5173')（Vite 开发服务器）
  win.loadFile('index.html');

  // 打开开发者工具（渲染进程的 DevTools，和 Chrome 一样）
  // win.webContents.openDevTools();
}

// app 生命周期：Electron 初始化完成后再创建窗口
app.whenReady().then(() => {
  createWindow();

  // macOS 习惯：点 Dock 图标且无窗口时，重建一个窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 非 macOS：所有窗口关闭即退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
