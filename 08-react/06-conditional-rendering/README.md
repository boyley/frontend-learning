# 06 · 条件渲染（Conditional Rendering）
> 根据组件的 state / props 决定渲染什么界面：登录与否、加载中、列表空态都靠它。

## 📖 知识讲解
React 没有专门的「条件指令」，条件渲染就是普通的 JavaScript 表达式，因为 JSX 本质是函数调用，元素只是值。常见四种写法：

- **if / else + 早返回**：在组件函数里根据条件 `return` 不同 JSX。适合整块界面差异大的场景。
- **三元运算符 `条件 ? A : B`**：在一段 JSX 内部二选一，两个分支都要写。**最安全、推荐默认使用**。
- **逻辑与 `条件 && JSX`**：条件为真时渲染右侧，为假时渲染「假值」。简洁，但有 `0` 的坑。
- **返回 `null`**：表示「什么都不渲染」，组件依然会执行，只是没有输出 DOM。

核心 API / 语法：
- `{ 表达式 }`：JSX 中嵌入任意 JS 表达式。
- `cond ? <A/> : <B/>`、`cond && <A/>`、`return null`。

易错点：`&&` 左侧若是数字 `0`，会把 `0` 直接渲染到页面上（`0` 是假值但仍是可渲染的数字）；`false / null / undefined / true` 都不会渲染，唯独 `0` 和 `NaN` 会显示出来。

## 🔄 流程图 / 原理图
```mermaid
flowchart TD
    A[组件渲染开始] --> B{需要整块切换界面?}
    B -- 是 --> C[用 if/else 早返回不同 JSX]
    B -- 否 --> D{两种结果都要显示?}
    D -- 是, 二选一 --> E[三元 cond ? A : B]
    D -- 否, 只在真时显示 --> F{左侧可能是数字 0 吗?}
    F -- 可能是 0 --> G[改用三元 cond ? A : null 防止渲染出 0]
    F -- 是纯布尔 --> H[用 cond && A]
    C --> Z[输出对应界面]
    E --> Z
    G --> Z
    H --> Z
```

## 💻 代码说明
- **LoginPanel（if/else 早返回）**：`if (logged) return <已登录界面>`，否则 `return <未登录界面>`。整块界面差异大时最清晰。
- **LoadingDemo（三元）**：`{loading ? <加载中> : <已就绪>}`，在同一段 JSX 内根据布尔二选一。
- **ListDemo（综合）**：
  - 列表为空判断用三元 `items.length > 0 ? <ul> : <空态提示>`，避免 `length && ...` 在 0 时渲染出数字。
  - `items.length > 3 && <提示>`：左侧是明确的布尔表达式，`&&` 安全。
  - `items.length === 0 ? null : <统计>`：用 `null` 表示「不渲染」。

## ▶️ 运行方式
CDN 免构建：直接用浏览器打开本目录的 `index.html` 即可，无需 npm / 打包工具。

## ⚠️ 常见坑 / 最佳实践
- 🚫 `{count && <X/>}`：当 `count === 0` 时页面会显示一个 `0`。改成 `{count > 0 && <X/>}` 或 `{count ? <X/> : null}`。
- ✅ 拿不准时优先用三元，分支语义最明确。
- ✅ 「不渲染」用 `null`，不要返回 `undefined`（虽然也不渲染，但语义不清且某些场景报错）。
- ✅ 复杂条件可以先用变量把 JSX 算好（`let content = ...`），再在 return 里 `{content}`，避免 JSX 里嵌套太深。
- 记住：`false / null / undefined / true` 不渲染，`0 / NaN` 会渲染。

## 🔗 官方文档
- 条件渲染：https://react.dev/learn/conditional-rendering
