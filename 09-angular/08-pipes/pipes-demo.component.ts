/**
 * pipes-demo.component.ts
 * ------------------------------------------------------------------
 * 一站式演示：内置管道 + 链式管道 + 带参数管道 + 自定义管道 + async 管道。
 *
 * 关键点：
 *  - 内置管道需要从 @angular/common 引入 CommonModule（或具体管道）才能在模板用；
 *  - async 管道会自动「订阅」Observable 并在组件销毁时「自动退订」，省心又防内存泄漏；
 *  - 自定义管道直接 imports TruncatePipe。
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 提供 date/currency/uppercase/json/slice/async 等内置管道
import { interval, map, Observable } from 'rxjs';
import { TruncatePipe } from './truncate.pipe';

@Component({
  selector: 'app-pipes-demo',
  standalone: true,
  imports: [CommonModule, TruncatePipe], // 内置管道 + 自定义管道
  template: `
    <section class="pipes">
      <h3>① 内置管道</h3>
      <!-- 日期格式化，带参数 'yyyy-MM-dd HH:mm:ss' -->
      <p>date：{{ now | date: 'yyyy-MM-dd HH:mm:ss' }}</p>
      <!-- 货币，参数：货币码 / 显示符号 / 小数位 -->
      <p>currency：{{ price | currency: 'CNY':'symbol':'1.2-2' }}</p>
      <!-- 大写 / 小写 -->
      <p>uppercase：{{ name | uppercase }}</p>
      <!-- decimal 数字千分位与小数位：'1.0-2' = 至少1位整数, 0~2位小数 -->
      <p>decimal：{{ pi | number: '1.0-2' }}</p>
      <!-- percent 百分比 -->
      <p>percent：{{ ratio | percent: '1.0-1' }}</p>
      <!-- slice 截取数组/字符串 [start:end] -->
      <p>slice：{{ fruits | slice: 0:2 }}</p>
      <!-- json 调试神器：把对象转成 JSON 字符串 -->
      <pre>json：{{ user | json }}</pre>

      <h3>② 链式管道（依次经过多个管道）</h3>
      <!-- 先小写化后再截断：注意从左到右依次执行 -->
      <p>{{ name | lowercase | truncate: 4:'...' }}</p>

      <h3>③ 自定义管道 truncate（带参数）</h3>
      <p>{{ longText | truncate: 15 }}</p>
      <p>{{ longText | truncate: 8:'~' }}</p>

      <h3>④ async 管道（自动订阅 / 自动退订）</h3>
      <!-- tick$ 是 Observable，async 自动订阅取出最新值，组件销毁时自动退订 -->
      <p>计时器：{{ tick$ | async }} 秒</p>
    </section>
  `,
})
export class PipesDemoComponent {
  now = new Date();
  price = 1299.5;
  name = 'Angular';
  pi = 3.14159;
  ratio = 0.873;
  fruits = ['apple', 'banana', 'cherry', 'date'];
  user = { id: 1, role: 'admin', active: true };
  longText = '这是一段非常非常长需要被截断显示的文本内容示例';

  // 每秒自增的 Observable，配合 async 管道使用（无需手写 subscribe/unsubscribe）
  tick$: Observable<number> = interval(1000).pipe(map((i) => i + 1));
}
