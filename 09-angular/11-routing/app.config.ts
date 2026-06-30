import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideRouter 注册路由系统，取代旧的 RouterModule.forRoot(routes)。
    provideRouter(
      routes,
      // withComponentInputBinding：让路由参数 / query / data 自动绑定到组件的同名 @Input()。
      // 例如路由 users/:id，组件里写 id = input.required<string>() 即可直接拿到，无需 ActivatedRoute。
      withComponentInputBinding(),
      // withViewTransitions：开启浏览器原生 View Transitions API，导航切换带平滑过渡动画。
      withViewTransitions(),
    ),
  ],
};
