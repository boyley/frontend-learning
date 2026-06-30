/**
 * logger.service.ts
 * ------------------------------------------------------------------
 * 一个最简单的「无状态服务」：把日志逻辑封装起来，供整个应用复用。
 *
 * @Injectable({ providedIn: 'root' }) 是现代 Angular 注册服务的标准方式：
 *  - 'root' 表示把这个服务注册到「根注入器（root injector）」上；
 *  - 整个应用共享同一个实例（单例 singleton）；
 *  - 支持 tree-shaking：如果没有任何地方注入它，打包时会被自动移除。
 */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // 注册到根注入器 → 全应用单例
})
export class LoggerService {
  // 内部维护一份日志历史，演示「服务可以持有状态」
  private readonly history: string[] = [];

  /** 记录一条普通日志 */
  log(message: string): void {
    const line = `[LOG ${this.now()}] ${message}`;
    this.history.push(line);
    // 真实项目里这里可能上报到后端，这里仅打印到控制台
    console.log(line);
  }

  /** 记录一条错误日志 */
  error(message: string): void {
    const line = `[ERR ${this.now()}] ${message}`;
    this.history.push(line);
    console.error(line);
  }

  /** 返回日志副本，避免外部直接修改内部数组 */
  getHistory(): readonly string[] {
    return [...this.history];
  }

  /** 当前时间字符串（私有辅助方法） */
  private now(): string {
    return new Date().toLocaleTimeString();
  }
}
