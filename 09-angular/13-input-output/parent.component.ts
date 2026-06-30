import { Component, signal } from '@angular/core';
import { ChildComponent } from './child.component';

/**
 * 父组件：演示如何向子组件传值、接收子组件事件、做双向绑定。
 * 由于是 standalone 组件，必须在 imports 中声明用到的 ChildComponent。
 */
@Component({
  selector: 'app-parent',
  imports: [ChildComponent], // 关键：用到的子组件要在这里导入
  // 模板也可以拆到 parent.component.html，这里内联便于对照
  template: `
    <div class="card">
      <h2>父组件 Parent</h2>

      <!--
        [title]   —— 属性绑定，传入 input()
        [userName]—— 必填 input，必须传
        [(count)] —— 双向绑定 model()，等价于 [count] + (countChange)
        (messageSent) —— 监听子组件 output 事件，$event 是 emit 的载荷
      -->
      <app-child
        [title]="pageTitle()"
        [userName]="'Alice'"
        [(count)]="counter"
        (messageSent)="onMessage($event)"
      />

      <hr />
      <p>父组件里的 counter（被子组件回写）：{{ counter() }}</p>
      <p>收到子组件消息：{{ lastMessage() }}</p>
      <button (click)="counter.set(0)">父组件重置 counter</button>
    </div>
  `,
})
export class ParentComponent {
  /** 传给子组件 title 的数据源 */
  pageTitle = signal('父组件下发的标题');

  /** 与子组件 model() 双向绑定的状态 */
  counter = signal(0);

  /** 存放从子组件 output 收到的最新消息 */
  lastMessage = signal('（暂无）');

  /** output 回调：参数即子组件 emit 出来的值 */
  onMessage(msg: string): void {
    this.lastMessage.set(msg);
  }
}
