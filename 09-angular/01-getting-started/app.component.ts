// app.component.ts —— 根组件（Standalone 组件，应用的第一个 UI 单元）
// standalone 组件自带 imports，不依赖任何 NgModule，可独立使用。

import { Component, signal } from '@angular/core';

@Component({
  // selector：该组件在 HTML 中的标签名。根组件通常对应 index.html 里的 <app-root>
  selector: 'app-root',

  // standalone 组件需要用到的其它组件/指令/管道，都在 imports 里声明。
  // 这里最小骨架不引入任何东西，所以为空数组。
  imports: [],

  // inline template：直接把模板写在这里（小组件常用）
  template: `
    <h1>欢迎来到 {{ title() }} 🚀</h1>
    <p>这是一个最小的 Angular Standalone 应用骨架。</p>
  `,
})
export class AppComponent {
  // signal()：现代 Angular 的响应式状态。读取用 title()，更新用 title.set(...)
  // 模板里写 {{ title() }} 时会自动建立依赖，值变化时视图自动刷新。
  title = signal('frontend-learning · Angular');
}
