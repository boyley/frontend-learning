import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { authGuard } from './auth.guard';

// Routes 是一个路由配置数组，按「从上到下、先匹配先生效」的顺序解析。
export const routes: Routes = [
  // 普通路由：path 为空字符串表示「根路径 /」，渲染 HomeComponent。
  { path: '', component: HomeComponent, title: '首页' },

  // 参数路由：:id 是路由参数（动态片段）。匹配 /users/1、/users/42 等。
  // 在目标组件里可通过 inject(ActivatedRoute) 读取，或用 withComponentInputBinding 直接作为 @Input。
  {
    path: 'users/:id',
    // 懒加载：loadComponent 返回一个动态 import 的 Promise，
    // 该组件的代码会被打包成单独 chunk，只有访问这条路由时才下载，缩短首屏体积。
    loadComponent: () =>
      import('./user-detail.component').then((m) => m.UserDetailComponent),
    title: '用户详情',
  },

  // 受守卫保护的路由：canActivate 在进入前运行守卫函数，
  // 守卫返回 false（或 UrlTree 重定向）时阻止导航。
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin.component').then((m) => m.AdminComponent),
    title: '管理后台',
  },

  // 懒加载一组子路由：用 loadChildren 整块按需加载（适合功能模块）。
  {
    path: 'settings',
    loadChildren: () => import('./settings.routes').then((m) => m.settingsRoutes),
  },

  // 通配符路由：** 匹配所有「前面都没匹配上」的路径，用于 404 页面。
  // 必须放在数组最后，否则会抢先吃掉后面的路由。
  {
    path: '**',
    loadComponent: () =>
      import('./not-found.component').then((m) => m.NotFoundComponent),
    title: '页面不存在',
  },
];
