# 前端学习合集 · 统一规范（所有工程 / 所有 sub-agent 必须遵守）

> 本文件是所有工程、所有模块的**唯一风格标准**。任何 agent 生成内容前先读本文件。

## 一、总目录结构

```
frontend-learning/                 ← 根目录（一个仓库装下所有前端知识）
├── README.md                      ← 总览 + 学习路线图
├── _CONVENTIONS.md                ← 本文件（统一规范）
├── 01-html/                       ← 工程：每个技术栈一个工程目录
│   ├── README.md                  ← 工程级 README（该栈的模块索引 + 学习路线 + 流程图）
│   ├── 01-document-structure/     ← 模块：一个知识点一个模块
│   │   ├── README.md              ← 模块 README（知识讲解 + Mermaid 流程图 + 运行方式）
│   │   ├── index.html             ← 可运行 demo（或 .js/.ts/.vue 等）
│   │   └── ...
│   ├── 02-…/
│   └── …
├── 02-css/
├── 03-css3/
├── 04-javascript/
├── 05-web-api/
├── 06-typescript/
├── 07-vue/
├── 08-react/
├── 09-angular/
├── 10-nodejs/
├── 11-sass/
└── 12-build-tools/
```

## 二、模块命名

- 工程目录：`NN-栈名`（两位数字 + 中划线 + 英文小写），如 `04-javascript`。
- 模块目录：`NN-knowledge-point`（两位数字 + 英文 kebab-case），如 `07-closures`、`12-async-await`。
- 编号体现**官方文档推荐的学习顺序**，由易到难。

## 三、每个模块必须包含

1. **一个最小可运行 demo**（聚焦讲清**一个**知识点，不堆砌）。
2. **模块 README.md**，固定结构：
   ```
   # NN · 知识点中文名（English Name）
   > 一句话说明这个知识点是什么、解决什么问题。

   ## 📖 知识讲解
   （中文讲解，对照官方文档；列出核心 API/语法 + 易错点）

   ## 🔄 流程图 / 原理图
   （至少一个 Mermaid 图：flowchart / sequenceDiagram / graph，讲清执行流程或概念关系）

   ## 💻 代码说明
   （demo 关键代码逐段解释）

   ## ▶️ 运行方式
   （CDN/免构建：直接浏览器打开 index.html；脚手架：npm 命令）

   ## ⚠️ 常见坑 / 最佳实践
   ## 🔗 官方文档
   （对应官方页面链接）
   ```
3. 代码里**详细中文注释**（对标 ai-learning 项目风格）。

## 四、流程图要求（重点）

- 用 **Mermaid**（markdown 代码块 ```mermaid）。
- 每个模块 README 至少 1 个图；复杂知识点（事件循环、虚拟 DOM diff、组件生命周期、响应式原理、HTTP 请求流程等）必须配图。
- 图类型按内容选：执行流程用 `flowchart TD`，时序/请求用 `sequenceDiagram`，概念关系用 `graph LR`，生命周期用 `stateDiagram-v2`。

## 五、构建方式（CDN/Vite 结合）

- **入门概念模块**：优先 **CDN / 免构建**，浏览器直接打开 `index.html` 即可看效果（HTML/CSS/CSS3/原生 JS/Web API、Vue/React 入门用 CDN）。
- **工程化/进阶模块**（路由、状态管理、构建、SSR、TS 编译、Angular 等）：用官方推荐**脚手架（Vite / Angular CLI / npm）**，README 写清 `npm install && npm run dev`。
- Node 模块：`node xxx.js` 直接运行，需要依赖的写 `package.json`。

## 六、内容语言

- 所有讲解、注释、README 一律**中文**；代码标识符、API 名用英文。
- 必须**对照官方/权威文档**整理，确保知识点不遗漏、不过时（写明文档来源链接）。

## 七、质量底线

- demo 必须**真实可运行**，不是伪代码。
- 宁可少而精，也不要堆砌；每个模块聚焦一个点讲透。
- 工程级 README 要有该栈**完整模块索引表** + **学习路线流程图**。
