/**
 * counter.component.ts
 * ------------------------------------------------------------------
 * 演示在组件里「注入并使用服务」的两种方式：
 *   1. 现代 inject() 函数（推荐）
 *   2. 构造函数注入（传统、依然有效）
 *
 * 注意：两个服务都是 providedIn:'root'，所以本组件拿到的是全应用单例。
 * 如果在别的组件也注入 CounterService，count 会是同一份共享状态。
 */
import { Component, inject } from '@angular/core';
import { CounterService } from './counter.service';
import { LoggerService } from './logger.service';

@Component({
  selector: 'app-counter',
  standalone: true, // Angular 19 默认即 standalone，可省略，这里显式写出强调
  template: `
    <section class="counter">
      <h3>共享计数器（来自 CounterService 单例）</h3>

      <!-- 模板里直接调用 signal：counter.count() 读取当前值 -->
      <p>当前值：{{ counter.count() }}</p>
      <p>翻倍：{{ counter.doubled() }}</p>
      <p>奇偶：{{ counter.isEven() ? '偶数' : '奇数' }}</p>

      <button (click)="onIncrement()">+1</button>
      <button (click)="counter.decrement()">-1</button>
      <button (click)="counter.reset()">重置</button>

      <h4>日志历史</h4>
      <!-- 新控制流 @for 遍历日志（替代 *ngFor） -->
      <ul>
        @for (line of logger.getHistory(); track $index) {
          <li>{{ line }}</li>
        } @empty {
          <li>暂无日志</li>
        }
      </ul>
    </section>
  `,
})
export class CounterComponent {
  // ✅ 方式一：inject() 函数注入（推荐）
  //    - 写法简洁，无需构造函数；可在字段初始化、函数中调用；
  //    - 配合 readonly，类型自动推断。
  readonly counter = inject(CounterService);
  readonly logger = inject(LoggerService);

  // ✅ 方式二：构造函数注入（对比演示，下面注释掉以免重复注入）
  //    constructor(private counter: CounterService, private logger: LoggerService) {}
  //    两种方式拿到的是同一个 root 单例，效果完全一致。

  onIncrement(): void {
    this.counter.increment();
    // 用注入进来的 logger 记录一条日志，体现「服务之间/组件与服务协作」
    this.logger.log(`计数器自增 → ${this.counter.count()}`);
  }
}
