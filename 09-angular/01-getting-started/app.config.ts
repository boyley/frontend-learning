// app.config.ts —— 应用级配置（全局依赖注入 Providers 集中地）
// 取代了旧版 AppModule 里的 imports/providers，专门放“全应用共享”的服务配置。

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

// ApplicationConfig 是一个普通对象，其 providers 数组里放各类 provideXxx() 函数。
// 例如真实项目中常见：
//   provideRouter(routes)       —— 配置路由
//   provideHttpClient()         —— 启用 HttpClient
//   provideAnimationsAsync()    —— 启用动画
export const appConfig: ApplicationConfig = {
  providers: [
    // 优化变更检测：合并同一事件循环内的多次变更，减少不必要的渲染
    provideZoneChangeDetection({ eventCoalescing: true }),
    // 在这里继续追加全局 provider，例如：
    // provideRouter(routes),
    // provideHttpClient(),
  ],
};
