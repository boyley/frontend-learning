import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { UserService, User } from './user.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  standalone: true, // Angular 19 默认即为 standalone，可省略，这里显式标注便于学习。
  // 模板里用到 async pipe，必须把 AsyncPipe 导入进来。
  imports: [AsyncPipe],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private readonly userService = inject(UserService);

  // loading 用 signal 管理。signal 是 Angular 的响应式原语，
  // 模板里以 loading() 读取，值变化时自动触发视图更新。
  readonly loading = signal(true);

  // users$ 是一个 Observable（命名约定：流以 $ 结尾）。
  // 注意这里没有 subscribe——订阅交给模板里的 async pipe 完成。
  // finalize 会在流「完成或出错」时执行一次，用来收尾把 loading 置为 false。
  readonly users$: Observable<User[]> = this.userService
    .getUsers()
    .pipe(finalize(() => this.loading.set(false)));
}
