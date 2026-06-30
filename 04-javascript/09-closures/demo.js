// ============================================================
// 09 · 闭包（Closures）演示
// 浏览器和 Node 都能运行：node demo.js 直接看输出
// ============================================================

const lines = [];
function print(label, value) {
  const text =
    typeof value === 'object' && value !== null
      ? JSON.stringify(value)
      : String(value);
  const line = label + ' => ' + text;
  lines.push(line);
  console.log(line);
}

// ============================================================
// 什么是闭包？
// 一个函数 + 它「记住」并持续访问的外层词法环境（变量），
// 即使外层函数已经执行结束，这些变量也不会被回收。
// ============================================================

// ============================================================
// 1) 经典计数器：count 被内部函数持有，不会随 createCounter 结束而销毁
// ============================================================
function createCounter() {
  let count = 0; // 这是「私有变量」，外部无法直接访问
  // 返回的函数闭住了 count
  return function () {
    count++; // 每次调用都在「同一个」count 上累加
    return count;
  };
}
const counter = createCounter();
print('计数器第 1 次', counter()); // 1
print('计数器第 2 次', counter()); // 2
print('计数器第 3 次', counter()); // 3
// 再创建一个，互不干扰（各自有独立的 count）
const counter2 = createCounter();
print('新计数器独立从头开始', counter2()); // 1

// ============================================================
// 2) 循环中 var 的经典陷阱
// ============================================================
// var 没有块作用域，三个回调闭住的是「同一个」i，
// 循环结束时 i 已经是 3，所以全部输出 3。
function loopWithVar() {
  const result = [];
  for (var i = 0; i < 3; i++) {
    result.push(function () {
      return i; // 闭住的是共享的 i
    });
  }
  return result.map((fn) => fn());
}
print('var 循环陷阱（全是3）', loopWithVar()); // [3,3,3]

// ---------- 用 let 修复 ----------
// let 有块作用域，每轮循环都生成一个「全新的」i，
// 每个回调闭住各自那一轮的 i。
function loopWithLet() {
  const result = [];
  for (let i = 0; i < 3; i++) {
    result.push(function () {
      return i;
    });
  }
  return result.map((fn) => fn());
}
print('let 循环修复（0,1,2）', loopWithLet()); // [0,1,2]

// ============================================================
// 3) 闭包应用 A：私有变量 / 数据封装（模拟模块）
// ============================================================
function createBankAccount(initial) {
  let balance = initial; // 私有，外部无法直接改
  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) return '余额不足';
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}
const account = createBankAccount(100);
print('存入 50 后余额', account.deposit(50)); // 150
print('取出 30 后余额', account.withdraw(30)); // 120
print('查询余额', account.getBalance()); // 120
print('外部无法直接访问 balance', account.balance); // undefined（被闭包保护）

// ============================================================
// 4) 闭包应用 B：柯里化（currying）
// ============================================================
// 把多参函数拆成一串单参函数，每层闭住前面传入的参数。
function add(a) {
  return function (b) {
    return function (c) {
      return a + b + c; // 闭住了 a、b
    };
  };
}
print('柯里化 add(1)(2)(3)', add(1)(2)(3)); // 6
// 实用例：固定第一个参数，生成专用函数
const add10 = add(10);
print('add10(20)(30)', add10(20)(30)); // 60

// ============================================================
// DOM 输出：仅浏览器执行
// ============================================================
if (typeof document !== 'undefined') {
  const out = document.getElementById('output');
  if (out) out.textContent = lines.join('\n');
}
