// binding-demo.component.ts —— 完整演示 Angular 四种模板绑定
// 1) 插值 {{}}  2) 属性绑定 [prop]  3) 事件绑定 (event)  4) 双向绑定 [(ngModel)]
// 另含 class/style 绑定。状态全部用 signal 管理。

import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // [(ngModel)] 需要 FormsModule

@Component({
  selector: 'app-binding-demo',
  // 模板里用到了 ngModel，所以必须 import FormsModule
  imports: [FormsModule],
  templateUrl: './binding-demo.component.html',
})
export class BindingDemoComponent {
  // 插值/双向绑定用的文本
  name = signal('Angular');

  // 属性绑定用：控制按钮是否禁用
  disabled = signal(false);

  // class/style 绑定用：是否高亮
  active = signal(false);

  // 一个普通计数，演示事件绑定
  clicks = signal(0);

  // 事件处理：点击时 +1
  onClick(): void {
    this.clicks.update((n) => n + 1);
  }

  // 切换高亮状态（class/style 绑定的开关）
  toggleActive(): void {
    this.active.update((v) => !v);
  }

  // 切换禁用状态
  toggleDisabled(): void {
    this.disabled.update((v) => !v);
  }
}
