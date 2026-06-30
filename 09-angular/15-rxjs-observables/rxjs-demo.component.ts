import { Component, OnInit, OnDestroy, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import {
  of,
  from,
  interval,
  BehaviorSubject,
  Observable,
  Subscription,
} from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

/**
 * RxJS 入门演示组件。
 * 展示：of/from/interval 创建流、pipe(map/filter/take) 操作符管道、
 *       async pipe 自动订阅退订、BehaviorSubject 状态、toSignal 与信号互通。
 */
@Component({
  selector: 'app-rxjs-demo',
  imports: [AsyncPipe], // 模板里用 | async 需要导入 AsyncPipe
  template: `
    <div class="card">
      <h2>RxJS Observables 演示</h2>

      <!--
        async pipe：自动 subscribe 取值，并在组件销毁时自动 unsubscribe，
        是 Angular 中订阅 Observable 的首选方式（不会内存泄漏）。
      -->
      <p>interval 计时（async pipe，自动退订）：{{ timer$ | async }}</p>

      <!-- BehaviorSubject 当前值，同样用 async pipe 订阅 -->
      <p>计数状态（BehaviorSubject）：{{ count$ | async }}</p>
      <button (click)="increment()">+1</button>

      <!-- toSignal 把 Observable 变成信号，模板里像普通信号一样读取 -->
      <p>同一计数（toSignal 信号）：{{ countSignal() }}</p>

      <hr />
      <p>手动订阅 of/from 的结果（见控制台）：{{ manualResult() }}</p>
    </div>
  `,
})
export class RxjsDemoComponent implements OnInit, OnDestroy {
  /** 注入 DestroyRef，配合 takeUntilDestroyed 做自动退订 */
  private destroyRef = inject(DestroyRef);

  /** 手动订阅的 Subscription，演示 OnDestroy 里手动退订 */
  private sub?: Subscription;

  /**
   * 冷流：interval 每秒发一个递增数字。
   * 冷流是惰性的——只有被订阅（这里通过 async pipe）才开始执行。
   */
  timer$: Observable<number> = interval(1000);

  /**
   * BehaviorSubject：带"当前值"的多播 Subject（热流）。
   * 订阅时立即收到最新值，常用于组件/服务的状态管理。
   */
  private countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable(); // 对外暴露只读 Observable

  /**
   * toSignal：把 Observable 转成只读信号，便于与模板/computed 协作。
   * 组件销毁时自动退订（基于注入上下文）。
   */
  countSignal = toSignal(this.count$, { initialValue: 0 });

  /** 存放手动订阅的最终结果，便于模板展示 */
  manualResult = signal<string>('');

  /** BehaviorSubject 通过 next 推送新值 */
  increment(): void {
    this.countSubject.next(this.countSubject.value + 1);
  }

  ngOnInit(): void {
    // 1) of：把若干值依次发出
    of(1, 2, 3, 4, 5)
      .pipe(
        map((n) => n * 10), // 操作符：每个值乘 10
        filter((n) => n > 20), // 操作符：只保留 > 20 的
        take(2), // 操作符：取前 2 个后自动完成
      )
      .subscribe((v) => console.log('[of 管道] 收到：', v)); // 30, 40

    // 2) from：把数组/Promise/可迭代对象转成 Observable
    const results: number[] = [];
    from([10, 20, 30])
      .pipe(map((n) => n + 1))
      .subscribe({
        next: (v) => results.push(v),
        complete: () => this.manualResult.set(results.join(', ')), // 11, 21, 31
      });

    // 3) 手动订阅 interval，用 takeUntilDestroyed 自动退订（推荐）
    interval(2000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => console.log('[interval 自动退订] 第', v, '次'));

    // 4) 传统手动订阅，需要在 ngOnDestroy 里手动退订（对照用）
    this.sub = interval(3000).subscribe((v) =>
      console.log('[interval 手动退订] 第', v, '次'),
    );
  }

  ngOnDestroy(): void {
    // 手动订阅必须手动退订，否则组件销毁后流仍在跑 -> 内存泄漏
    this.sub?.unsubscribe();
  }
}
