// ============================================================
// mini-framework.js —— 手写 ~50 行极简框架（零依赖）
// 目的：亲手实现 app.get/app.post/use + 自动 body 解析，
//       看清 Express 这类框架「到底帮你做了什么」。
// 运行：node mini-framework.js
// ============================================================

const http = require('http');

// ---------- 极简框架本体 ----------
class App {
  constructor() {
    this.middlewares = []; // 中间件列表：fn(req, res, next)
    this.routes = []; // 路由表：{ method, path, handler }
  }

  // 注册中间件（应用级）
  use(fn) {
    this.middlewares.push(fn);
    return this; // 支持链式
  }

  // 注册路由（内部通用方法）
  _add(method, path, handler) {
    this.routes.push({ method, path, handler });
    return this;
  }
  get(path, handler) {
    return this._add('GET', path, handler);
  }
  post(path, handler) {
    return this._add('POST', path, handler);
  }

  // 核心：把请求交给「中间件链 → 路由」处理
  _handle(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    req.path = url.pathname; // 挂到 req 上，业务直接用
    req.query = Object.fromEntries(url.searchParams); // 自动解析 query

    // res.json：框架帮你封装「设 header + 序列化」
    res.json = (obj, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(obj));
    };

    // 依次执行中间件，最后 next 走到路由匹配（洋葱式的简化版）
    let i = 0;
    const next = () => {
      if (i < this.middlewares.length) {
        this.middlewares[i++](req, res, next); // 执行下一个中间件
      } else {
        this._route(req, res); // 中间件跑完 → 路由分发
      }
    };
    next();
  }

  // 路由匹配（支持 /users/:id 这种路径参数）
  _route(req, res) {
    for (const r of this.routes) {
      if (r.method !== req.method) continue;
      const params = matchPath(r.path, req.path);
      if (params) {
        req.params = params; // 路径参数自动挂载
        return r.handler(req, res);
      }
    }
    res.json({ error: 'Not Found', path: req.path }, 404); // 统一 404 兜底
  }

  listen(port, cb) {
    // 关键：框架在这里帮你自动读 body 并解析 JSON，业务无需再写 data/end
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        req.body = body ? safeJSON(body) : {}; // 自动 body 解析
        this._handle(req, res);
      });
    });
    server.listen(port, cb);
  }
}

// 把 "/users/:id" 与 "/users/1" 匹配，返回 { id: '1' }；不匹配返回 null
function matchPath(pattern, actual) {
  const pp = pattern.split('/');
  const ap = actual.split('/');
  if (pp.length !== ap.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = ap[i];
    else if (pp[i] !== ap[i]) return null;
  }
  return params;
}

function safeJSON(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

// ---------- 用这个「框架」写业务：和 native-server 同样的接口 ----------
const app = new App();

// 一个日志中间件（框架机制让它可复用、可插拔）
app.use((req, res, next) => {
  console.log(`[mini] ${req.method} ${req.path}`);
  next(); // 不调用 next，请求就卡住——这就是洋葱模型的传递
});

app.get('/', (req, res) => res.json({ msg: 'mini-framework 首页' }));

app.get('/users/:id', (req, res) => {
  // 路径参数、query 都由框架解析好了
  res.json({ id: req.params.id, name: `用户${req.params.id}`, query: req.query });
});

app.post('/users', (req, res) => {
  // req.body 已经是解析好的对象，业务只管用
  res.json({ created: true, received: req.body }, 201);
});

app.listen(3002, () => {
  console.log('mini-framework 运行在 http://localhost:3002');
});
