import { Component, signal } from '@angular/core';

/**
 * 用户接口：演示 @for 列表渲染的数据结构
 */
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user' | 'guest';
  online: boolean;
}

/**
 * ControlFlowComponent —— 演示 Angular 17+ 内置控制流
 *
 * 现代 Angular 推荐用 @if / @for / @switch 取代旧的结构型指令
 * （*ngIf / *ngFor / *ngSwitch）。内置控制流是编译器级语法，
 * 无需在 imports 里引入 CommonModule，性能更好、类型更友好。
 *
 * 本组件是 Standalone 组件（Angular 默认），模板放在独立的
 * control-flow.component.html 中。
 */
@Component({
  selector: 'app-control-flow',
  standalone: true, // Angular 19 默认即为 standalone，写出来更直观
  templateUrl: './control-flow.component.html',
})
export class ControlFlowComponent {
  /** 登录状态：驱动 @if / @else 分支 */
  readonly isLoggedIn = signal(false);

  /** 当前用户角色：驱动 @switch 多分支 */
  readonly role = signal<'admin' | 'user' | 'guest'>('guest');

  /** 用户列表：驱动 @for 列表渲染（含 @empty 空列表块） */
  readonly users = signal<User[]>([
    { id: 1, name: '张三', role: 'admin', online: true },
    { id: 2, name: '李四', role: 'user', online: false },
    { id: 3, name: '王五', role: 'guest', online: true },
  ]);

  /** 切换登录状态 */
  toggleLogin(): void {
    this.isLoggedIn.update((v) => !v);
  }

  /** 在三种角色之间循环切换，便于演示 @switch */
  cycleRole(): void {
    const order: Array<'admin' | 'user' | 'guest'> = ['admin', 'user', 'guest'];
    const next = (order.indexOf(this.role()) + 1) % order.length;
    this.role.set(order[next]);
  }

  /** 清空列表，触发 @empty 块 */
  clearUsers(): void {
    this.users.set([]);
  }
}
