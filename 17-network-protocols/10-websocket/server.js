/**
 * WebSocket 服务器 demo（基于 ws 库）
 * ----------------------------------------------------------------------------
 * 演示三件事：
 *   1) HTTP Upgrade 握手：ws 库内部会校验 Sec-WebSocket-Key，回 101 + Accept；
 *      我们通过 'headers' 事件把这次握手用到的关键请求/响应头打印出来，
 *      让你直观看到"从 HTTP 升级成 WebSocket"这一步到底发生了什么。
 *   2) 广播：任意一个客户端发来的消息，转发给所有在线客户端（聊天室）。
 *   3) 心跳保活：服务端定时发 ping 帧，客户端底层自动回 pong；
 *      连续没收到 pong 的连接判定为死连接并主动 terminate，防止"假在线"。
 *
 * 运行： npm install && node server.js
 * 然后用浏览器打开同目录的 client.html（可开多个标签页看广播效果）。
 */

const http = require('http');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = 3000;

// -------------------------------------------------------------------------
// 1. 起一个普通 HTTP 服务器。WebSocket 握手本质上就是一个特殊的 HTTP 请求，
//    所以 ws 库可以"挂"在现成的 http.Server 上，共用同一个端口。
// -------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  // 非 WebSocket 的普通 HTTP 请求走这里（比如你直接用浏览器访问 http://localhost:3000）
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('这是 HTTP 服务。WebSocket 端点是 ws://localhost:3000，请用 client.html 连接。\n');
});

// noServer: true 表示不让 ws 自己监听端口，而是我们手动处理 upgrade，
// 目的是能在握手前打印 HTTP 头，把"升级"过程展示出来。
const wss = new WebSocketServer({ noServer: true });

// -------------------------------------------------------------------------
// 2. 手动处理 HTTP Upgrade 事件——这是 WebSocket 握手的核心。
//    客户端发来的是一个带特殊头的 GET 请求：
//        GET /chat HTTP/1.1
//        Upgrade: websocket
//        Connection: Upgrade
//        Sec-WebSocket-Key: <随机 16 字节的 base64>
//        Sec-WebSocket-Version: 13
//    服务端要回 101 Switching Protocols，并计算 Sec-WebSocket-Accept。
// -------------------------------------------------------------------------
server.on('upgrade', (req, socket, head) => {
  const key = req.headers['sec-websocket-key'];

  console.log('\n========== 收到 WebSocket 升级握手（HTTP Upgrade） ==========');
  console.log('请求行:', req.method, req.url, 'HTTP/' + req.httpVersion);
  console.log('Upgrade           :', req.headers['upgrade']);
  console.log('Connection        :', req.headers['connection']);
  console.log('Sec-WebSocket-Key :', key);
  console.log('Sec-WebSocket-Ver :', req.headers['sec-websocket-version']);

  // RFC 6455 规定：Accept = base64( SHA1( key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" ) )
  // 这个魔法 GUID 是协议写死的常量，用来证明"服务端确实理解 WebSocket 协议"，
  // 而不是把它当成普通 HTTP 请求。ws 库内部就是这么算的，这里手算一遍给你看。
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
  console.log('计算得到的 Sec-WebSocket-Accept:', accept);
  console.log('将回应 101 Switching Protocols，之后连接不再是 HTTP，而是 ws 帧协议。');
  console.log('==============================================================\n');

  // 交给 ws 库完成后续（它会自己再算一遍 Accept 并写回 101 响应，然后触发 connection）
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

// -------------------------------------------------------------------------
// 3. 广播工具：把一条消息发给所有 OPEN 状态的客户端。
// -------------------------------------------------------------------------
function broadcast(obj) {
  const text = JSON.stringify(obj);
  wss.clients.forEach((client) => {
    // readyState === 1 (WebSocket.OPEN) 才发，避免向正在关闭的连接写数据报错
    if (client.readyState === 1) {
      client.send(text);
    }
  });
}

// -------------------------------------------------------------------------
// 4. 连接建立后的业务逻辑。
// -------------------------------------------------------------------------
let clientSeq = 0;

wss.on('connection', (ws, req) => {
  ws.id = ++clientSeq; // 给每个连接编个号，方便日志观察
  ws.isAlive = true; // 心跳存活标记

  console.log(`[连接建立] 客户端 #${ws.id} 加入，当前在线 ${wss.clients.size} 人`);

  // 收到底层 pong 帧时，把存活标记置回 true（见下面的心跳定时器）
  ws.on('pong', () => {
    ws.isAlive = true;
    console.log(`[pong] 收到客户端 #${ws.id} 的 pong，连接健康`);
  });

  // 收到应用消息：opcode 可能是 text 或 binary，这里按 text 处理并广播
  ws.on('message', (data, isBinary) => {
    const msg = isBinary ? '[二进制数据]' : data.toString();
    console.log(`[消息] 客户端 #${ws.id}: ${msg}`);
    broadcast({ type: 'chat', from: `#${ws.id}`, text: msg, time: Date.now() });
  });

  // 关闭帧（opcode 0x8）：会带上 code 和 reason
  ws.on('close', (code, reason) => {
    console.log(`[关闭] 客户端 #${ws.id} 离开，code=${code} reason=${reason || '(无)'}，剩余 ${wss.clients.size} 人`);
    broadcast({ type: 'system', text: `#${ws.id} 离开了聊天室` });
  });

  ws.on('error', (err) => console.error(`[错误] 客户端 #${ws.id}:`, err.message));

  // 欢迎消息（服务端主动下发，体现"全双工"——不用等客户端请求）
  ws.send(JSON.stringify({ type: 'system', text: `欢迎你，你是 #${ws.id}` }));
  broadcast({ type: 'system', text: `#${ws.id} 加入了聊天室` });
});

// -------------------------------------------------------------------------
// 5. 心跳定时器：每 30 秒对所有连接发一次 ping。
//    机制：发 ping 前先检查上一轮是否收到过 pong（isAlive）。
//    - 若上一轮没回 pong（isAlive 仍为 false）→ 判定死连接，terminate 强制断开。
//    - 否则把 isAlive 置 false 再 ping，等待这一轮的 pong 把它置回 true。
//    这样能识别"网线被拔/客户端崩溃"这类 TCP 层不会立刻感知的半开连接。
// -------------------------------------------------------------------------
const HEARTBEAT_INTERVAL = 30000;
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log(`[心跳] 客户端 #${ws.id} 未响应上一次 ping，判定掉线，强制断开`);
      return ws.terminate(); // 直接关闭底层 socket，不走正常关闭握手
    }
    ws.isAlive = false;
    ws.ping(); // 发送 ping 帧（opcode 0x9），符合规范的客户端会自动回 pong（0xA）
    console.log(`[心跳] 向客户端 #${ws.id} 发送 ping`);
  });
}, HEARTBEAT_INTERVAL);

// 服务器关闭时清理定时器，避免进程无法退出
wss.on('close', () => clearInterval(heartbeat));

server.listen(PORT, () => {
  console.log(`WebSocket 服务已启动：ws://localhost:${PORT}`);
  console.log('用浏览器打开 client.html 开始聊天（可开多个标签页看广播）。');
});
