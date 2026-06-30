import { Component, computed, effect, signal } from '@angular/core';

/**
 * CounterComponent —— Angular Signals 信号响应式核心演示
 *
 * Signals 是 Angular 的细粒度响应式系统：
 *  - signal(v)        创建可写信号，读取用 count()，写入用 set/update
 *  - computed(fn)     从其它信号派生的只读信号，惰性求值 + 自动缓存
 *  - effect(fn)       依赖变化时自动重跑的副作用（如打印日志、同步存储）
 *
 * 关键机制：读取一个 signal 会被自动“依赖追踪”。当它的值改变，
 * 依赖它的 computed 会被标记为脏（下次读取时重算），依赖它的 effect
 * 会被调度重跑。Angular 据此做细粒度变更检测，无需手动 markForCheck。
 */
@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <section>
      <h3>Signals 计数器</h3>

      <!-- 模板里读 signal/computed 都要加 () -->
      <p>count = {{ count() }}</p>
      <p>doubleCount（派生）= {{ doubleCount() }}</p>
      <p>奇偶（派生）= {{ parity() }}</p>

      <button (click)="decrement()">－1</button>
      <button (click)="increment()">＋1</button>
      <button (click)="reset()">重置</button>
    </section>
  `,
})
export class CounterComponent {
  /** 可写信号：计数值，初始 0 */
  readonly count = signal(0);

  /**
   * 派生信号：count 的两倍。
   * computed 惰性求值——只有被读取时才计算；
   * 且会缓存，只要 count 不变，多次读取不重算。
   */
  readonly doubleCount = computed(() => this.count() * 2);

  /** 再派生一个：奇偶判断，演示 computed 可层层依赖 */
  readonly parity = computed(() => (this.count() % 2 === 0 ? '偶数' : '奇数'));

  constructor() {
    /**
     * effect：副作用。首次会立即执行一次以建立依赖，
     * 之后只要它读取过的任一信号（这里是 count / doubleCount）变化，就重跑。
     * effect 必须在注入上下文中创建（构造函数里即可）。
     */
    effect(() => {
      console.log(`[effect] count=${this.count()}, double=${this.doubleCount()}`);
    });
  }

  /** update：基于旧值计算新值 */
  increment(): void {
    this.count.update((n) => n + 1);
  }

  decrement(): void {
    this.count.update((n) => n - 1);
  }

  /** set：直接设置新值 */
  reset(): void {
    this.count.set(0);
  }
}
