import { Component, signal } from '@angular/core';
import { HighlightDirective } from './highlight.directive';

/**
 * DirectivesDemoComponent —— 演示三类指令的使用
 *
 * 1. 组件（Component）：本身就是带模板的特殊指令。
 * 2. 属性型指令（Attribute Directive）：
 *      - 内置 ngClass / ngStyle（需要 CommonModule）
 *      - 自定义 appHighlight（鼠标悬停高亮）
 * 3. 结构型指令（Structural Directive）：
 *      - 旧：*ngIf / *ngFor（需 CommonModule）
 *      - 新：内置控制流 @if / @for（推荐，无需引入）
 *
 * 注意：要使用内置的 ngClass/ngStyle 属性指令，需要在 imports 引入 CommonModule。
 * 而自定义指令则把 HighlightDirective 直接放进 imports（standalone 写法）。
 */
@Component({
  selector: 'app-directives-demo',
  standalone: true,
  imports: [HighlightDirective], // 引入自定义属性指令；内置控制流无需引入
  templateUrl: './directives-demo.component.html',
})
export class DirectivesDemoComponent {
  /** 控制 ngClass 切换的开关 */
  readonly active = signal(true);

  /** 演示 @for 的列表 */
  readonly fruits = signal(['🍎 苹果', '🍌 香蕉', '🍊 橙子']);

  toggle(): void {
    this.active.update((v) => !v);
  }
}
