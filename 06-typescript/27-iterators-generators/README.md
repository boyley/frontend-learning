# 27 · 迭代器与生成器（Iterators & Generators）
> TypeScript 用 `Iterable<T>` / `Iterator<T>` / `Generator<T>` 描述「可迭代对象、迭代器、生成器」。实现 `[Symbol.iterator]` 即可被 `for...of` 和展开运算符消费。

## 📖 知识讲解

对照官方 Handbook 的 **Iterators and Generators**。

- **`Iterable<T>`（可迭代）**：拥有 `[Symbol.iterator]()` 方法的对象。数组、`string`、`Map`、`Set`、`NodeList` 等内置类型都实现了它，因此都能 `for...of` / 展开 / `Array.from`。
- **`Iterator<T>`（迭代器）**：拥有 `next()` 方法的对象，每次返回 `IteratorResult<T>`——即 `{ value, done }`；`done` 为 `true` 表示迭代结束。
- **`[Symbol.iterator]`** 是连接二者的桥梁：`for...of` 会调用可迭代对象的 `Symbol.iterator` 拿到迭代器，再反复 `next()` 取值。
- **生成器函数 `function*`**：写迭代器的「傻瓜」方式。`yield` 逐个产出值并在此暂停，下次 `next()` 再继续；返回类型是 **`Generator<T>`**，它本身**既是 Iterator 又是 Iterable**，可直接 `for...of`。
- **`Generator<T, TReturn, TNext>` 三个类型参数**：产出值类型、`return` 的返回值类型、`next()` 传入值类型（后两者进阶时才用）。
- **`for...of` vs `for...in`（最易混淆）**：
  - `for...of` 遍历**值**，依赖 `Symbol.iterator`，只作用于可迭代对象；
  - `for...in` 遍历**键名/索引（字符串）**，作用于任意对象的可枚举属性——用它遍历数组会拿到 `"0"/"1"...` 字符串索引，通常不是你想要的。

编译目标提示：`for...of`、生成器、展开可迭代对象在 `target` 为 **ES2015+** 时直接用原生迭代协议；若目标是 ES5，需要开启 `downlevelIteration`。本工程 `target: ES2020`，开箱即用。

## 🔄 流程图 / 原理图

```mermaid
sequenceDiagram
  participant Loop as for...of
  participant Obj as Iterable&lt;T&gt;
  participant It as Iterator&lt;T&gt;
  Loop->>Obj: 调用 [Symbol.iterator]()
  Obj-->>Loop: 返回 Iterator
  loop 直到 done 为 true
    Loop->>It: next()
    It-->>Loop: { value, done: false }
    Note over Loop: 使用 value（循环体）
  end
  Loop->>It: next()
  It-->>Loop: { value: undefined, done: true }
  Note over Loop: done=true → 结束循环
```

## 💻 代码说明

- `class NumberRange implements Iterable<number>`：手写 `[Symbol.iterator]()` 返回带 `next()` 的迭代器；随后被 `for...of` 和展开运算符消费。
- `function* countdown`：生成器函数，`yield` 逐个产出；演示 `next()` 手动取值与 `[...countdown(3)]` 展开。
- `class Stack<T>` 的 `*[Symbol.iterator]()`：用**生成器方法**实现可迭代类，比手写 `next` 简洁得多。
- `withReturn(): Generator<number, string, unknown>`：演示三个类型参数中的 `TReturn`——最后一次 `next()` 的 `value` 是 `return` 的值。
- `for...of` vs `for...in` 对比：前者取值 `["x","y","z"]`，后者取字符串索引 `["0","1","2"]`，并点明常见误用。
- `toArray<T>(iterable: Iterable<T>)`：以 `Iterable<T>` 作参数，可接受数组 / `Set` / 生成器等一切可迭代来源。

## ▶️ 运行方式

在工程根 `06-typescript` 下：

```bash
npm i -D typescript ts-node
npx ts-node 27-iterators-generators/demo.ts
# 或编译检查：npx tsc --noEmit
```

## ⚠️ 常见坑 / 最佳实践

- **遍历数组/Set/Map 的「值」用 `for...of`**；`for...in` 是给普通对象取键的，用在数组上会得到字符串索引且可能带上继承的可枚举属性。
- **优先用生成器 `function*` / `*[Symbol.iterator]()`** 实现可迭代，几乎不用手写 `next()` 与 `done` 状态机。
- **`target: ES5` 时** `for...of` 自定义可迭代对象需 `downlevelIteration`（或 `--target es2015+`），否则只能迭代数组。
- **把参数类型写成 `Iterable<T>`** 而非具体 `T[]`，函数就能接受任何可迭代来源，更通用。
- 生成器天生「惰性」，适合表示无限/超大序列（按需产出），配合 `take` 之类工具很强大。

## 🔗 官方文档

- Iterators and Generators: https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html
