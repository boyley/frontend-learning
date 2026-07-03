// main.js —— 主进程：注册 IPC 处理器，把"网页请求"翻译成"原生系统能力"
// IPC = Inter-Process Communication 进程间通信。渲染进程没有 Node，
// 想读文件、弹原生对话框，就得通过 IPC 请主进程代劳。
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadFile('index.html');
}

// ── IPC 模式一：invoke/handle（请求-响应，推荐，天然支持异步返回值）──────────
// 渲染进程 ipcRenderer.invoke('dialog:openFile') → 这里 handle 返回结果
ipcMain.handle('dialog:openFile', async () => {
  // 弹出系统原生"打开文件"对话框（只有主进程能调）
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
  });
  if (canceled || filePaths.length === 0) return null;
  const filePath = filePaths[0];
  // 用 Node 的 fs 读文件内容（渲染进程做不到）
  const content = await fs.readFile(filePath, 'utf-8');
  return { filePath, content: content.slice(0, 2000) };
});

// invoke/handle：把渲染进程传来的数据加工后返回
ipcMain.handle('app:getInfo', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    userData: app.getPath('userData'), // 系统级用户数据目录
  };
});

// ── IPC 模式二：send/on（单向发送，无返回值，用于"通知")────────────────────
// 渲染进程 ipcRenderer.send('log') → 这里 on 收到，可再主动 push 回去
ipcMain.on('renderer:log', (event, msg) => {
  console.log('[来自渲染进程]', msg);
  // 主进程 → 渲染进程主动推送（如后台任务进度、菜单点击）
  event.sender.send('main:reply', `主进程已收到：「${msg}」@ ${new Date().toLocaleTimeString()}`);
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
