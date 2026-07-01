# 18 · 索引访问类型（Indexed Access Types）
> 用「下标语法」在类型层面取出另一个类型里某个属性的类型：`T["key"]`、`T[number]`、`T[keyof T]`。就像给类型做取值操作，结果仍是一个类型。

## 📖 知识讲解

对照官方 Handbook 的 **Indexed Access Types**。它把 JavaScript 的取值语法搬进了类型系统：

| 语法 | 含义 | 结果 |
| --- | --- | --- |
| `T["id"]` | 取属性 `id` 的类型 | 单个类型 |
| `T["a" \| "b"]` | 用联合键取 | 各属性类型的**联合** |
| `T[keyof T]` | 取所有属性 | 所有值类型的**联合** |
| `T["a"]["b"]` | 嵌套取 | 深层属性的类型 |
| `T[number]` | 取数组/元组**元素**类型 | 元素类型 |
| `Tuple[0]` | 按下标取元组某位 | 该位置的类型 |

核心要点与易错点：
- **中括号里必须是「类型」，不是「值」**：写 `T[key]`（`key` 是变量）会报错，应写 `T["key"]` 或 `T[typeof key]`。这是最常见的坑。
- **`T[number]` 是取数组元素类型的标准姿势**：对 `string[]` 用 `[number]` 得到 `string`；配合 `as const` 数组，`(typeof arr)[number]` 能得到**字面量联合**，是「从值生成联合类型」的常用套路。
- **和 `keyof` 是黄金搭档**：`keyof T` 拿到所有键的联合，`T[keyof T]` 就拿到所有值类型的联合；泛型约束 `K extends keyof T` + 返回 `T[K]` 能写出类型精确的取值函数。
- 索引访问是很多工具类型的底层积木（如从对象类型批量取值、映射类型里取原属性类型）。

## 🔄 流程图 / 原理图

```mermaid
flowchart TD
  T["对象/数组类型 T"] --> K{"用什么索引?"}
  K -- 'T["id"]' --> S["取该属性的类型"]
  K -- 'T["a" | "b"]' --> U["取多个属性类型的联合"]
  K -- "T[keyof T]" --> AV["取全部属性值类型的联合"]
  K -- "T[number]" --> E["取数组/元组元素的类型"]
  K -- "Tuple[0]" --> P["取元组指定位置的类型"]
  S --> R["结果仍是一个类型<br/>可继续嵌套索引 T['a']['b']"]
```

## 💻 代码说明

- `User["id"]` / `User["name"]`：取单个属性类型；反例展示索引不存在的键报错。
- `User["id" | "name"]`：联合键得到 `number | string`。
- `User[keyof User]`：所有值类型的联合。
- `User["address"]["city"]`：嵌套索引深入取值。
- `User["roles"][number]`：取数组元素类型；`(typeof fruitsConst)[number]` 展示 `as const` + `[number]` 得到字面量联合。
- `Pair[0]` / `Pair[1]`：按下标取元组各位类型。
- `getProp<T, K extends keyof T>(obj, key): T[K]`：索引访问类型的实战——写一个返回类型精确的通用取值函数。
- 末尾反例：强调中括号里要放类型，不能直接放值变量。

## ▶️ 运行方式

在工程根 `06-typescript` 下：

```bash
npm i -D typescript ts-node
npx ts-node 18-indexed-access-types/demo.ts
# 或编译检查：npx tsc --noEmit
```

## ⚠️ 常见坑 / 最佳实践

- **索引里放类型，不是值**：`T[typeof key]` 而不是 `T[key]`。
- **取数组元素类型永远用 `T[number]`**，别去数下标。
- **想从常量数组生成联合类型**：`const arr = [...] as const; type X = (typeof arr)[number];`。
- **和泛型约束联用**（`K extends keyof T` → `T[K]`）是写通用工具、保证取值类型安全的标准范式。
- 索引访问只对「可索引的类型」有意义；对无关键索引会直接报错，这正是它比 `any` 安全的地方。

## 🔗 官方文档

- Indexed Access Types: https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
