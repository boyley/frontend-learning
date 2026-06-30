/**
 * 08 · 类型收窄（Narrowing）
 * ---------------------------------------------
 * 当一个变量是联合类型时，TS 通过「控制流分析」在不同分支里把类型「收窄」到更具体的子类型，
 * 从而安全访问该子类型独有的属性/方法。本模块覆盖各种收窄手段。
 */

// ───────────────────────────────────────────────
// 1. typeof 类型守卫（区分原始类型）
// ───────────────────────────────────────────────

function printId(id: number | string): void {
  if (typeof id === "string") {
    // 这一分支里 id 被收窄为 string
    console.log("字符串 id:", id.toUpperCase());
  } else {
    // 否则收窄为 number
    console.log("数字 id:", id.toFixed(0));
  }
}
printId("abc");
printId(42);

// ❌ 错误示范：不收窄直接调用子类型方法
// function bad(id: number | string) { return id.toUpperCase(); }
// 报错：类型“number”上不存在属性“toUpperCase”。
// 原因：number 没有该方法，必须先收窄。

// ───────────────────────────────────────────────
// 2. 真值收窄（truthiness）
// ───────────────────────────────────────────────

function greet(name?: string): void {
  if (name) {
    // name 被收窄为 string（排除了 undefined 和 ""）
    console.log("你好,", name.toUpperCase());
  } else {
    console.log("你好, 陌生人");
  }
}
greet("tom");
greet();

// ───────────────────────────────────────────────
// 3. 字面量相等收窄
// ───────────────────────────────────────────────

function move(dir: "up" | "down") {
  if (dir === "up") {
    return "向上"; // 此处 dir 为 "up"
  }
  return "向下"; // 此处 dir 为 "down"
}

// ───────────────────────────────────────────────
// 4. instanceof 守卫（区分类实例）
// ───────────────────────────────────────────────

function logDate(x: Date | string): void {
  if (x instanceof Date) {
    console.log("Date:", x.toISOString()); // x 收窄为 Date
  } else {
    console.log("String:", x.toUpperCase()); // x 收窄为 string
  }
}
logDate(new Date(0));
logDate("hello");

// ───────────────────────────────────────────────
// 5. in 操作符守卫（按属性是否存在区分对象）
// ───────────────────────────────────────────────

interface Fish {
  swim(): void;
}
interface Bird {
  fly(): void;
}
function moveAnimal(animal: Fish | Bird): void {
  if ("swim" in animal) {
    animal.swim(); // 收窄为 Fish
  } else {
    animal.fly(); // 收窄为 Bird
  }
}

// ───────────────────────────────────────────────
// 6. 可辨识联合（discriminated union）收窄
// ───────────────────────────────────────────────
// 每个成员有一个公共「标签」字段（kind），用它来区分

interface Circle {
  kind: "circle";
  radius: number;
}
interface Square {
  kind: "square";
  side: number;
}
type Shape = Circle | Square;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2; // 收窄为 Circle
    case "square":
      return shape.side ** 2; // 收窄为 Square
    default:
      // ───────────────────────────────────────
      // 9. never 穷尽检查：所有情况都处理后，shape 类型为 never
      //    若以后新增 Shape 成员却忘了 case，这里会编译报错，提醒补全。
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// ───────────────────────────────────────────────
// 7. 自定义类型守卫（type predicate: 形参 is 类型）
// ───────────────────────────────────────────────

function isFish(animal: Fish | Bird): animal is Fish {
  // 返回 true 时，调用处会把 animal 收窄为 Fish
  return (animal as Fish).swim !== undefined;
}

function feed(animal: Fish | Bird): void {
  if (isFish(animal)) {
    animal.swim(); // 因为 isFish 的返回类型是 `animal is Fish`
  } else {
    animal.fly();
  }
}

// ───────────────────────────────────────────────
// 8. 断言函数（asserts）
// ───────────────────────────────────────────────
// 若条件不成立则抛错；通过后，TS 认为后续代码里类型已被「断言收窄」

function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== "string") {
    throw new Error("不是字符串!");
  }
}

function handle(input: unknown): void {
  assertIsString(input);
  // 这一行之后，input 被收窄为 string（否则上面已抛错）
  console.log("断言后可安全调用:", input.toUpperCase());
}

// ───────────────────────────────────────────────
// 运行输出
// ───────────────────────────────────────────────
console.log("move:", move("up"), move("down"));
console.log("circle area:", area({ kind: "circle", radius: 2 }).toFixed(2));
console.log("square area:", area({ kind: "square", side: 3 }));
feed({ swim: () => console.log("鱼在游") });
feed({ fly: () => console.log("鸟在飞") });
handle("hello");
console.log("演示结束");
