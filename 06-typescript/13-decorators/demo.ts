/**
 * 13 · 装饰器（Decorators）—— 旧版 experimentalDecorators 演示
 *
 * 装饰器是一种「在声明时给类 / 成员附加额外行为」的语法，本质是一个函数，
 * 在类被定义时（注意：是定义时，不是实例化时）被调用。
 *
 * ⚠️ 前置条件：tsconfig.json 必须开启
 *    "experimentalDecorators": true   // 工程根已开
 *    "emitDecoratorMetadata": true    // 可选，配合反射元数据
 *
 * 本文件演示 5 种装饰器 + 装饰器工厂 + 执行顺序。
 */

// ============================================================
// 1) 类装饰器（Class Decorator）
//    参数：constructor —— 被装饰类的构造函数
//    返回值：可返回一个新构造函数来「替换」原类（可选）
// ============================================================
function sealed(constructor: Function): void {
  // 封闭类与其原型，禁止再增删属性
  Object.seal(constructor);
  Object.seal(constructor.prototype);
  console.log(`[类装饰器] ${constructor.name} 已被 seal`);
}

// ============================================================
// 2) 装饰器工厂（Decorator Factory）
//    「能接收参数的装饰器」：外层函数收参数，返回真正的装饰器函数。
// ============================================================
function logClass(prefix: string) {
  // 返回的才是真正的类装饰器
  return function (constructor: Function): void {
    console.log(`[装饰器工厂] ${prefix} -> 装饰了类 ${constructor.name}`);
  };
}

// ============================================================
// 3) 方法装饰器（Method Decorator）
//    参数：target（类原型）、propertyKey（方法名）、descriptor（属性描述符）
//    常用于：日志、缓存、权限校验。可改写 descriptor.value 包裹原方法。
// ============================================================
function logMethod(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value; // 原始方法
  descriptor.value = function (...args: unknown[]) {
    console.log(`[方法装饰器] 调用 ${propertyKey}，参数=${JSON.stringify(args)}`);
    const result = original.apply(this, args); // 调用原方法
    console.log(`[方法装饰器] ${propertyKey} 返回=${JSON.stringify(result)}`);
    return result;
  };
}

// ============================================================
// 4) 访问器装饰器（Accessor Decorator）
//    装饰 get / set，参数同方法装饰器（descriptor 含 get/set）。
// ============================================================
function configurableFalse(
  _target: object,
  _propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  descriptor.configurable = false; // 禁止该访问器被再次配置
}

// ============================================================
// 5) 属性装饰器（Property Decorator）
//    参数：target（类原型）、propertyKey（属性名）
//    没有 descriptor —— 因为属性值在实例化时才存在，这里拿不到。
//    常用于：登记元数据（如校验规则、ORM 列名）。
// ============================================================
function readonlyHint(target: object, propertyKey: string): void {
  console.log(`[属性装饰器] 标记了属性 ${target.constructor.name}.${propertyKey}`);
}

// ============================================================
// 6) 参数装饰器（Parameter Decorator）
//    参数：target、方法名、参数在参数列表中的索引 index
//    本身不能改值，通常配合方法装饰器/元数据做校验。
// ============================================================
function logParam(target: object, propertyKey: string, parameterIndex: number): void {
  console.log(
    `[参数装饰器] ${target.constructor.name}.${propertyKey} 的第 ${parameterIndex} 个参数被标记`
  );
}

// ============================================================
// 组合使用：观察「定义时」的执行顺序
// ============================================================
@sealed
@logClass('A')
@logClass('B') // 多个类装饰器：求值自上而下，应用（调用）自下而上
class UserService {
  @readonlyHint
  public name = 'guest';

  // 方法装饰器 + 参数装饰器
  @logMethod
  greet(@logParam message: string): string {
    return `hello, ${this.name}: ${message}`;
  }

  private _age = 18;

  @configurableFalse
  get age(): number {
    return this._age;
  }
}

// ❌ 错误示范：把方法装饰器用在属性上 / 把参数装饰器用在方法上，签名不匹配会报错
// class Bad {
//   @logParam // ❌ 报错 TS1238: 参数装饰器只能用于参数；用在属性上签名不符
//   value = 1;
// }
// 原因：参数装饰器的形参是 (target, key, index:number)，
//       而属性装饰器只有 (target, key)，类型不兼容，编译器拒绝。

// ✅ 正确：每种装饰器用在它规定的位置上（见上面 UserService）

// ============================================================
// 运行验证
// ============================================================
console.log('====== 实例化并调用 ======');
const svc = new UserService();
console.log(svc.greet('world')); // 触发被方法装饰器包裹的逻辑
console.log('age =', svc.age);

/**
 * 预期输出（注意装饰器在「类定义阶段」就打印了顺序日志）：
 * [属性装饰器] UserService.name
 * [参数装饰器] UserService.greet 的第 0 个参数被标记
 * [装饰器工厂] B -> 装饰了类 UserService   （应用自下而上：B 先）
 * [装饰器工厂] A -> 装饰了类 UserService
 * [类装饰器] UserService 已被 seal
 * ====== 实例化并调用 ======
 * [方法装饰器] 调用 greet，参数=["world"]
 * [方法装饰器] greet 返回=...
 * hello, guest: world
 * age = 18
 *
 * 说明执行顺序规律：
 * 1. 同一成员上：实例成员装饰器先于类装饰器执行；
 * 2. 求值（factory 外层调用）自上而下，应用（返回的装饰器调用）自下而上。
 */

// 让本文件成为模块，避免与其它 demo 的顶层标识符冲突
export {};
