// ============================================================
// 04 · 路径处理 path —— 跨平台拼接、解析路径
// 运行方式：node path-demo.js
// ============================================================

// 为什么不用字符串手动拼路径？因为 Windows 用 '\'，Linux/Mac 用 '/'，
// 手拼容易出错。path 模块会自动适配当前操作系统。
const path = require('node:path');

const p = '/Users/admin/work/project/index.html';

// ① 拆解路径的各个部分
console.log('dirname  目录名 ：', path.dirname(p));   // /Users/admin/work/project
console.log('basename 文件名 ：', path.basename(p));  // index.html
console.log('basename 去扩展：', path.basename(p, '.html')); // index
console.log('extname  扩展名 ：', path.extname(p));   // .html

// ② parse 一次性拆成对象（与 format 互为逆操作）
console.log('parse 结果：', path.parse(p));
// { root:'/', dir:'/Users/admin/work/project', base:'index.html', ext:'.html', name:'index' }
console.log('format 还原：', path.format({ dir: '/a/b', name: 'file', ext: '.txt' }));

// ③ join：智能拼接（自动处理多余/缺失的分隔符，会规范化 .. 和 .）
console.log('join  ：', path.join('a', 'b', '..', 'c', 'index.js')); // a/c/index.js

// ④ resolve：从右往左拼，得到「绝对路径」（遇到绝对路径就停）
//    常用于把相对路径转成绝对路径
console.log('resolve：', path.resolve('src', 'utils', 'index.js'));
// 等价于：当前工作目录 + /src/utils/index.js

// ⑤ join vs resolve 的关键区别：
//    - join 只是拼字符串，不关心当前目录，结果可能是相对路径
//    - resolve 一定返回绝对路径（以 process.cwd() 当前工作目录为基准）
console.log('join("a","b")    →', path.join('a', 'b'));     // a/b（相对）
console.log('resolve("a","b") →', path.resolve('a', 'b'));  // /当前目录/a/b（绝对）

// ⑥ relative：计算从 A 到 B 的相对路径
console.log('relative：', path.relative('/data/a/b', '/data/x/y')); // ../../x/y

// ⑦ 平台相关常量
console.log('路径分隔符 sep    ：', JSON.stringify(path.sep));     // '/' 或 '\\'
console.log('环境变量分隔符 delimiter：', JSON.stringify(path.delimiter)); // ':' 或 ';'
console.log('是绝对路径吗？', path.isAbsolute(p)); // true

// ⑧ 实战最常见：拼出「相对当前文件」的绝对路径
const configPath = path.join(__dirname, 'config', 'app.json');
console.log('配置文件绝对路径：', configPath);
