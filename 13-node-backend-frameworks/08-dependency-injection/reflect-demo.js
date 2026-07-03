// reflect-demo.js —— 【可选加餐】reflect-metadata 如何让框架「自动」读出依赖类型
// 运行前需先安装：npm install   （会装 reflect-metadata）
// 然后：node reflect-demo.js
// ============================================================================
// 前面的 demo.js 里，我们要手动写 deps: ['Logger', 'UserRepository'] 告诉容器依赖谁。
// 而 Nest / Angular / Spring 里我们只写：
//     constructor(private logger: Logger, private repo: UserRepository) {}
// 框架就「自动」知道要注入 Logger 和 UserRepository。它是怎么知道的？
//
// 答案：TypeScript 打开 emitDecoratorMetadata 后，编译器会把构造函数参数的「类型」
// 通过 reflect-metadata 写进一段元数据（key 为 'design:paramtypes'）。框架在运行时
// 用 Reflect.getMetadata('design:paramtypes', TargetClass) 把这些类型读出来，
// 于是不用手写 deps 也能拿到依赖列表。
//
// 本文件用「手动写入元数据」的方式模拟 TS 编译器的产物，让你在纯 JS 下也能看清原理。
// ============================================================================

require('reflect-metadata'); // 给全局装上 Reflect.getMetadata / defineMetadata 等 API

class Logger {
  info(msg) { console.log(`[LOG] ${msg}`); }
}
class UserRepository {
  constructor(logger) { this.logger = logger; }
  findById(id) { this.logger.info(`查询用户 ${id}`); return { id, name: '王五' }; }
}
class UserService {
  constructor(logger, userRepository) {
    this.logger = logger;
    this.userRepository = userRepository;
  }
  getUserName(id) { return this.userRepository.findById(id).name; }
}

// —— 模拟 TS 编译器：把每个类构造函数参数的「类型」写入 design:paramtypes 元数据 ——
// 真实项目里这一步由 tsc 自动生成，你只管写 TS 类型标注即可。
Reflect.defineMetadata('design:paramtypes', [], Logger);
Reflect.defineMetadata('design:paramtypes', [Logger], UserRepository);
Reflect.defineMetadata('design:paramtypes', [Logger, UserRepository], UserService);

// —— 一个「会自动读类型」的容器：不需要手写 deps，直接从元数据推断 ——
class ReflectiveContainer {
  constructor() { this.singletons = new Map(); }
  resolve(TargetClass) {
    if (this.singletons.has(TargetClass)) return this.singletons.get(TargetClass);
    // 关键：读取构造函数参数类型列表（就是依赖列表），无需人工声明 deps
    const paramTypes = Reflect.getMetadata('design:paramtypes', TargetClass) || [];
    console.log(`解析 ${TargetClass.name}，读到依赖类型：[${paramTypes.map((t) => t.name).join(', ')}]`);
    // 递归解析每个依赖类型
    const deps = paramTypes.map((Dep) => this.resolve(Dep));
    const instance = new TargetClass(...deps);
    this.singletons.set(TargetClass, instance);
    return instance;
  }
}

const container = new ReflectiveContainer();
const userService = container.resolve(UserService); // 只传目标类，依赖全自动
console.log('\n结果：', userService.getUserName(7));
console.log('依赖被自动注入？', userService.logger instanceof Logger && userService.userRepository instanceof UserRepository);
