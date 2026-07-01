/**
 * 16 · 类型断言（Type Assertions）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 16-type-assertions/demo.ts`
 *
 * 本模块只聚焦一个主题：当「你比编译器更清楚某个值的类型」时，
 * 如何用类型断言告诉 TS「相信我，它就是这个类型」。
 *
 * 核心记忆点：类型断言只在【编译期】改变 TS 对类型的看法，
 * 【运行时不产生任何代码、不做任何转换、不做任何校验】——断言错了运行时照样崩。
 */

// ===== 1. as 语法：最常用的断言写法 =====
// 典型场景：DOM 查询返回的是宽泛的 HTMLElement | null，我们知道它其实是 input
// （这里用类型模拟，node 环境没有真实 DOM）
type FakeInputElement = { value: string; type: string };
const el: unknown = { value: "hello", type: "text" };

// unknown 不能直接取属性，用 as 断言成具体类型后即可访问
const input = el as FakeInputElement;
console.log("as 断言后取值:", input.value);

// ===== 2. 尖括号语法：<T>value，与 as 等价 =====
// ⚠️ 在 .tsx（React）文件里尖括号会和 JSX 冲突，所以现代代码统一推荐用 as
const input2 = <FakeInputElement>el;
console.log("尖括号断言后取值:", input2.type);

// ===== 3. 断言只能在「有重叠关系」的类型间进行 =====
// ❌ 错误示范：把 string 直接断言成 number（毫不相干）
// const bad = "abc" as number;
//   报错：Conversion of type 'string' to type 'number' may be a mistake because
//         neither type sufficiently overlaps with the other.
// ✅ 正确：如果确实要「强转」，先断言成 unknown 再断言成目标类型（双重断言，慎用）
const forced = "abc" as unknown as number; // 编译期放行，但运行时 forced 依然是字符串！
console.log("双重断言(危险):", typeof forced, forced); // 打印 string abc —— 证明运行时没变

// ===== 4. 非空断言 !：断言「这个值一定不是 null / undefined」=====
function findUser(id: number): { name: string } | undefined {
  return id === 1 ? { name: "Alice" } : undefined;
}
// 加 ! 后，TS 认为返回值一定存在，可直接取 .name
const name = findUser(1)!.name;
console.log("非空断言取 name:", name);

// ❌ 错误示范：对真的可能为 undefined 的值滥用 !
// const crash = findUser(999)!.name;
//   编译期：! 让 TS 放行；
//   运行期：findUser(999) 返回 undefined，取 .name 直接抛 TypeError —— ! 只是骗过了编译器

// ===== 5. const 断言 as const：把值「冻结」成最窄的字面量只读类型 =====
// 不加 as const：类型被拓宽（widening）
const cfg1 = { method: "GET", retries: 3 };
// 推断为 { method: string; retries: number } —— method 是 string，可被改写

// 加 as const：所有属性变 readonly，字面量不再拓宽
const cfg2 = { method: "GET", retries: 3 } as const;
// 推断为 { readonly method: "GET"; readonly retries: 3 }
console.log("as const 配置:", cfg2.method);

// ❌ 错误示范：修改 as const 对象的属性
// cfg2.method = "POST";
//   报错：Cannot assign to 'method' because it is a read-only property.

// 数组用 as const 会变成「只读元组」，常用于收窄联合
const routes = ["home", "about", "contact"] as const;
// 类型：readonly ["home", "about", "contact"]
type Route = (typeof routes)[number]; // => "home" | "about" | "contact"
const go = (r: Route) => console.log("跳转:", r);
go("about"); // ✅ 只接受三个字面量之一
// go("xxx"); // ❌ 报错：类型 '"xxx"' 不能赋给 Route

// ===== 6. 断言 ≠ 类型转换（最重要的一课）=====
// 类型断言不会像 Number("1") 那样真的转换值，它只是「让编译器闭嘴」。
const numLike = "123";
const notReallyNumber = numLike as unknown as number;
console.log("断言不转换:", notReallyNumber + 1); // 结果是 "1231"（字符串拼接！），不是 124
// ✅ 真正要转换请用运行时函数：Number(numLike) => 123

export {};
