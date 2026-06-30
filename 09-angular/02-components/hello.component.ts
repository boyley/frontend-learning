// hello.component.ts —— 演示「inline template + signal 计数」的最小组件
// 用 inline template（把模板写在装饰器里）适合短小的组件。

import { Component, signal } from '@angular/core';

@Component({
  // selector：在别的模板里写 <app-hello></app-hello> 即可使用本组件
  selector: 'app-hello',

  // inline template：模板字符串直接写在这里
  // 新控制流可直接在模板用 @if/@for；这里用 {{}} 插值与 (click) 事件绑定
  template: `
    <section>
      <h2>Hello Component 👋</h2>
      <p>当前计数：{{ count() }}</p>
      <button (click)="increment()">+1</button>
      <button (click)="reset()">重置</button>
    </section>
  `,

  // inline styles：样式也可写在数组里
  styles: [`
    section { padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
    button { margin-right: 8px; }
  `],
})
export class HelloComponent {
  // signal：响应式计数状态。读 count()，写 count.set()/count.update()
  count = signal(0);

  // 事件处理：用 update() 基于旧值算新值
  increment(): void {
    this.count.update((n) => n + 1);
  }

  reset(): void {
    this.count.set(0);
  }
}
