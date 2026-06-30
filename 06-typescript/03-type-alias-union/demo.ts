/**
 * 03 · 类型别名 / 联合 / 交叉 / 字面量 demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 03-type-alias-union/demo.ts`
 *
 * 本模块聚焦：用 type 组合出更灵活的类型。
 */

// ===== 1. 类型别名 type：给一个类型起名字 =====
type ID = number | string; // 给「数字或字符串」起名叫 ID
const a: ID = 1;
const b: ID = "u-1001";
console.log("ID:", a, b);

// ===== 2. 联合类型 union（|）：值可以是其中任意一种 =====
type Status = "loading" | "success" | "error"; // 字面量联合
let s: Status = "loading";
s = "success";

// ❌ 错误示范：赋一个不在联合范围内的值
// s = "pending";
//   报错：Type '"pending"' is not assignable to type 'Status'.

// 使用联合值前，通常需要「收窄」才能调用各自特有的方法
function printId(id: number | string) {
  if (typeof id === "string") {
    console.log("string id 大写:", id.toUpperCase()); // 此分支 id 是 string
  } else {
    console.log("number id 翻倍:", id * 2); // 此分支 id 是 number
  }
}
printId("abc");
printId(21);

// ===== 3. 交叉类型 intersection（&）：同时具备多方属性 =====
type HasName = { name: string };
type HasAge = { age: number };
type Person = HasName & HasAge; // 必须同时拥有 name 和 age
const p: Person = { name: "Tom", age: 18 };
console.log("person:", p);

// ❌ 错误示范：交叉类型缺少其中一方属性
// const bad: Person = { name: "Jerr" };
//   报错：Property 'age' is missing in type '{ name: string; }'.

// ===== 4. 字面量类型 literal types：把「具体的值」当作类型 =====
type Direction = "up" | "down" | "left" | "right";
function move(dir: Direction) {
  console.log("move:", dir);
}
move("up");
// move("forward"); // ❌ 报错：不是合法 Direction

// 数字字面量同样可用
type Dice = 1 | 2 | 3 | 4 | 5 | 6;
const roll: Dice = 4;
console.log("dice:", roll);

// ===== 5. 可辨识联合 discriminated union（简介）=====
// 给联合里的每个成员加一个共同的「字面量标签字段」（这里是 kind），
// 通过判断该字段就能精确收窄到对应成员，是处理多形态数据的利器。
interface Circle {
  kind: "circle"; // 辨识标签
  radius: number;
}
interface Rectangle {
  kind: "rectangle"; // 辨识标签
  width: number;
  height: number;
}
type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // 命中 "circle"，shape 被收窄为 Circle，可安全访问 radius
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      // 命中 "rectangle"，收窄为 Rectangle，可访问 width/height
      return shape.width * shape.height;
    default:
      // 穷尽性检查：若将来新增成员忘了处理，这里会编译报错
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
console.log("circle area:", area({ kind: "circle", radius: 2 }).toFixed(2));
console.log("rect area:", area({ kind: "rectangle", width: 3, height: 4 }));

console.log("type/union demo 运行完成");
