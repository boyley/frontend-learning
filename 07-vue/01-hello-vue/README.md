# 01 · 你好 Vue（Hello Vue / 声明式渲染）

> 用最少的代码体验 Vue 3：界面随数据自动更新，而不需要你手动操作 DOM。

## 📖 知识讲解

Vue 是一个用于构建用户界面的 **渐进式 JavaScript 框架**。它的核心思想是 **声明式渲染**：

- **命令式（传统 DOM）**：你要一步步告诉浏览器「找到这个元素 → 改它的文本 → 再改那个」。
- **声明式（Vue）**：你只描述「界面应该长什么样、和哪些数据有关」，数据一变，Vue 自动帮你更新界面。

本模块用 **CDN 免构建** 方式跑通第一个 Vue 应用，涉及四个最基础的概念：

| 概念 | 写法 | 作用 |
| --- | --- | --- |
| 创建应用 | `Vue.createApp({...})` | 创建一个 Vue 应用实例 |
| 挂载 | `.mount('#app')` | 把应用接管到页面上某个 DOM 元素 |
| 响应式数据 | `ref('xxx')` | 创建会触发界面更新的数据 |
| 文本插值 | `{{ message }}` | 把数据显示到模板中 |

`setup()` 是 **组合式 API（Composition API）** 的入口函数，本合集统一采用组合式风格（进阶模块会用 SFC 的 `<script setup>` 语法糖）。

## 🔄 流程图 / 原理图

```mermaid
flowchart TD
  A[浏览器加载 index.html] --> B[CDN 引入 vue.global.js]
  B --> C["createApp({ setup })"]
  C --> D["setup() 创建 ref 响应式数据"]
  D --> E[".mount('#app') 挂载到 DOM"]
  E --> F[模板插值 {{ }} 渲染初始界面]
  F --> G{用户交互<br/>点击 / 输入}
  G -->|修改 ref 的值| H[Vue 侦测到数据变化]
  H --> I[自动重新渲染对应 DOM]
  I --> G
```

## 💻 代码说明

```js
const { createApp, ref } = Vue;     // CDN 版把 API 挂在全局 Vue 对象上

createApp({
  setup() {
    const message = ref('你好，Vue！'); // ref 包装的值是响应式的
    const count = ref(0);
    return { message, count };          // return 后模板才能用
  }
}).mount('#app');
```

模板部分：

```html
<p>{{ message }}</p>          <!-- 文本插值 -->
<input v-model="message" />   <!-- 双向绑定：输入即更新 message -->
<button @click="count++">+1</button> <!-- @click 监听点击 -->
```

注意：在 **模板里** 使用 ref 不用写 `.value`（Vue 自动解包）；但在 **JS 逻辑里** 访问要写 `count.value`。

## ▶️ 运行方式

**CDN 免构建**，无需安装任何东西：

直接用浏览器打开本目录的 `index.html` 即可（双击即可）。

## ⚠️ 常见坑 / 最佳实践

- **忘记 return**：`setup()` 里定义的变量没 return，模板里会报「未定义」。
- **`.value` 混淆**：JS 里读写 ref 必须加 `.value`，模板里不用。
- **挂载点选择器写错**：`mount('#app')` 的 `#app` 要和 HTML 里的 `id="app"` 对应。
- 生产环境请用压缩版 `vue.global.prod.js`；学习用 `vue.global.js`（带警告提示，更友好）。

## 🔗 官方文档

- 快速上手：https://cn.vuejs.org/guide/quick-start.html
- 声明式渲染（教程）：https://cn.vuejs.org/tutorial/
- 创建一个应用：https://cn.vuejs.org/guide/essentials/application.html
