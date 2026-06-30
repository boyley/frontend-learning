# 12 · 生命周期钩子（Lifecycle Hooks）
> 组件从创建、变更检测到销毁会依次触发一系列钩子，理解其顺序是写对初始化与清理逻辑的关键。

## 📖 知识讲解

Angular 组件实例从「诞生到销毁」会经历固定阶段，每个阶段对应一个钩子方法。调用顺序：

| 顺序 | 钩子 | 何时调用 | 典型用途 |
| --- | --- | --- | --- |
| 0 | `constructor` | 实例化时 | 依赖注入；**此时 @Input 未就绪** |
| 1 | `ngOnChanges` | 任一 @Input 变化（含首次） | 响应输入变化 |
| 2 | `ngOnInit` | 首次输入就绪后，一次 | **初始化、首屏请求、订阅** |
| 3 | `ngDoCheck` | 每轮变更检测 | 自定义脏检查（高频、慎用） |
| 4 | `ngAfterContentInit` | 投影内容就绪，一次 | 访问 `<ng-content>` |
| 5 | `ngAfterContentChecked` | 每次投影检查后 | — |
| 6 | `ngAfterViewInit` | 视图+子视图就绪，一次 | **访问 @ViewChild / DOM** |
| 7 | `ngAfterViewChecked` | 每次视图检查后 | — |
| 8 | `ngOnDestroy` | 销毁前，一次 | **清理订阅、定时器、监听** |

**现代 Signals 的影响**：用 `signal`/`computed`/`effect` 做响应式后，很多原本要靠 `ngOnChanges`/`ngDoCheck` 手动追踪变化的场景被取代——`computed` 自动重算、`effect` 自动响应。需要操作真实 DOM 的一次性逻辑，推荐用 `afterNextRender()`（仅浏览器、渲染后执行一次，SSR 安全）；需要每次渲染后执行用 `afterRender()`。

## 🔄 流程图 / 原理图

```mermaid
stateDiagram-v2
    [*] --> constructor: 实例化（DI 注入）
    constructor --> ngOnChanges: @Input 首次赋值
    ngOnChanges --> ngOnInit: 初始化（仅一次）
    ngOnInit --> ngDoCheck

    state 变更检测循环 {
        ngDoCheck --> ngAfterContentInit: 首轮
        ngAfterContentInit --> ngAfterContentChecked
        ngAfterContentChecked --> ngAfterViewInit: 首轮
        ngAfterViewInit --> ngAfterViewChecked
        ngAfterViewChecked --> ngDoCheck: 后续每轮（含 ngOnChanges 若输入变化）
    }

    ngAfterViewChecked --> ngOnDestroy: 组件被移除（如 @if 变 false）
    ngOnDestroy --> [*]: 清理资源

    note right of constructor
        afterNextRender:
        DOM 首次渲染后执行一次（仅浏览器）
    end note
```

## 💻 代码说明

**`lifecycle-demo.component.ts`** —— 子组件实现全部钩子，每个里 `console.log` 标注顺序号。`constructor` 里还演示了 `afterNextRender()`。`@Input() label` 变化触发 `ngOnChanges`，点 +1 按钮触发变更检测可见 `ngDoCheck` 高频日志。放到 `src/app/lifecycle-demo.component.ts`。

**`lifecycle-parent.component.ts`** —— 父组件用 `@if (show())` 控制子组件的创建/销毁：点按钮把 `show` 切到 `false` 时，子组件从视图移除，**触发 `ngOnDestroy`**；切回 `true` 则从 `constructor` 重新走一遍。这是观察销毁钩子最直观的方式。放到 `src/app/lifecycle-parent.component.ts`。

## ▶️ 运行方式

```bash
ng new my-app
cd my-app
# 1) 放入两个组件文件到 src/app/
# 2) 在 app.component.html 写 <app-lifecycle-parent />，
#    并在 app.component.ts 的 imports 加入 LifecycleParentComponent
ng serve
# 打开 http://localhost:4200，按 F12 打开控制台
# 观察日志顺序：1.constructor → 2.ngOnChanges → 3.ngOnInit → ...
# 点「销毁子组件」看到 9.ngOnDestroy
```

## ⚠️ 常见坑 / 最佳实践

- **`ngOnInit` vs `constructor`**：初始化逻辑（读 @Input、发请求、订阅）放 `ngOnInit`，因为 `constructor` 阶段输入还是 `undefined`。`constructor` 只做注入。
- **`ngOnDestroy` 必须清理**：取消 RxJS 订阅、`clearInterval/clearTimeout`、移除 `addEventListener`，否则组件销毁后回调仍在跑 = 内存泄漏。现代可用 `takeUntilDestroyed()` 自动退订。
- **`ngDoCheck`/`ngAfterViewChecked` 高频**：每轮变更检测都跑，里面别写重逻辑，更别在其中改状态（易触发 `ExpressionChangedAfterItHasBeenCheckedError`）。
- **别在 `ngOnInit` 访问 `@ViewChild` 的 DOM**：那时视图还没建好，应到 `ngAfterViewInit`。
- **优先 Signals + `afterNextRender`**：能减少对 `ngOnChanges`/`ngDoCheck`/`ngAfterViewInit` 的依赖，代码更声明式、SSR 更安全。

## 🔗 官方文档

- 生命周期总览：https://angular.dev/guide/components/lifecycle
- afterRender / afterNextRender：https://angular.dev/guide/components/lifecycle#afterrender-and-afternextrender
- DestroyRef / takeUntilDestroyed：https://angular.dev/api/core/DestroyRef
- Signals：https://angular.dev/guide/signals
