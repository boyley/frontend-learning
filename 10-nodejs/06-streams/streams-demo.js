// ============================================================
// 06 · 流 Stream —— 边读边处理，省内存、可管道
// 运行方式：node streams-demo.js
// ============================================================

// 为什么要流？读一个 2GB 的文件，readFile 会把 2GB 全塞进内存 → 可能 OOM。
// 流（Stream）把数据切成一块块（chunk）依次处理，内存占用恒定，还能「管道」串联。
//
// 四种流：
//   Readable 可读流（数据源，如读文件、HTTP 请求体）
//   Writable 可写流（数据目的地，如写文件、HTTP 响应）
//   Duplex   双工流（可读可写，如 TCP socket）
//   Transform 转换流（边读边改，如压缩 gzip）

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { pipeline } = require('node:stream/promises');
const { Transform } = require('node:stream');

const dir = path.join(__dirname, 'tmp');
fs.mkdirSync(dir, { recursive: true });
const srcFile = path.join(dir, 'big.txt');

// 先造一个稍大点的文本文件（用可写流逐行写入，演示 write/end）
function createSampleFile() {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(srcFile);
    for (let i = 1; i <= 1000; i++) {
      // write 返回 false 表示缓冲区满了（背压 backpressure 信号），真实场景应据此暂停写入
      ws.write(`第 ${i} 行：Node 流式写入示例\n`);
    }
    ws.end(); // 结束写入，触发 'finish'
    ws.on('finish', resolve);
    ws.on('error', reject);
  });
}

// 自定义 Transform 流：把每个 chunk 转成大写（这里转中文无效，仅演示英文/管道机制）
const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    // chunk 是 Buffer，转成字符串处理后再 push 出去
    const upper = chunk.toString().toUpperCase();
    callback(null, upper); // 第一个参数是 error，第二个是处理后数据
  },
});

async function main() {
  await createSampleFile();
  const stat = fs.statSync(srcFile);
  console.log('① 已生成示例文件，大小：', stat.size, '字节');

  // ② 用「可读流」逐块读取，观察分块（chunk）行为
  await new Promise((resolve) => {
    const rs = fs.createReadStream(srcFile, { highWaterMark: 16 * 1024 }); // 每块最多 16KB
    let chunkCount = 0;
    let bytes = 0;
    rs.on('data', (chunk) => {       // 'data' 事件：每来一块就回调一次
      chunkCount++;
      bytes += chunk.length;
    });
    rs.on('end', () => {             // 'end' 事件：读完了
      console.log(`② 可读流共分 ${chunkCount} 块读完，合计 ${bytes} 字节`);
      resolve();
    });
  });

  // ③ pipeline：把「读流 → 转换流 → gzip 压缩流 → 写流」串成管道
  //    pipeline 会自动处理背压、错误传播、资源关闭，是官方最推荐的串流方式。
  const gzFile = srcFile + '.gz';
  await pipeline(
    fs.createReadStream(srcFile),    // 源：读文件
    upperCaseTransform,              // 转换：转大写
    zlib.createGzip(),               // 转换：gzip 压缩
    fs.createWriteStream(gzFile)     // 目的：写成 .gz 文件
  );
  console.log('③ 管道完成：读 → 转大写 → gzip → 写盘，输出', path.basename(gzFile));

  // 清理
  fs.unlinkSync(srcFile);
  fs.unlinkSync(gzFile);
  fs.rmdirSync(dir);
  console.log('④ 已清理临时文件，演示结束。');
}

main().catch((err) => console.error('管道出错：', err.message));
