import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// CanActivateFn 是「函数式守卫」类型（v15+），替代旧的 CanActivate 类守卫。
// 守卫在路由激活前运行，返回值含义：
//   true        -> 允许进入
//   false       -> 阻止进入（停留原地）
//   UrlTree     -> 重定向到另一条路由
// 守卫函数运行在注入上下文中，因此可以直接用 inject() 拿依赖。
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 这里用 localStorage 模拟「是否已登录」。真实项目应注入 AuthService 判断。
  const isLoggedIn = !!localStorage.getItem('token');

  if (isLoggedIn) {
    return true;
  }

  // 未登录：重定向到登录页，并把当前想去的地址记到 returnUrl，登录后可跳回。
  return router.createUrlTree(['/'], {
    queryParams: { returnUrl: state.url },
  });
};
