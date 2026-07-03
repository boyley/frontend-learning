/* ============================================================
   08 · SSR 路由 —— 同构路由最小可运行 demo（零依赖，Node 内置 http）
   ------------------------------------------------------------
   演示 SSR 路由的三个核心动作：
   ① 服务端拿到请求 URL → 用「同一份路由表」匹配 → 直出完整 HTML（首屏有内容，利于 SEO/首屏速度）
   ② 把首屏数据 window.__SSR_STATE__ 注入 HTML，避免客户端重复请求（脱水/注水）
   ③ 客户端「激活 hydration」后接管路由：之后点链接走 history.pushState，不再刷新（变回 SPA）
   运行：  node server.js   然后浏览器打开 http://localhost:3000/
   ============================================================ */
const http = require('http');

// —— 同构路由表：服务端和客户端用【完全相同】的这份定义（这里为演示各写一份结构一致的）——
// 每个路由：path 正则 + 一个「渲染函数」render(params, data) 返回 HTML 片段 + 一个可选的「取数」loadData
const routes = [
  {
    path: /^\/$/,
    title: '首页',
    render: () => `<h2>🏠 Home</h2><p>这是<b>服务端直出</b>的首页内容——查看网页源代码(Ctrl+U)能直接看到这段文字，说明首屏 HTML 是服务器渲染好的，不是空壳。</p>`,
  },
  {
    path: /^\/about$/,
    title: '关于',
    render: () => `<h2>ℹ️ About</h2><p>关于页，同样由服务端直出。</p>`,
  },
  {
    // 动态路由 /user/:id，并演示「服务端取数」
    path: /^\/user\/([^/]+)$/,
    title: '用户',
    loadData: (params) => ({ id: params[0], name: 'User-' + params[0], joined: '2024' }), // 真实项目是查库/调 API
    render: (params, data) =>
      `<h2>👤 User #${data.id}</h2>
       <p>姓名：<b>${data.name}</b>，加入年份：${data.joined}</p>
       <p>这些数据是<b>服务端查好、直出在 HTML 里</b>的，同时通过 <code>window.__SSR_STATE__</code> 传给客户端，客户端激活时<b>不用再发一次请求</b>（这叫脱水/注水 dehydrate/hydrate）。</p>`,
  },
];

function matchRoute(pathname) {
  for (const r of routes) {
    const m = r.path.exec(pathname);
    if (m) return { route: r, params: m.slice(1) };
  }
  return null;
}

// —— 生成整页 HTML：首屏内容 + 注入的状态 + 客户端脚本 ——
function renderPage(pathname) {
  const hit = matchRoute(pathname);
  const data = hit && hit.route.loadData ? hit.route.loadData(hit.params) : null;
  const bodyHTML = hit ? hit.route.render(hit.params, data) : '<h2>404</h2><p>未匹配路由。</p>';
  const title = hit ? hit.route.title : '404';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · SSR 路由 demo</title>
  <style>
    body{font-family:system-ui,"PingFang SC",sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#222}
    nav{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
    a.link{padding:6px 12px;border:1px solid #16a34a;border-radius:6px;color:#16a34a;text-decoration:none;font-size:14px}
    a.link:hover{background:#dcfce7}
    #app{border:1px solid #e5e7eb;border-radius:8px;padding:18px;min-height:80px}
    .flag{font-size:12px;padding:4px 8px;border-radius:6px;margin:8px 0;display:inline-block}
    .ssr{background:#fef3c7;border:1px solid #fcd34d}
    .csr{background:#dcfce7;border:1px solid #86efac}
    code{background:#f3f4f6;padding:1px 4px;border-radius:4px}
  </style>
</head>
<body>
  <h1>08 · SSR 路由（同构路由）demo</h1>
  <div id="mode" class="flag ssr">当前由「服务端渲染 SSR」直出（首屏）</div>
  <nav>
    <a class="link" data-link href="/">Home</a>
    <a class="link" data-link href="/about">About</a>
    <a class="link" data-link href="/user/1">User 1</a>
    <a class="link" data-link href="/user/2">User 2</a>
    <a class="link" data-link href="/nope">404</a>
  </nav>
  <!-- 首屏内容：服务端已渲染好，直接出现在 HTML 源码里 -->
  <div id="app">${bodyHTML}</div>

  <!-- 脱水：把服务端取到的数据注入页面，客户端注水时直接用 -->
  <script>window.__SSR_STATE__ = ${JSON.stringify(data)};</script>

  <!-- 客户端路由脚本：激活(hydration)后接管，之后走 history，不再整页刷新 -->
  <script>
  (function(){
    // 客户端复用「同一份」路由表（结构与服务端一致，用字符串模板简化演示）
    var clientRoutes = [
      { re:/^\\/$/,             render:function(){ return '<h2>🏠 Home</h2><p>这次是<b>客户端渲染 CSR</b>——没有整页刷新，只换了这块 DOM。</p>'; } },
      { re:/^\\/about$/,        render:function(){ return '<h2>ℹ️ About</h2><p>客户端渲染的关于页。</p>'; } },
      { re:/^\\/user\\/([^/]+)$/, render:function(m){ return '<h2>👤 User #'+m[1]+'</h2><p>客户端导航时前端自己取数渲染（真实项目里发 fetch）。</p>'; } }
    ];
    var app = document.getElementById('app');
    var mode = document.getElementById('mode');

    function clientRender(pathname){
      for(var i=0;i<clientRoutes.length;i++){
        var m = clientRoutes[i].re.exec(pathname);
        if(m){ app.innerHTML = clientRoutes[i].render(m); return; }
      }
      app.innerHTML = '<h2>404</h2>';
    }

    // 激活：首屏 HTML 已经是服务端渲染好的，这里「接管」它而不是重画（真实框架会做 hydrate 复用 DOM + 绑事件）
    console.log('[hydration] 客户端激活完成，读到脱水数据 __SSR_STATE__ =', window.__SSR_STATE__);

    // 拦截站内 <a>，之后的导航全部走客户端 history（SPA 行为）
    document.addEventListener('click', function(e){
      var a = e.target.closest('a[data-link]');
      if(!a) return;
      e.preventDefault();
      history.pushState(null,'',a.getAttribute('href'));
      mode.className='flag csr'; mode.textContent='当前由「客户端渲染 CSR」（history 导航，无刷新）';
      clientRender(location.pathname);
    });
    // 前进/后退
    window.addEventListener('popstate', function(){
      mode.className='flag csr'; mode.textContent='当前由「客户端渲染 CSR」（history 导航，无刷新）';
      clientRender(location.pathname);
    });
  })();
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(req.url.split('?')[0]);
  const hit = matchRoute(pathname);
  // 关键：无论访问哪个路径（含刷新子路由），服务端都能匹配并直出 → SSR 不存在「刷新 404」问题
  res.writeHead(hit ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderPage(pathname));
});

server.listen(3000, () => {
  console.log('SSR 路由 demo 运行中 →  http://localhost:3000/');
  console.log('试试：直接访问 http://localhost:3000/user/2 并刷新，服务端每次都直出完整 HTML（对比 history 模式的 SPA 刷新 404）。');
});
