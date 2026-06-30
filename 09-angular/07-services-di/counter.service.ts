/**
 * counter.service.ts
 * ------------------------------------------------------------------
 * 一个「有状态服务」：用 Signal 保存可被多个组件共享的计数状态。
 *
 * 为什么用服务存状态？
 *  - 组件销毁后状态会丢失；服务（root 单例）在整个应用生命周期内存活；
 *  - 任意组件 inject() 同一个服务，读到的是同一份 signal，天然实现「跨组件共享状态」。
 *
 * 为什么用 Signal？
 *  - signal() 是 Angular 的细粒度响应式原语，读写都很直观；
 *  - 模板里直接 count() 调用即可读取，值变化时只更新依赖它的视图。
 */
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CounterService {
  // 私有可写 signal：内部状态，外部不能直接 set
  private readonly _count = signal(0);

  // 对外暴露只读视图：组件只能读，不能乱改（封装）
  readonly count = this._count.asReadonly();

  // 派生状态：基于 count 自动计算，count 变它就变
  readonly doubled = computed(() => this._count() * 2);
  readonly isEven = computed(() => this._count() % 2 === 0);

  /** 加一：update 接收旧值返回新值 */
  increment(): void {
    this._count.update((n) => n + 1);
  }

  /** 减一 */
  decrement(): void {
    this._count.update((n) => n - 1);
  }

  /** 重置为 0：set 直接设置新值 */
  reset(): void {
    this._count.set(0);
  }
}
