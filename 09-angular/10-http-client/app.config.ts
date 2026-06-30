import { ApplicationConfig } from '@angular/core';
// provideHttpClient 是 Angular 15+ 的「函数式」HttpClient 注册方式，
// 替代了旧的 HttpClientModule（NgModule 写法）。
// withFetch() 让底层用浏览器原生 fetch API 取代默认的 XMLHttpRequest，
// 更现代、对 SSR（服务端渲染）更友好。
import { provideHttpClient, withFetch } from '@angular/common/http';

// 应用级别的依赖注入配置。Standalone 应用通过 bootstrapApplication(AppComponent, appConfig) 启动。
export const appConfig: ApplicationConfig = {
  providers: [
    // 注册 HttpClient。只有注册了它，才能在任意组件/Service 里 inject(HttpClient)。
    // 忘记这一行是最常见的坑：会抛 "No provider for HttpClient" 错误。
    provideHttpClient(
      withFetch(), // 使用 fetch 作为传输层
    ),
  ],
};
