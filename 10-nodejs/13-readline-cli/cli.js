// ============================================================
// 13 · readline 命令行交互 —— 做一个能问答的 CLI 小工具
// 运行方式：node cli.js
// 退出：回答完毕自动结束，或随时按 Ctrl + C
// ============================================================

// readline 模块逐行读取「可读流」（这里是标准输入 process.stdin），
// 非常适合写命令行问答、交互式脚本、简易 REPL。
const readline = require('node:readline');

// 创建接口：input 绑定键盘输入，output 绑定屏幕输出
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ① question：抛出一个问题，回车后把用户输入交给回调
// 把回调风格包成 Promise，方便用 async/await 顺序提问
function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('=== 欢迎使用注册小工具（readline 演示）===\n');

  const name = await ask('请输入你的名字：');
  const ageStr = await ask('请输入你的年龄：');
  const lang = await ask('最喜欢的编程语言？');

  const age = Number(ageStr);

  console.log('\n--- 你填写的信息 ---');
  console.log('名字  ：', name || '(未填)');
  console.log('年龄  ：', Number.isNaN(age) ? '(不是有效数字)' : age);
  console.log('最爱语言：', lang || '(未填)');

  if (!Number.isNaN(age)) {
    console.log(age >= 18 ? '✅ 已成年' : '⚠️ 未成年');
  }

  // ② 二次确认：演示循环追问，直到输入 y/n
  let confirm;
  do {
    confirm = (await ask('\n信息正确吗？(y/n) ')).trim().toLowerCase();
  } while (confirm !== 'y' && confirm !== 'n');

  console.log(confirm === 'y' ? '\n🎉 注册成功！' : '\n已取消，请重新运行。');

  // ③ 用完必须 close()，否则程序会一直挂着等待输入不退出
  rl.close();
}

// ④ 监听 close 事件（用户 Ctrl+C 或我们调用 close 都会触发）
rl.on('close', () => {
  console.log('\n再见 👋（readline 已关闭，进程退出）');
  process.exit(0);
});

main();

// 进阶：readline 还能监听 'line' 事件做持续命令解析，
// 配合 rl.setPrompt() + rl.prompt() 可做出类似数据库 shell 的循环交互界面。
