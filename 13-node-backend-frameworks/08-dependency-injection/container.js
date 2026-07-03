// 08-dependency-injection —— 手写一个极简 DI（依赖注入）容器
// ============================================================================
// 什么是「控制反转 / IoC（Inversion of Control）」？
//   传统写法里，一个对象要用到别的对象时，自己在内部 new 出来：
//       class UserService {
//         constructor() {
//           this.logger = new Logger();        // ← 自己 new，硬编码依赖
//           this.repo   = new UserRepository(); // ← 换实现要改源码，难测试
//         }
//       }
//   「控制反转」指的是：把「创建依赖」这件事的控制权，从对象自己手里，
//   反转交给外部的「容器」。对象不再自己 new 依赖，而是「声明我需要什么」，
//   由容器负责创建好、并「注入」进来。这就是「依赖注入 / DI」。
//
//   一句话：IoC 是思想（谁来控制对象的创建与装配），DI 是它的一种实现手段
//   （通过注入的方式把依赖送进来）。容器就是干这件事的基础设施。
// ============================================================================

/**
 * 极简 DI 容器
 * 支持：
 *   1. register(token, definition)  按 token 注册一个「服务定义」
 *   2. resolve(token)               按 token 解析出实例（自动递归注入依赖）
 *   3. 构造函数依赖自动注入          根据定义里的 deps 列表，先把依赖都解析好再 new
 *   4. 单例                          默认每个 token 只创建一次，之后复用同一个实例
 */
class Container {
  constructor() {
    // providers：token -> 服务定义。定义描述「这个 token 怎么造出来、依赖谁」
    //   Map 的 key 用 token（可以是字符串，也可以是类本身），value 是定义对象
    this.providers = new Map();
    // singletons：token -> 已经创建好的单例实例，做缓存，保证「只造一次」
    this.singletons = new Map();
  }

  /**
   * 注册一个服务
   * @param {*} token  唯一标识（字符串如 'Logger'，或直接用类本身当 key）
   * @param {Object} definition 服务定义，字段：
   *   - useClass  {Function} 用哪个类来 new（构造函数）
   *   - useValue  {*}        直接注册一个现成的值（如配置对象），不走 new
   *   - useFactory{Function} 用一个工厂函数来造实例，工厂参数就是解析好的依赖
   *   - deps      {Array}    依赖的 token 列表（按构造函数/工厂参数顺序）
   *   - singleton {boolean}  是否单例，默认 true
   */
  register(token, definition = {}) {
    // 允许简写：register(SomeClass) —— 只传一个类，token 就是类，useClass 也是它
    if (typeof token === 'function' && arguments.length === 1) {
      definition = { useClass: token };
    }
    this.providers.set(token, {
      useClass: definition.useClass,
      useValue: definition.useValue,
      useFactory: definition.useFactory,
      deps: definition.deps || [],
      // 只有明确写 singleton:false 才是非单例，其余一律单例
      singleton: definition.singleton !== false,
    });
    return this; // 返回 this 支持链式调用：container.register(...).register(...)
  }

  /**
   * 解析：按 token 拿到实例。核心方法，会「递归」把依赖也解析出来。
   * @param {*} token
   * @param {Set} resolving  内部用，记录「正在解析的 token 链」，用来检测循环依赖
   */
  resolve(token, resolving = new Set()) {
    // 1) 找定义。没注册过就直接报错，避免拿到 undefined 后一路 NPE 难排查
    const def = this.providers.get(token);
    if (!def) {
      throw new Error(`[Container] 未注册的 token：${tokenName(token)}`);
    }

    // 2) useValue：注册的是现成的值，直接返回，不需要 new
    if (def.useValue !== undefined) {
      return def.useValue;
    }

    // 3) 单例缓存命中：之前造过，直接复用同一个实例
    if (def.singleton && this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    // 4) 循环依赖检测：A 依赖 B、B 又依赖 A 会无限递归，这里提前拦下来
    if (resolving.has(token)) {
      const chain = [...resolving, token].map(tokenName).join(' -> ');
      throw new Error(`[Container] 检测到循环依赖：${chain}`);
    }
    resolving.add(token); // 把当前 token 记入「解析链」

    // 5) 递归解析所有依赖：deps 里每个 token 都先 resolve 出实例
    //    这一步是「自动注入」的关键——依赖的依赖也会被自动造好
    const depInstances = def.deps.map((depToken) => this.resolve(depToken, resolving));

    // 6) 真正创建实例：优先工厂，其次类
    let instance;
    if (def.useFactory) {
      // 工厂函数：把解析好的依赖按顺序当参数传进去
      instance = def.useFactory(...depInstances);
    } else if (def.useClass) {
      // 类：new 的时候把依赖按顺序塞进构造函数 —— 这就是「构造函数注入」
      instance = new def.useClass(...depInstances);
    } else {
      throw new Error(`[Container] token ${tokenName(token)} 缺少 useClass/useFactory/useValue`);
    }

    resolving.delete(token); // 当前 token 解析完成，从解析链移除

    // 7) 单例则缓存，下次直接返回同一个实例
    if (def.singleton) {
      this.singletons.set(token, instance);
    }
    return instance;
  }

  /** 是否注册过某 token */
  has(token) {
    return this.providers.has(token);
  }
}

// 把 token 转成可读的名字，仅用于报错信息更友好（类打印类名，其余打印本身）
function tokenName(token) {
  if (typeof token === 'function') return token.name || 'AnonymousClass';
  return String(token);
}

module.exports = { Container };
