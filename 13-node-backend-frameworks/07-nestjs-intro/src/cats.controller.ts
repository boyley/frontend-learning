// cats.controller.ts —— Controller（控制器）。负责定义路由、接收请求、返回响应。
import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { CatsService, Cat } from './cats.service';

// @Controller('cats') 定义一个「路由前缀」为 /cats 的控制器。
// 里面每个方法用 @Get / @Post 等装饰器绑定到具体的子路径与 HTTP 方法。
@Controller('cats')
export class CatsController {
  // ★ 依赖注入的核心：构造函数里声明需要 CatsService，
  //   Nest 容器会自动 new 好一个 CatsService 实例并传进来（构造函数注入）。
  //   我们从不在这里 new CatsService() —— 这就是「控制反转」。
  //   TypeScript 的 private 修饰符会自动把参数赋成 this.catsService。
  constructor(private readonly catsService: CatsService) {}

  // GET /cats —— 返回全部猫。方法返回的对象会被 Nest 自动序列化成 JSON。
  @Get()
  findAll(): Cat[] {
    return this.catsService.findAll();
  }

  // GET /cats/:id —— @Param('id') 取出路径参数（字符串），转成数字后查询。
  @Get(':id')
  findOne(@Param('id') id: string): Cat {
    const cat = this.catsService.findOne(Number(id));
    if (!cat) {
      // 抛出内置的 HttpException，Nest 会自动返回 404 + 标准错误 JSON
      throw new NotFoundException(`未找到 id=${id} 的猫`);
    }
    return cat;
  }

  // POST /cats —— @Body() 取出请求体（Nest 已内置 body 解析，无需手动 bodyParser）。
  @Post()
  create(@Body() body: { name: string; age: number }): Cat {
    return this.catsService.create(body.name, body.age);
  }
}
