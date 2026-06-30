import { Component, input } from '@angular/core';

/**
 * 一个自包含的 standalone 子组件。
 * 它不属于任何 NgModule，可被任意组件直接 import 使用，
 * 也天然支持懒加载（loadComponent）。
 */
@Component({
  selector: 'app-greeting',
  // 本组件不依赖其它组件/管道，因此 imports 可省略
  template: `
    <section class="greeting">
      <p>你好，{{ name() }}！这是一个独立组件。</p>
    </section>
  `,
})
export class GreetingComponent {
  /** 信号输入：父组件通过 [name] / name 传入 */
  name = input<string>('世界');
}
