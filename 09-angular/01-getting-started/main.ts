// main.ts —— Angular Standalone 应用的入口文件（程序从这里启动）
// 现代 Angular（v19）默认不再使用 NgModule，而是用 bootstrapApplication 直接引导根组件。

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// bootstrapApplication(根组件, 应用级配置)
// - 第 1 个参数：根组件（整个应用的起点，对应 index.html 里的 <app-root>）
// - 第 2 个参数：appConfig，包含全局 Providers（路由、HttpClient 等依赖注入配置）
bootstrapApplication(AppComponent, appConfig)
  // 引导是异步的，返回 Promise，可在此捕获启动期间的错误
  .catch((err) => console.error('应用启动失败：', err));
