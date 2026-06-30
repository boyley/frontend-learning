// scripts/hello.js —— 最简单的脚本，证明 npm run hello 能跑起 node 脚本
console.log('👋 Hello from npm scripts! 运行命令：npm run hello');
console.log('当前 Node 版本：', process.version);

// npm 会把一些环境变量注入脚本，例如包名、版本
console.log('包名：', process.env.npm_package_name);
console.log('版本：', process.env.npm_package_version);
