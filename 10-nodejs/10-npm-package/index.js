// ============================================================
// 10 · npm 与 package.json —— 项目清单、脚本、依赖
// 运行方式：
//   node index.js            （直接运行）
//   npm start                （等价，会先触发 prestart 钩子）
//   npm run hello            （运行自定义脚本）
// ============================================================

// package.json 是 Node 项目的「身份证 + 说明书」，常见字段：
//   name / version       包名与版本（遵循语义化版本 SemVer：主.次.修订）
//   main                 入口文件（别人 require 这个包时加载它）
//   type                 "commonjs"(默认) 或 "module"(让 .js 走 ESM)
//   scripts              自定义命令，用 `npm run <名字>` 执行
//   dependencies         生产依赖（npm install xxx）
//   devDependencies      开发依赖（npm install -D xxx，如测试、打包工具）
//   engines              声明所需 Node 版本

// 读取自己的 package.json 并打印（require 可直接读 .json 文件）
const pkg = require('./package.json');

console.log('=== 本项目 package.json 信息 ===');
console.log('包名    ：', pkg.name);
console.log('版本    ：', pkg.version);
console.log('入口    ：', pkg.main);
console.log('模块类型：', pkg.type);
console.log('可用脚本：', Object.keys(pkg.scripts).join(', '));

// 根据命令行参数做点简单分支，演示 scripts 调用
const cmd = process.argv[2];
if (cmd === 'hello') {
  console.log('\n👋 npm run hello 触发：你好，npm！');
} else {
  console.log('\n提示：试试 `npm run hello` 或 `npm start`');
}

// ---- 关于依赖与版本号（^ 与 ~）的说明（仅注释，无需安装）----
// "express": "^4.18.2"  → ^ 允许「次版本 + 修订」升级：>=4.18.2 <5.0.0
// "express": "~4.18.2"  → ~ 只允许「修订」升级：       >=4.18.2 <4.19.0
// "express": "4.18.2"   → 锁定精确版本
//
// 常用命令：
//   npm init -y              快速生成 package.json
//   npm install              按 package.json 安装全部依赖（生成 node_modules + package-lock.json）
//   npm install axios        装生产依赖并写入 dependencies
//   npm install -D eslint    装开发依赖并写入 devDependencies
//   npm install -g nodemon   全局安装命令行工具
//   npm uninstall axios      卸载
//   npm run <script>         运行 scripts 里的命令
//
// package-lock.json：锁定整棵依赖树的精确版本，保证团队/CI 安装结果一致，务必提交到 git。
