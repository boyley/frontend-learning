// 09 · HTTP 缓存 demo —— 纯 Node 内置 http 模块，无需安装任何依赖
// 目的：用最小代码演示「强缓存」与「协商缓存」两条路径，
//       让你在浏览器 DevTools / curl 里亲眼看到 200(from cache) 与 304。
//
// 运行： node cache-server.js  然后浏览器打开 http://localhost:3000
// 关键观察：反复刷新页面，看不同资源命中的缓存策略与状态码。

const http = require('http');
const crypto = require('crypto');

const PORT = 3000;

// 一段"会变"的资源内容：这里用固定内容，改动它并重启可模拟资源更新
const ASSET_CONTENT = 'console.log("我是一段被缓存的 JS，版本 v1");\n';
// 用内容算出 ETag（实体标签）——内容不变 ETag 就不变，这是协商缓存的依据
const ASSET_ETAG = '"' + crypto.createHash('md5').update(ASSET_CONTENT).digest('hex') + '"';
// 资源最后修改时间（协商缓存的另一依据，精度到秒）
const ASSET_LAST_MODIFIED = new Date('2026-01-01T00:00:00Z').toUTCString();

const server = http.createServer((req, res) => {
  console.log(`\n[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  // ---------- 首页：一个引用了各类缓存资源的 HTML ----------
  if (req.url === '/' || req.url === '/index.html') {
    // HTML 本身通常不做强缓存（要保证用户拿到最新页面），用 no-cache 走协商
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache', // 注意：no-cache ≠ 不缓存，而是"每次都要协商"
    });
    res.end(`<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><title>HTTP 缓存 demo</title></head>
<body style="font-family:sans-serif;max-width:640px;margin:40px auto">
  <h1>HTTP 缓存 demo</h1>
  <p>打开 DevTools → Network，勾选 <b>Disable cache</b> 关掉再反复刷新，对比这几个资源：</p>
  <ul>
    <li><a href="/strong.js" target="_blank">/strong.js</a> —— 强缓存(max-age=60)，60 秒内不再发请求</li>
    <li><a href="/etag.js" target="_blank">/etag.js</a> —— 协商缓存(ETag)，命中回 304</li>
    <li><a href="/lastmod.js" target="_blank">/lastmod.js</a> —— 协商缓存(Last-Modified)，命中回 304</li>
    <li><a href="/immutable.js" target="_blank">/immutable.js</a> —— 强缓存 immutable，一年内绝不回源</li>
  </ul>
  <p>观察运行本服务的终端日志：命中协商缓存时会打印「304 未修改」。</p>
</body></html>`);
    return;
  }

  // ---------- ① 强缓存：Cache-Control: max-age ----------
  // 60 秒内浏览器直接用本地副本，根本不发请求（Network 里显示 (from disk/memory cache)）
  if (req.url === '/strong.js') {
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'max-age=60', // 新鲜期 60 秒
    });
    console.log('  → 200 强缓存 max-age=60（60 秒内浏览器不会再来）');
    res.end(ASSET_CONTENT);
    return;
  }

  // ---------- ② 强缓存 + immutable ----------
  // 适合带内容 hash 的构建产物（app.a1b2c3.js），内容变了文件名就变，故可"永不过期"
  if (req.url === '/immutable.js') {
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'max-age=31536000, immutable', // 一年 + 声明不可变
    });
    console.log('  → 200 强缓存 immutable（一年内绝不回源，连协商都不做）');
    res.end(ASSET_CONTENT);
    return;
  }

  // ---------- ③ 协商缓存：ETag / If-None-Match ----------
  if (req.url === '/etag.js') {
    const inm = req.headers['if-none-match']; // 浏览器带上次的 ETag
    if (inm && inm === ASSET_ETAG) {
      // 内容没变 → 回 304，不带响应体，浏览器复用本地副本
      res.writeHead(304, { ETag: ASSET_ETAG });
      console.log(`  → 304 未修改（If-None-Match 匹配 ${ASSET_ETAG}），省下响应体`);
      res.end();
      return;
    }
    // 首次或内容变了 → 回 200 + 最新内容 + ETag
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache', // 每次都协商
      ETag: ASSET_ETAG,
    });
    console.log(`  → 200 返回完整内容并下发 ETag ${ASSET_ETAG}`);
    res.end(ASSET_CONTENT);
    return;
  }

  // ---------- ④ 协商缓存：Last-Modified / If-Modified-Since ----------
  if (req.url === '/lastmod.js') {
    const ims = req.headers['if-modified-since']; // 浏览器带上次的 Last-Modified
    if (ims && new Date(ims).getTime() >= new Date(ASSET_LAST_MODIFIED).getTime()) {
      res.writeHead(304, { 'Last-Modified': ASSET_LAST_MODIFIED });
      console.log('  → 304 未修改（If-Modified-Since 不早于资源修改时间）');
      res.end();
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Last-Modified': ASSET_LAST_MODIFIED,
    });
    console.log('  → 200 返回完整内容并下发 Last-Modified');
    res.end(ASSET_CONTENT);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`HTTP 缓存 demo 已启动：http://localhost:${PORT}`);
  console.log('提示：先在 DevTools 关掉 Disable cache，反复刷新观察 200 / 304 / (from cache)');
});
