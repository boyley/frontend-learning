import { Component, signal } from '@angular/core';
import { LifecycleDemoComponent } from './lifecycle-demo.component';

@Component({
  selector: 'app-lifecycle-parent',
  standalone: true,
  imports: [LifecycleDemoComponent],
  template: `
    <h2>父组件：控制子组件的创建与销毁</h2>

    <button (click)="show.set(!show())">
      {{ show() ? '销毁子组件（触发 ngOnDestroy）' : '创建子组件' }}
    </button>

    <label>
      传给子组件的 label：
      <input [value]="label()" (input)="label.set($any($event.target).value)" />
    </label>

    <!--
      @if 控制子组件是否存在于视图中：
      - 从 false 变 true：子组件被创建，依次跑 constructor → ngOnChanges → ngOnInit ...
      - 从 true 变 false：子组件被移除，触发 ngOnDestroy。
      这是观察 ngOnDestroy 最直观的方式——打开控制台看日志顺序。
    -->
    @if (show()) {
      <app-lifecycle-demo [label]="label()" />
    }
  `,
})
export class LifecycleParentComponent {
  // 用 signal 管理状态：show 控制子组件存亡，label 作为输入传下去。
  readonly show = signal(true);
  readonly label = signal('你好');
}
