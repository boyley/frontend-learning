# 04 · 新控制流（Built-in Control Flow）
> 用 @if / @for / @switch 内置块语法取代老的 *ngIf / *ngFor / *ngSwitch 结构型指令。

## 📖 知识讲解

Angular 17 引入、并在后续版本稳定的**内置控制流（built-in control flow）**，是写在模板里的块语法，由编译器直接处理，不再依赖 `CommonModule` 里的结构型指令。

| 旧写法（指令）        | 新写法（内置控制流） |
| --------------------- | -------------------- |
| `*ngIf` / `; else`    | `@if` / `@else if` / `@else` |
| `*ngFor` + `trackBy`  | `@for` + `track`（必填） |
| `*ngSwitch`           | `@switch` / `@case` / `@default` |

要点：

- **`@if`**：`@if (cond) { } @else if (cond2) { } @else { }`。还能用 `as` 把异步值取出来：`@if (user(); as u) { {{ u.name }} }`。
- **`@for`**：`@for (item of list; track item.id) { }`。
  - `track` **必须写**——它替代了旧的 `trackBy`，决定 DOM 节点复用策略。
  - 内置上下文变量：`$index`、`$first`、`$last`、`$even`、`$odd`、`$count`，可用 `let i = $index` 取别名。
  - `@empty { }` 块在列表为空时渲染，省掉一个额外的 `@if`。
- **`@switch`**：`@switch (expr) { @case (v) { } @default { } }`，基于全等（`===`）匹配，不会“贯穿”。
- **`@let`**（Angular 18.1+）：声明模板局部只读变量，如 `@let total = users().length;`，避免在模板里重复求值。

优点：更好的类型收窄、不用引入 CommonModule、构建产物更小、运行更快、`track` 强制化避免性能陷阱。

## 🔄 流程图 / 原理图

```mermaid
flowchart TD
  A[模板渲染] --> B{遇到控制流块}
  B -->|@if| C{条件为真?}
  C -->|是| C1[渲染 @if 块]
  C -->|否| C2{有 @else if 命中?}
  C2 -->|是| C3[渲染该 @else if 块]
  C2 -->|否| C4[渲染 @else 块]

  B -->|@switch| D{值匹配哪个 @case?}
  D -->|命中| D1[渲染对应 @case]
  D -->|无命中| D2[渲染 @default]

  B -->|@for| E{列表是否为空?}
  E -->|空| E1[渲染 @empty 块]
  E -->|非空| E2[按 track 标识逐项渲染]
  E2 --> E3[复用/创建/移除 DOM 节点]
```

## 💻 代码说明

**`control-flow.component.ts`**

- 用 `signal()` 创建三组响应式状态：`isLoggedIn`（驱动 `@if`）、`role`（驱动 `@switch`）、`users`（驱动 `@for`）。
- `toggleLogin()` / `cycleRole()` / `clearUsers()` 通过 `set()`/`update()` 改状态，模板自动刷新。
- 组件是 `standalone`，模板拆到独立 `.html` 文件。

**`control-flow.component.html`**

- 第 1 段：`@if (isLoggedIn()) {...} @else {...}` —— 注意读 signal 要加 `()`。
- 第 2 段：`@switch (role())` 配 `@case` / `@default`。
- 第 3 段：`@for (user of users(); track user.id; let i = $index)`，并演示 `$first`/`$even`/`$last` 及 `@empty`。
- 第 4 段：`@let` 声明 `total` 与 `onlineCount`。

**如何在 `ng new` 工程中运行：**

1. 新建工程（默认就是 standalone）：
   ```bash
   ng new control-flow-demo --style=css --routing=false
   cd control-flow-demo
   ```
2. 把 `control-flow.component.ts` 和 `control-flow.component.html` 复制到 `src/app/` 下。
3. 在根组件 `src/app/app.component.ts` 里引入并使用：
   ```ts
   import { Component } from '@angular/core';
   import { ControlFlowComponent } from './control-flow.component';

   @Component({
     selector: 'app-root',
     standalone: true,
     imports: [ControlFlowComponent], // standalone 组件直接放进 imports
     template: `<app-control-flow />`,
   })
   export class AppComponent {}
   ```
4. 启动：`ng serve -o`。

## ▶️ 运行方式

```bash
ng serve -o   # 自动打开 http://localhost:4200
```

点击页面上的按钮，观察 `@if`/`@switch`/`@for` 三段实时切换。

## ⚠️ 常见坑 / 最佳实践

- **`@for` 必须写 `track`**，否则编译报错。优先用稳定唯一键（如 `item.id`）；只有当列表项确实是基础类型且唯一时才可用 `track item` 或 `track $index`。
- **读 signal 要加 `()`**：模板里写 `users()` 而不是 `users`，否则拿到的是函数本身。
- 内置控制流**不需要** `import { CommonModule }`，删掉旧的 `NgIf/NgFor/NgSwitch` 引用。
- 旧 `*ngIf` 对比：`*ngIf="cond; else tpl"` + `<ng-template #tpl>` 写法繁琐，新语法 `@if/@else` 内联更直观。
- 用 `ng generate @angular/core:control-flow` 可一键把旧指令自动迁移成新控制流。
- `@empty` 只能紧跟在 `@for` 之后，不能单独使用。

## 🔗 官方文档（angular.dev）

- 控制流总览：https://angular.dev/guide/templates/control-flow
- `@if`：https://angular.dev/api/core/@if
- `@for`：https://angular.dev/api/core/@for
- `@switch`：https://angular.dev/api/core/@switch
- `@let`：https://angular.dev/guide/templates/let-template-variables
- 从指令迁移：https://angular.dev/reference/migrations/control-flow
