import { Component, input, output, model } from '@angular/core';

/**
 * 子组件：演示 Angular 19 现代组件通信三件套
 * 1. input()         —— 信号输入，替代 @Input()
 * 2. output()        —— 事件输出，替代 @Output() + EventEmitter
 * 3. model()         —— 双向绑定，配合父组件 [(prop)] 使用
 */
@Component({
  selector: 'app-child',
  // standalone 在 Angular 19 默认即为 true，无需显式声明
  template: `
    <div class="card">
      <h3>子组件 Child</h3>

      <!-- input 返回的是 signal，模板里读取必须加 () 调用 -->
      <p>父组件传入的标题：{{ title() }}</p>
      <p>必填用户名：{{ userName() }}</p>

      <!-- model() 同样是 signal，读取要 ()；写入用 .set() 触发双向更新 -->
      <p>计数（双向）：{{ count() }}</p>
      <button (click)="increment()">子组件 +1（回写父组件）</button>

      <hr />

      <!-- 点击时通过 output emit 把数据向上传给父组件 -->
      <button (click)="notifyParent()">向父组件发送消息</button>
    </div>
  `,
})
export class ChildComponent {
  /**
   * 可选输入：父组件 [title]="..." 传入。
   * 第一个参数是默认值，父组件不传时使用。
   * 返回类型是 InputSignal<string>，是只读信号。
   */
  title = input<string>('默认标题');

  /**
   * 必填输入：父组件必须提供 [userName]，否则编译/运行报错。
   * 注意 required 输入没有默认值。
   */
  userName = input.required<string>();

  /**
   * 双向绑定模型：父组件用 [(count)]="..." 绑定。
   * model() 既能被父组件读，也能被子组件写回（自动同步）。
   */
  count = model<number>(0);

  /**
   * 事件输出：父组件用 (messageSent)="..." 监听。
   * output() 返回 OutputEmitterRef，用 .emit(payload) 发送。
   */
  messageSent = output<string>();

  /** 子组件内部修改 model，会自动同步回父组件 */
  increment(): void {
    // model 是可写信号，用 update 基于旧值计算新值
    this.count.update((v) => v + 1);
  }

  /** 通过 output 向父组件发送一条消息 */
  notifyParent(): void {
    this.messageSent.emit(`来自子组件的问候 @ ${new Date().toLocaleTimeString()}`);
  }
}
