// card.component.ts —— 演示「templateUrl + styleUrl」拆分文件的组件
// 模板较大或样式较多时，推荐把 HTML/CSS 拆成独立文件，便于维护和高亮。

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',

  // templateUrl：指向外部 HTML 文件（相对当前 .ts 路径）
  templateUrl: './card.component.html',

  // styleUrl：指向外部 CSS 文件（单个文件用 styleUrl，多个用 styleUrls 数组）
  styleUrl: './card.component.css',
})
export class CardComponent {
  // input()：函数式输入属性，父组件通过 <app-card [title]="..."> 传值。
  // 这里给了默认值，父组件不传时使用默认值。
  title = input<string>('默认标题');
  body = input<string>('这是卡片内容。');
}
