/**
 * 07 · 类（Classes）
 * ---------------------------------------------
 * TS 的类在 ES 类基础上增加了：访问修饰符、readonly、参数属性简写、
 * 抽象类 abstract、implements 接口、类型化的 getter/setter 等。
 */

// ───────────────────────────────────────────────
// 1. 接口约束：implements
// ───────────────────────────────────────────────

interface Describable {
  describe(): string; // 实现类必须提供该方法
}

// ───────────────────────────────────────────────
// 2. 抽象类 abstract（不能被实例化，定义模板）
// ───────────────────────────────────────────────

abstract class Animal implements Describable {
  // 3. 访问修饰符 + readonly + 参数属性简写
  //    在构造函数参数前加修饰符，等价于「声明属性 + 赋值」一步到位
  constructor(
    public readonly name: string, // public：外部可读；readonly：构造后不可改
    protected age: number, // protected：自身和子类可访问，外部不可
    private id: number, // private：仅本类内部可访问
  ) {}

  // 抽象方法：只有签名，子类必须实现
  abstract makeSound(): string;

  // 普通方法（子类可直接复用）
  describe(): string {
    return `${this.name}（${this.age}岁, id=${this.id}）发出：${this.makeSound()}`;
  }
}

// ❌ 错误示范：抽象类不能直接 new
// const a = new Animal("x", 1, 1);
// 报错：无法创建抽象类的实例。

// ───────────────────────────────────────────────
// 4. 继承 extends 与 super
// ───────────────────────────────────────────────

class Dog extends Animal {
  // static：属于类本身而非实例
  static species = "Canis familiaris";

  constructor(name: string, age: number, id: number) {
    super(name, age, id); // 必须先调用 super 才能用 this
  }

  // 实现抽象方法
  makeSound(): string {
    return "汪汪";
  }

  // 子类可访问 protected age，但不能访问 private id
  growUp(): void {
    this.age += 1; // ✅ protected 可在子类访问
    // this.id; // ❌ 报错：属性“id”为私有属性，只能在类“Animal”中访问。
  }
}

const dog = new Dog("旺财", 3, 1001);
console.log(dog.describe());
dog.growUp();
console.log("长大后:", dog.describe());
console.log("静态属性:", Dog.species);

// ❌ 错误示范：修改 readonly 属性
// dog.name = "小黑";
// 报错：无法为“name”赋值，因为它是只读属性。

// ❌ 错误示范：外部访问 protected / private
// console.log(dog.age); // 报错：属性“age”受保护，只能在类“Animal”及其子类中访问。

// ───────────────────────────────────────────────
// 5. getter / setter（访问器）
// ───────────────────────────────────────────────

class Temperature {
  private _celsius = 0;

  // 读取时像访问属性：t.fahrenheit
  get fahrenheit(): number {
    return this._celsius * 1.8 + 32;
  }

  // 赋值时像设置属性：t.fahrenheit = 212
  set fahrenheit(value: number) {
    this._celsius = (value - 32) / 1.8;
  }

  get celsius(): number {
    return this._celsius;
  }
  set celsius(value: number) {
    this._celsius = value;
  }
}

const t = new Temperature();
t.celsius = 100;
console.log("100°C 对应华氏:", t.fahrenheit); // 212
t.fahrenheit = 32;
console.log("32°F 对应摄氏:", t.celsius); // 0

// ───────────────────────────────────────────────
// 6. 接口多实现 + 类型检查
// ───────────────────────────────────────────────

const items: Describable[] = [dog]; // Dog 实现了 Describable，可放入数组
items.forEach((it) => console.log("describe():", it.describe()));

console.log("演示结束");

// —— 让本文件成为独立 ES 模块作用域，避免与其它 demo 的同名声明在 IDE/整项目编译时冲突 ——
export {};
