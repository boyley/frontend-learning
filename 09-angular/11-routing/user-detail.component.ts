import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>用户详情</h2>
    <!-- id() 直接读取由路由参数绑定来的值 -->
    <p>当前用户 ID：{{ id() }}</p>
    <a routerLink="/">← 返回首页</a>
  `,
})
export class UserDetailComponent {
  // 配合 app.config.ts 的 withComponentInputBinding()，
  // 路由 users/:id 中的 id 会自动绑定到这个 input。
  // 这是现代写法，免去了 inject(ActivatedRoute) + paramMap 订阅。
  readonly id = input.required<string>();
}
