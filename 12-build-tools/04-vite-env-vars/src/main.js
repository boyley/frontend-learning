// src/main.js —— 读取 import.meta.env 演示

// import.meta.env 是 Vite 在构建时注入的「环境变量对象」
const env = import.meta.env;

// ① Vite 内置变量（不需要自己定义）
const builtIn = {
  MODE: env.MODE,         // 当前模式：development / production / staging ...
  DEV: env.DEV,           // 是否开发环境（布尔）
  PROD: env.PROD,         // 是否生产环境（布尔）
  BASE_URL: env.BASE_URL, // 部署基础路径（对应 config 的 base）
  SSR: env.SSR,           // 是否服务端渲染
};

// ② 自定义变量（必须 VITE_ 前缀才能读到）
const custom = {
  VITE_APP_TITLE: env.VITE_APP_TITLE,
  VITE_API_BASE_URL: env.VITE_API_BASE_URL,
};

// ③ 没有 VITE_ 前缀的变量 → 读不到（undefined），这是安全设计
const leaked = env.DB_PASSWORD; // undefined

document.querySelector('#app').innerHTML = `
  <h1>04 · 环境变量演示</h1>
  <h2>当前模式：<code>${builtIn.MODE}</code></h2>

  <h3>① Vite 内置变量 import.meta.env.*</h3>
  <pre>${JSON.stringify(builtIn, null, 2)}</pre>

  <h3>② 自定义变量（VITE_ 前缀）</h3>
  <pre>${JSON.stringify(custom, null, 2)}</pre>

  <h3>③ 非 VITE_ 前缀变量（被屏蔽，安全）</h3>
  <pre>import.meta.env.DB_PASSWORD = ${leaked}  // undefined ✅ 没泄露</pre>

  <p style="color:#888">
    👉 用 <code>npm run dev</code> 看到「开发环境」标题；<br/>
    👉 用 <code>npm run build &amp;&amp; npm run preview</code> 看到「生产环境」标题；<br/>
    👉 用 <code>npm run build:staging</code> 会加载 .env.staging。
  </p>
`;

// 也可以基于环境做逻辑分支
if (import.meta.env.DEV) {
  console.log('🛠 当前是开发环境，可以开启调试日志');
}
