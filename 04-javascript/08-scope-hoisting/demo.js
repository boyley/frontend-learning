// ============================================================
// 08 · 作用域与提升（Scope & Hoisting）演示
// 浏览器和 Node 都能运行：node demo.js 直接看输出
// ============================================================

const lines = [];
function print(label, value) {
  const line = label + ' => ' + String(value);
  lines.push(line);
  console.log(line);
}

// ============================================================
// 1) var 的变量提升（hoisting）
// ============================================================
// 下面这行不会报错，而是输出 undefined：
// 因为 var 声明被「提升」到函数/全局顶部，但赋值留在原地。
// 等价于：var hoistedVar; print(...); hoistedVar = 10;
print('var 提升：声明前访问', typeof hoistedVar); // undefined（不是报错）
var hoistedVar = 10;
print('var 赋值后访问', hoistedVar); // 10

// ============================================================
// 2) 函数提升：整个函数体被提升，声明前就能调用
// ============================================================
// 函数声明（function foo(){}）会被「整体提升」，所以这里能正常调用
print('函数提升：声明前调用', greet()); // "你好"
function greet() {
  return '你好';
}

// 注意：函数表达式（const fn = function(){}）不会整体提升，
// 只有变量名按 var/let/const 规则提升，不能提前调用。

// ============================================================
// 3) let / const 的暂时性死区（TDZ）
// ============================================================
function tdzDemo() {
  // 从函数顶部到 let 声明这一行之间，叫「暂时性死区」
  // 在死区里访问 tdzVar 会直接抛 ReferenceError（不是 undefined）
  try {
    // eslint-disable-next-line no-use-before-define
    console.log(tdzVar);
  } catch (e) {
    return 'TDZ 报错：' + e.name; // ReferenceError
  } finally {
    // 这里再声明
    // eslint-disable-next-line no-unused-vars
    var _placeholder = 1;
  }
  let tdzVar = 5;
  return tdzVar;
}
print('let 暂时性死区', tdzDemo()); // TDZ 报错：ReferenceError

// ============================================================
// 4) 块级作用域：let/const 只在 {} 内有效，var 没有块作用域
// ============================================================
{
  let blockLet = 'block-let';
  var blockVar = 'block-var';
  print('块内访问 blockLet', blockLet);
}
// 出了块：blockVar 还在（var 无块作用域，泄漏到外层）
print('块外访问 var 仍在', blockVar); // block-var
// blockLet 已不存在，访问会报错（下面用 try 演示）
try {
  // eslint-disable-next-line no-undef
  console.log(blockLet);
} catch (e) {
  print('块外访问 let 报错', e.name); // ReferenceError
}

// ============================================================
// 5) 作用域链：内层函数能逐层向外查找变量
// ============================================================
const globalVar = '全局';
function outer() {
  const outerVar = '外层';
  function inner() {
    const innerVar = '内层';
    // inner 找变量的顺序：自己 -> outer -> 全局（这就是作用域链）
    return `${innerVar} <- ${outerVar} <- ${globalVar}`;
  }
  return inner();
}
print('作用域链逐层向外查找', outer()); // 内层 <- 外层 <- 全局

// ============================================================
// 6) 变量遮蔽（shadowing）：内层同名变量优先
// ============================================================
const value = '外层value';
function shadow() {
  const value = '内层value'; // 遮蔽外层同名变量
  return value;
}
print('内层遮蔽外层', shadow()); // 内层value
print('外层 value 不受影响', value); // 外层value

// ============================================================
// DOM 输出：仅浏览器执行
// ============================================================
if (typeof document !== 'undefined') {
  const out = document.getElementById('output');
  if (out) out.textContent = lines.join('\n');
}
