// demo.js —— 用手写的 DI 容器演示「依赖被自动注入」
// 运行：node demo.js
// ============================================================================
// 场景：UserService 需要 Logger（日志）和 UserRepository（数据访问）两个依赖，
//       而 UserRepository 自己又需要 Logger。我们不在任何类里手动 new 依赖，
//       全部交给容器：只声明「谁依赖谁」，容器负责递归造好并注入。
// ============================================================================

const { Container } = require('./container');

// ── 1) Logger：最底层服务，不依赖任何东西 ──
class Logger {
  info(msg) {
    console.log(`[LOG] ${msg}`);
  }
}

// ── 2) UserRepository：数据访问层，依赖 Logger ──
//    注意构造函数第一个参数就是 logger —— 它由容器注入，本类绝不自己 new Logger
class UserRepository {
  constructor(logger) {
    this.logger = logger;
    // 假装这是数据库里的数据
    this._db = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
    ];
  }
  findById(id) {
    this.logger.info(`UserRepository.findById(${id}) 查询数据库`);
    return this._db.find((u) => u.id === id) || null;
  }
}

// ── 3) UserService：业务层，依赖 Logger + UserRepository ──
//    构造函数按顺序声明依赖，两个都由容器注入
class UserService {
  constructor(logger, userRepository) {
    this.logger = logger;
    this.userRepository = userRepository;
  }
  getUserName(id) {
    this.logger.info(`UserService.getUserName(${id}) 开始处理`);
    const user = this.userRepository.findById(id);
    if (!user) {
      this.logger.info(`未找到 id=${id} 的用户`);
      return null;
    }
    this.logger.info(`找到用户：${user.name}`);
    return user.name;
  }
}

// ── 4) 组装：向容器注册每个服务，并声明它的依赖（deps 按构造函数参数顺序）──
const container = new Container();
container
  .register('Logger', { useClass: Logger }) // Logger 无依赖
  .register('UserRepository', {
    useClass: UserRepository,
    deps: ['Logger'], // 构造函数参数：logger
  })
  .register('UserService', {
    useClass: UserService,
    deps: ['Logger', 'UserRepository'], // 构造函数参数：logger, userRepository
  });

// ── 5) 从容器解析出 UserService。容器会自动：
//        resolve('UserService')
//          → 需要 Logger        → resolve('Logger')        造出 logger
//          → 需要 UserRepository → resolve('UserRepository')
//                                    → 又需要 Logger（命中单例缓存，复用同一个）
//                                    → new UserRepository(logger)
//          → new UserService(logger, userRepository)
const userService = container.resolve('UserService');

console.log('===== 调用 userService.getUserName(1) =====');
const name = userService.getUserName(1);
console.log('返回结果：', name);

console.log('\n===== 验证「依赖确实被注入」=====');
console.log('userService.logger 是 Logger 实例吗？        ', userService.logger instanceof Logger);
console.log('userService.userRepository 是 Repo 实例吗？   ', userService.userRepository instanceof UserRepository);

console.log('\n===== 验证「单例」：两处的 Logger 是同一个对象吗？=====');
// UserService 拿到的 logger 和 UserRepository 内部的 logger 应该是同一个实例
console.log('同一个 Logger 实例？', userService.logger === userService.userRepository.logger);
console.log('再 resolve 一次 UserService 是同一个吗？', container.resolve('UserService') === userService);

console.log('\n===== 演示「可替换」：换成 useValue 注入一个假的 Logger（便于测试）=====');
const c2 = new Container();
const fakeLogger = { logs: [], info(msg) { this.logs.push(msg); } }; // 一个记录日志到数组的假 Logger
c2.register('Logger', { useValue: fakeLogger }) // 用 useValue 直接注册现成对象
  .register('UserRepository', { useClass: UserRepository, deps: ['Logger'] })
  .register('UserService', { useClass: UserService, deps: ['Logger', 'UserRepository'] });
const svc2 = c2.resolve('UserService');
svc2.getUserName(2);
console.log('假 Logger 捕获到的日志条数：', fakeLogger.logs.length);
console.log('捕获的日志：', fakeLogger.logs);
