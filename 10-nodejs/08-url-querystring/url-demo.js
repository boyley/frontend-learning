// ============================================================
// 08 · URL 解析 与 查询字符串 —— WHATWG URL / URLSearchParams
// 运行方式：node url-demo.js
// ============================================================

// 现代 Node 推荐用「全局的 URL 类」（WHATWG 标准，和浏览器一致），
// 老的 url.parse() 和 querystring 模块已被标记为 Legacy（仅做兼容，新代码别用）。

// ① 用 URL 解析一个完整网址
const u = new URL('https://user:pass@www.example.com:8080/path/page?id=42&tag=node&tag=js#section');

console.log('--- URL 各部分 ---');
console.log('protocol 协议  ：', u.protocol);   // https:
console.log('hostname 主机  ：', u.hostname);   // www.example.com
console.log('port     端口  ：', u.port);       // 8080
console.log('host     主机+端口：', u.host);    // www.example.com:8080
console.log('pathname 路径  ：', u.pathname);   // /path/page
console.log('search   查询串：', u.search);     // ?id=42&tag=node&tag=js
console.log('hash     锚点  ：', u.hash);        // #section
console.log('origin   源    ：', u.origin);     // https://www.example.com:8080

// ② searchParams：解析/操作查询参数（它本身就是一个 URLSearchParams）
console.log('\n--- 查询参数 ---');
console.log('get(id)    ：', u.searchParams.get('id'));        // 42
console.log('getAll(tag)：', u.searchParams.getAll('tag'));    // ['node','js']（同名取全部）
console.log('has(tag)   ：', u.searchParams.has('tag'));       // true

// ③ 修改参数后再读回完整 URL（改 searchParams 会同步反映到 u.href）
u.searchParams.set('id', '100');     // 改值
u.searchParams.append('page', '2');  // 追加
u.searchParams.delete('tag');        // 删除
console.log('修改后的完整 URL：', u.href);

// ④ 单独用 URLSearchParams 构造/拼接查询串（不依赖完整 URL）
console.log('\n--- 独立使用 URLSearchParams ---');
const params = new URLSearchParams({ q: '前端 学习', page: 1, size: 20 });
console.log('toString 自动 URL 编码：', params.toString());
// q=%E5%89%8D%E7%AB%AF+%E5%AD%A6%E4%B9%A0&page=1&size=20

// 从字符串反向解析
const p2 = new URLSearchParams('a=1&b=2&a=3');
console.log('遍历参数：');
for (const [k, v] of p2) {
  console.log(`  ${k} = ${v}`);
}

// ⑤ 相对路径解析：第二个参数作为 base，常用于把接口相对路径补成绝对地址
const api = new URL('/v2/users?id=7', 'https://api.example.com');
console.log('\n相对路径拼接：', api.href); // https://api.example.com/v2/users?id=7

// ⑥ 处理本地文件 URL（file://）与系统路径互转
const { fileURLToPath, pathToFileURL } = require('node:url');
console.log('文件路径 → URL：', pathToFileURL('/Users/admin/a.txt').href);
console.log('URL → 文件路径：', fileURLToPath('file:///Users/admin/a.txt'));
