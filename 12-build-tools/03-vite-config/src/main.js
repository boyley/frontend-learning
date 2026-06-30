// src/main.js —— 演示配置项的实际效果

// ① 用 @ 别名导入（对应 vite.config.js 里的 resolve.alias）
import { now } from '@/utils.js';

// ② 使用 define 注入的全局常量（构建时会被替换成 "1.0.0"）
//    注意：这个标识符在源码里「凭空存在」，靠 define 配置喂给它值
/* global __APP_VERSION__ */
const version = __APP_VERSION__;

document.querySelector('#app').innerHTML = `
  <h1>03 · vite.config.js 配置演示</h1>
  <ul style="line-height:1.8">
    <li>✅ <b>@ 别名</b>：成功从 <code>@/utils.js</code> 导入，当前时间 = ${now()}</li>
    <li>✅ <b>define 常量</b>：__APP_VERSION__ 被替换为 = <code>${version}</code></li>
    <li>👉 试试在 <code>vite.config.js</code> 改 <code>server.port</code> 重启，端口会变</li>
    <li>👉 配了 <code>server.proxy</code> 后，<code>fetch('/api/...')</code> 会被转发到后端</li>
  </ul>
`;
