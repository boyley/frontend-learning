import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * HighlightDirective —— 自定义属性型指令（Attribute Directive）
 *
 * 属性型指令通过 selector（这里是 [appHighlight]）附着到宿主元素上，
 * 改变其外观或行为，但不创建/销毁 DOM（那是结构型指令的活）。
 *
 * 现代写法要点：
 *  - 用 inject(ElementRef) 拿到宿主元素引用（替代构造函数注入）。
 *  - 用 input() 声明可配置输入（Signal Input，Angular 17.1+）。
 *  - 用 @Directive 的 host 字段声明事件监听与属性绑定，
 *    替代旧的 @HostListener / @HostBinding 装饰器。
 */
@Directive({
  selector: '[appHighlight]', // 用作属性使用：<p appHighlight>
  standalone: true,
  host: {
    // 在宿主元素上监听鼠标进入/离开事件，调用对应方法
    '(mouseenter)': 'onEnter()',
    '(mouseleave)': 'onLeave()',
    // 默认加一个过渡，让背景色变化更平滑
    '[style.transition]': '"background-color .2s"',
    '[style.cursor]': '"pointer"',
  },
})
export class HighlightDirective {
  /** 宿主元素引用：用 inject() 注入，泛型指明是 HTMLElement */
  private readonly el = inject(ElementRef<HTMLElement>);

  /**
   * 高亮颜色，可在模板里配置：
   * <p [appHighlight]="'gold'"> 或 <p appHighlight color="gold">
   * 这里用别名让属性名更语义化，默认值 'yellow'。
   */
  readonly color = input('yellow', { alias: 'appHighlight' });

  /** 鼠标移入：设置背景色为配置的颜色 */
  onEnter(): void {
    this.setBackground(this.color());
  }

  /** 鼠标移出：清空背景色 */
  onLeave(): void {
    this.setBackground('');
  }

  /** 统一修改宿主元素背景色的工具方法 */
  private setBackground(value: string): void {
    this.el.nativeElement.style.backgroundColor = value;
  }
}
