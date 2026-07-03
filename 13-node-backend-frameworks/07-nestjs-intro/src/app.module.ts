// app.module.ts —— 根模块。@Module 是 Nest「模块化架构」的组织单元。
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

// @Module 装饰器用元数据描述「这个模块由哪些部分组成」：
//   - controllers：本模块的控制器（负责接收请求、返回响应）
//   - providers  ：本模块可被注入的服务（@Injectable，业务逻辑放这里）
//   - imports    ：依赖的其它模块（本例无）
//   - exports    ：把本模块的 provider 暴露给别的模块用（本例无）
// Nest 启动时读取这段元数据，构建「依赖注入容器」，自动装配 Controller 与 Provider。
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
