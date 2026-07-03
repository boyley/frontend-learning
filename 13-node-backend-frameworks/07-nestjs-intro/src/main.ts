// main.ts —— 应用入口。NestFactory 根据「根模块」创建应用并监听端口。
import 'reflect-metadata'; // Nest 依赖装饰器元数据，必须在最顶部引入一次
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // NestFactory.create(根模块)：Nest 会扫描 AppModule，实例化其中所有
  // Controller 和 Provider，并把 Provider 按构造函数依赖自动注入进去。
  // 默认底层用 platform-express（即 Express），所以 Nest 本质是 Express 之上的架构层。
  const app = await NestFactory.create(AppModule);
  const PORT = 3007;
  await app.listen(PORT);
  console.log(`\nNestJS demo 已启动: http://localhost:${PORT}`);
  console.log('试试:');
  console.log(`  curl http://localhost:${PORT}/cats`);
  console.log(`  curl http://localhost:${PORT}/cats/1`);
  console.log(`  curl -X POST http://localhost:${PORT}/cats -H "Content-Type: application/json" -d '{"name":"咪咪","age":2}'\n`);
}
bootstrap();
