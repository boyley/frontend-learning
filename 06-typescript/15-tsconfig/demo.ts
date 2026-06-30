/**
 * 15 · 编译配置（tsconfig.json）—— 演示「严格模式如何拦截 bug」
 *
 * 本 demo 不讲单一语法，而是展示：同一段代码，
 * 在 strict 开启（本工程 tsconfig 已开 strict: true）时，
 * 编译器会在「编译期」就拦下一批运行期才会暴露的 bug。
 *
 * README 里附了一份逐行注释的完整 tsconfig.json 样例。
 */

// ============================================================
// A) strictNullChecks —— 拦截「可能为 null/undefined」的访问
// ============================================================
function findUser(id: number): { name: string } | undefined {
  return id === 1 ? { name: 'Alice' } : undefined;
}

const user = findUser(2);

// ❌ 错误示范：直接访问可能是 undefined 的属性
// console.log(user.name);
// 原因：strictNullChecks 下 user 类型是 {name}|undefined，
//       直接 .name 报 TS18048: 'user' is possibly 'undefined'.

// ✅ 正确：先做存在性判断（收窄类型）
if (user) {
  console.log('[strictNullChecks] 用户名 =', user.name);
} else {
  console.log('[strictNullChecks] 未找到用户，已安全处理');
}

// ============================================================
// B) noImplicitAny —— 拦截「忘记标注、被推断成 any」的参数
// ============================================================

// ❌ 错误示范：参数没标类型，strict 下推断为隐式 any
// function double(x) { return x * 2; }
// 原因：noImplicitAny 报 TS7006: Parameter 'x' implicitly has an 'any' type.

// ✅ 正确：显式标注类型
function double(x: number): number {
  return x * 2;
}
console.log('[noImplicitAny] double(21) =', double(21));

// ============================================================
// C) strictFunctionTypes / 类型不匹配 —— 拦截「赋错值」
// ============================================================
let count: number = 0;

// ❌ 错误示范：把字符串赋给 number
// count = '10';
// 原因：TS2322: Type 'string' is not assignable to type 'number'.

count = 10; // ✅
console.log('[类型检查] count =', count);

// ============================================================
// D) strictPropertyInitialization —— 拦截「类字段未初始化」
// ============================================================
class Config {
  // ❌ 错误示范：声明了但没初始化、也没在构造函数赋值
  // url: string;
  // 原因：TS2564: Property 'url' has no initializer
  //       and is not definitely assigned in the constructor.

  // ✅ 正确：给默认值（或在构造函数里赋值）
  url: string = 'http://localhost';
  retries: number;

  constructor(retries: number) {
    this.retries = retries; // 在构造函数中明确赋值，满足初始化检查
  }
}
const cfg = new Config(3);
console.log('[strictPropertyInitialization] config =', cfg.url, cfg.retries);

// ============================================================
// E) noImplicitThis —— 拦截「this 隐式为 any」
//    （strict 自动开启，避免回调里 this 含义不明）
// ============================================================
const counter = {
  value: 0,
  inc(): void {
    // 正常方法里 this 指向 counter，类型明确
    this.value++;
  },
};
counter.inc();
console.log('[noImplicitThis] counter.value =', counter.value);

console.log('====== strict 模式让上述潜在 bug 在编译期就被拦下 ======');

export {};
