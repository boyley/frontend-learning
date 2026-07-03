// cats.service.ts —— Provider（提供者）。@Injectable 标记它可被容器管理并注入。
import { Injectable } from '@nestjs/common';

// 一条「猫」数据的类型
export interface Cat {
  id: number;
  name: string;
  age: number;
}

// @Injectable() 告诉 Nest：这是一个 provider，可以被注入到别的地方（如控制器）。
// 业务逻辑（这里是对猫数据的增删查）都写在 Service 里，Controller 只管转发请求。
// 这样「路由层」和「业务层」分离，Service 可单独测试、可被多个 Controller 复用。
@Injectable()
export class CatsService {
  // 用内存数组模拟数据库
  private readonly cats: Cat[] = [
    { id: 1, name: '大橘', age: 3 },
    { id: 2, name: '奶牛', age: 1 },
  ];
  private nextId = 3;

  findAll(): Cat[] {
    return this.cats;
  }

  findOne(id: number): Cat | undefined {
    return this.cats.find((c) => c.id === id);
  }

  create(name: string, age: number): Cat {
    const cat: Cat = { id: this.nextId++, name, age };
    this.cats.push(cat);
    return cat;
  }
}
