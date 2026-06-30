# 11 · 跨层级数据共享（useContext）
> useContext 让深层组件直接读取顶层提供的数据，无需一层层手动传 props，专治「prop drilling（逐层透传）」。

## 📖 知识讲解
`useContext` 配合 `createContext` 解决的核心问题是：**跨越很多中间层级共享数据**。

三步走：
1. **创建** Context：`const Ctx = createContext(defaultValue)`，`defaultValue` 仅在没有匹配的 Provider 时生效。
2. **提供** 数据：用 `<Ctx.Provider value={...}>` 包裹子树，`value` 就是要共享的数据。
3. **消费** 数据：任意后代组件 `const data = useContext(Ctx)` 即可拿到最近一个 Provider 的 `value`。

没有 Context 时，如果 `App` 的数据要传给 `DeepChild`，必须 `App → Layout → DeepChild` 一层层把 props 传下去，而 `Layout` 根本不需要这份数据，纯属「过路费」。这就是 prop drilling。Context 让数据「穿透」中间层直达消费者。

适用场景：主题、当前登录用户、语言（i18n）、全局配置等**低频更新**的数据。

## 🔄 流程图 / 原理图
```mermaid
graph TD
  subgraph 用 Context（数据穿透）
    A1[App<br/>theme state + Provider] -->|value| L1[Layout 中间层<br/>不碰 theme]
    L1 --> D1[DeepChild<br/>useContext 直接读到 theme]
    A1 -.Context 直连.-> D1
  end
  subgraph 不用 Context（prop drilling）
    A2[App] -->|theme prop| L2[Layout<br/>被迫透传 theme]
    L2 -->|theme prop| D2[DeepChild]
  end
```

## 💻 代码说明
- `ThemeContext = createContext({theme:'light', toggle:()=>{}})`：默认值带一个空函数，避免无 Provider 时调用崩溃。
- `App` 持有真正的 `theme` state 与 `toggle`，通过 `value={{theme, toggle}}` 下发。
- `Layout` 是中间层，**完全不接触 theme**，证明数据是穿透传递的。
- `DeepChild` 用 `useContext(ThemeContext)` 直接读取并调用 `toggle` 切换主题。

## ▶️ 运行方式
CDN 免构建：用浏览器直接打开本目录的 `index.html` 即可，无需 npm / 打包工具。

## ⚠️ 常见坑 / 最佳实践
- **忘记包 Provider**：消费者会静默拿到 `createContext(defaultValue)` 的默认值，容易误以为「数据没更新」，排查很久。
- **value 每次传新对象**：`value={{theme, toggle}}` 在父组件每次渲染都是新引用，会让**所有消费者重渲染**。如需优化可用 `useMemo` 缓存 value，或拆分 Context。
- **不要塞高频数据**：Context 更新会触发全部消费者重渲染，鼠标位置、输入框每字符等高频数据不适合放 Context，应交给局部 state 或专门的状态库。

## 🔗 官方文档
- useContext: https://react.dev/reference/react/useContext
- createContext: https://react.dev/reference/react/createContext
- 用 Context 深层传递数据: https://react.dev/learn/passing-data-deeply-with-context
