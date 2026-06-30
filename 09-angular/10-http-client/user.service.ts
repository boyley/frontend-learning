import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

// 用户数据的类型定义（来自 jsonplaceholder 这个免费测试 API）。
export interface User {
  id: number;
  name: string;
  email: string;
}

// providedIn: 'root' 表示这是一个全应用单例 Service，
// 任何组件 inject(UserService) 拿到的都是同一个实例，无需手动注册到 providers。
@Injectable({ providedIn: 'root' })
export class UserService {
  // 现代写法：用 inject() 函数注入，而不是构造函数参数注入。
  // 注意：inject() 只能在「注入上下文」中调用（字段初始化、构造函数、factory 内）。
  private readonly http = inject(HttpClient);

  // 测试用的后端 API 地址。
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/users';

  // GET 请求。http.get<User[]>(...) 返回的是 Observable<User[]>（一个「冷流」）。
  // 关键点：Observable 是惰性的——只有被订阅（subscribe）或被 async pipe 消费时，
  // 请求才真正发出。没人订阅 = 不发请求。
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      // catchError 拦截 HTTP 错误（4xx/5xx、网络中断等），
      // 这里降级返回一个空数组 of([])，避免整个流报错中断 UI。
      catchError((err) => {
        console.error('获取用户失败：', err);
        return of([]);
      }),
    );
  }

  // GET 单个用户。路径参数直接拼到 URL 上。
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // POST 新建用户。第二个参数是请求体（body），会被自动序列化为 JSON。
  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // PUT 整体更新。
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // DELETE 删除。
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
