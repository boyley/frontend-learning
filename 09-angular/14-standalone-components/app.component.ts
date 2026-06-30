import { Component } from '@angular/core';
import { UpperCasePipe } from '@angular/common';

import { GreetingComponent } from './greeting.component';

/**
 * 根组件：standalone 组件自己声明依赖。
 * Angular 19 起 standalone 默认 true，无需写 standalone: true，也无需 NgModule。
 */
@Component({
  selector: 'app-root',
  // 关键：组件用到的「另一个组件 / 指令 / 管道」都要在 imports 自包含声明
  imports: [GreetingComponent, UpperCasePipe],
  template: `
    <h1>Standalone 架构演示</h1>

    <!-- 使用导入的子组件 -->
    <app-greeting name="Angular 19" />

    <!-- 使用导入的内置管道 UpperCasePipe；没 import 就会编译报错 -->
    <p>大写管道：{{ framework | uppercase }}</p>
  `,
})
export class AppComponent {
  framework = 'standalone components';
}
