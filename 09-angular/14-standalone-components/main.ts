import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';

import { AppComponent } from './app.component';

/**
 * 应用级配置（等价于旧架构里 AppModule 的 providers）。
 * 在 standalone 架构里，全局服务/路由/HttpClient 等都通过 providers 数组注册。
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // 开启 zone 变更检测的事件合并，提升性能（可选示例）
    provideZoneChangeDetection({ eventCoalescing: true }),
    // 例如：provideRouter(routes), provideHttpClient() 也写在这里
  ],
};

/**
 * 用 bootstrapApplication 启动根组件，取代旧的
 * platformBrowserDynamic().bootstrapModule(AppModule)。
 * 不需要任何 NgModule。
 */
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
