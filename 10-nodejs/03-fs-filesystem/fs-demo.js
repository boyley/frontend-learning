// ============================================================
// 03 · 文件系统 fs —— 读写文件、目录操作
// 运行方式：node fs-demo.js
// ============================================================

// fs 有三套 API，按需选用：
//   - fs/promises ：基于 Promise，配合 async/await，最推荐 ✅
//   - fs（回调版）：传统 callback(err, data) 风格
//   - fs（同步版）：xxxSync，会阻塞事件循环，仅适合脚本/启动期
const fs = require('node:fs');                 // 同步版 & 回调版
const fsp = require('node:fs/promises');        // Promise 版（推荐）
const path = require('node:path');

// 所有文件都放在本目录下的 tmp/ 里，避免污染工程目录
const dir = path.join(__dirname, 'tmp');
const file = path.join(dir, 'demo.txt');

async function main() {
  // ① 创建目录（recursive: true 表示「多级创建 + 已存在不报错」）
  await fsp.mkdir(dir, { recursive: true });

  // ② 写文件（不存在则创建，存在则覆盖）；默认 utf-8 字符串
  await fsp.writeFile(file, '第一行：你好 Node\n', 'utf-8');

  // ③ 追加内容（appendFile 在文件末尾续写，不覆盖）
  await fsp.appendFile(file, '第二行：追加的内容\n', 'utf-8');

  // ④ 读文件（不指定编码会得到 Buffer 二进制；指定 'utf-8' 得到字符串）
  const text = await fsp.readFile(file, 'utf-8');
  console.log('--- 文件内容 ---\n' + text);

  // ⑤ 查看文件信息（大小、是否目录、修改时间等）
  const stat = await fsp.stat(file);
  console.log('文件大小：', stat.size, '字节');
  console.log('是文件吗？', stat.isFile(), '；是目录吗？', stat.isDirectory());

  // ⑥ 列出目录内容
  const list = await fsp.readdir(dir);
  console.log('tmp 目录下有：', list);

  // ⑦ 判断文件是否存在：用 access（推荐），不要再用已废弃的 fs.exists
  try {
    await fsp.access(file, fs.constants.F_OK);
    console.log('demo.txt 存在 ✅');
  } catch {
    console.log('demo.txt 不存在 ❌');
  }

  // ⑧ 重命名 / 删除
  const renamed = path.join(dir, 'demo-renamed.txt');
  await fsp.rename(file, renamed);
  console.log('已重命名为：', path.basename(renamed));
  await fsp.unlink(renamed); // 删除文件
  await fsp.rmdir(dir);       // 删除空目录（非空目录用 fsp.rm(dir,{recursive:true}) ）
  console.log('已清理临时文件与目录，演示结束。');
}

main().catch((err) => {
  // 统一兜底捕获异步错误（文件不存在、无权限等都会走这里）
  console.error('出错了：', err.message);
});

// 对比：同步写法（会阻塞，仅演示，实战慎用）
// const data = fs.readFileSync(__filename, 'utf-8');
// console.log('同步读到本文件长度：', data.length);
