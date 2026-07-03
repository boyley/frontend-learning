// 04 · Dart 面向对象 + Dart 3 新特性演示
// 运行方式：dart run main.dart   （或 dart main.dart）
// 覆盖：类/字段/构造（普通/命名/初始化列表/const/factory/重定向）、
//       getter/setter、继承 extends/super、抽象类 abstract、接口 implements、
//       mixin with、泛型 <T> 与泛型约束、增强枚举 enhanced enum、
//       Dart 3 的 sealed 类 + switch 模式匹配（穷尽检查）、extension 扩展方法。

void main() {
  print('=== 1. 类 / 构造函数 / 命名构造 / 初始化列表 ===');
  final p1 = Point(3, 4); // 普通构造
  final origin = Point.origin(); // 命名构造
  final p2 = Point.fromJson({'x': 6, 'y': 8}); // 命名构造 + 工厂式解析
  print('p1=$p1，到原点距离=${p1.distanceTo(origin)}'); // 5.0
  print('p2=$p2，模长(getter)=${p2.magnitude}'); // 10.0

  print('\n=== 2. const 构造：编译期常量 + 规范化实例 ===');
  const a = ImmutablePoint(1, 2);
  const b = ImmutablePoint(1, 2);
  // const 相同实参 → 同一个对象（canonicalization），identical 为 true
  print('两个 const 相同实参是否同一对象: ${identical(a, b)}'); // true

  print('\n=== 3. factory 工厂构造：可返回缓存/子类实例 ===');
  final logA = Logger('auth'); // 首次创建
  final logB = Logger('auth'); // 命中缓存，返回同一实例
  print('同名 Logger 是否复用: ${identical(logA, logB)}'); // true
  logA.log('用户登录');

  print('\n=== 4. getter / setter：像字段一样用，背后是方法 ===');
  final acc = Account();
  acc.balance = 100; // 走 setter（含校验）
  acc.balance += 50; // 读 getter 再写 setter
  print('余额=${acc.balance}');
  try {
    acc.balance = -5; // 触发 setter 校验，抛错
  } catch (e) {
    print('setter 校验拦截: $e');
  }

  print('\n=== 5. 继承 extends / 抽象类 / 覆写 @override ===');
  final shapes = <Shape>[Circle(2), Rectangle(3, 4)];
  for (final s in shapes) {
    // 多态：同一个 area() 调用，运行时分派到各自实现
    print('${s.name} 面积=${s.area().toStringAsFixed(2)}');
  }

  print('\n=== 6. 接口 implements + mixin with ===');
  final duck = Duck();
  duck.fly(); // 来自 Flyable mixin
  duck.swim(); // 来自 Swimmable mixin
  duck.describe(); // 实现 Animal 接口的方法

  print('\n=== 7. 泛型 <T> 与泛型约束 <T extends num> ===');
  final box = Box<String>('hello');
  print('泛型盒子内容: ${box.value}，类型: ${box.value.runtimeType}');
  print('泛型求和(仅接受 num 子类): ${sumAll<int>([1, 2, 3])}'); // 6
  print('泛型求和 double: ${sumAll<double>([1.5, 2.5])}'); // 4.0

  print('\n=== 8. 增强枚举 enhanced enum（带字段/构造/方法）===');
  for (final planet in Planet.values) {
    print('${planet.label} 引力系数=${planet.gravity}, 偏重? ${planet.isHeavy}');
  }

  print('\n=== 9. Dart 3 · sealed 类 + switch 模式匹配（穷尽）===');
  final results = <ApiResult>[
    Success(['a', 'b', 'c']),
    Failure('网络超时', 408),
    Loading(),
  ];
  for (final r in results) {
    print(render(r)); // switch 表达式覆盖所有子类，编译器保证穷尽
  }

  print('\n=== 10. extension 扩展方法：给已有类型加能力 ===');
  print('"Dart".repeat(3) = ${"Dart".repeat(3)}');
  print('42.isEven(扩展) = ${42.parityLabel}');
}

// ---------- 1. 普通类 + 多种构造 ----------
class Point {
  // 实例字段（此处可变）。distanceTo 用到，声明为 final 亦可。
  final double x;
  final double y;

  // 普通构造 + 形参简写（this.x 自动赋值给字段）
  Point(this.x, this.y);

  // 命名构造：一个类可有多个命名构造
  Point.origin() : this(0, 0); // 重定向到主构造

  // 命名构造 + 初始化列表（: 后在构造体运行前初始化 final 字段）
  Point.fromJson(Map<String, dynamic> json)
      : x = (json['x'] as num).toDouble(),
        y = (json['y'] as num).toDouble();

  // 计算属性：getter，无需括号即可访问
  double get magnitude => _sqrt(x * x + y * y);

  double distanceTo(Point other) {
    final dx = x - other.x;
    final dy = y - other.y;
    return _sqrt(dx * dx + dy * dy);
  }

  @override
  String toString() => 'Point($x, $y)'; // 覆写 Object.toString
}

// 简易开方（避免为了一个 sqrt 引入 dart:math，保持 demo 自包含）
double _sqrt(double v) {
  if (v <= 0) return 0;
  double guess = v;
  for (var i = 0; i < 30; i++) {
    guess = (guess + v / guess) / 2; // 牛顿迭代
  }
  return guess;
}

// ---------- 2. const 构造：不可变值对象 ----------
class ImmutablePoint {
  final int x;
  final int y;
  // 所有字段 final + 构造用 const 修饰 → 可作编译期常量
  const ImmutablePoint(this.x, this.y);
}

// ---------- 3. factory 工厂构造：控制实例创建 ----------
class Logger {
  final String name;
  static final Map<String, Logger> _cache = {}; // 类级静态缓存

  // 私有命名构造，只给 factory 内部用
  Logger._internal(this.name);

  // factory 可返回缓存实例（甚至子类实例），不一定新建
  factory Logger(String name) {
    return _cache.putIfAbsent(name, () => Logger._internal(name));
  }

  void log(String msg) => print('[$name] $msg');
}

// ---------- 4. getter / setter ----------
class Account {
  double _balance = 0; // 私有字段（下划线 = 库私有）

  double get balance => _balance; // 读取器
  set balance(double v) {
    // 写入器可加校验/副作用
    if (v < 0) throw ArgumentError('余额不能为负: $v');
    _balance = v;
  }
}

// ---------- 5. 抽象类 + 继承 + 多态 ----------
abstract class Shape {
  String get name; // 抽象 getter，子类必须实现
  double area(); // 抽象方法，无方法体
}

class Circle extends Shape {
  final double r;
  Circle(this.r);
  @override
  String get name => '圆';
  @override
  double area() => 3.141592653589793 * r * r;
}

class Rectangle extends Shape {
  final double w, h;
  Rectangle(this.w, this.h);
  @override
  String get name => '矩形';
  @override
  double area() => w * h;
}

// ---------- 6. 接口(implements) + mixin(with) ----------
// Dart 没有 interface 关键字：任何类都可被 implements（需实现其全部成员）。
class Animal {
  void describe() => print('我是一只动物');
}

// mixin：可被 with 混入，复用行为而不用继承
mixin Flyable {
  void fly() => print('  ✈️ 我会飞');
}
mixin Swimmable {
  void swim() => print('  🏊 我会游泳');
}

// Duck 混入两个能力，并实现 Animal 接口（覆写 describe）
class Duck with Flyable, Swimmable implements Animal {
  @override
  void describe() => print('我是鸭子：会飞也会游泳');
}

// ---------- 7. 泛型 ----------
class Box<T> {
  final T value; // T 为类型参数，使用时指定具体类型
  Box(this.value);
}

// 泛型约束：T 必须是 num 的子类型，才能用 + 运算
num sumAll<T extends num>(List<T> items) {
  num total = 0;
  for (final it in items) {
    total += it;
  }
  return total;
}

// ---------- 8. 增强枚举 ----------
enum Planet {
  earth('地球', 9.8),
  mars('火星', 3.7),
  jupiter('木星', 24.8);

  // 枚举可以有 final 字段和 const 构造
  const Planet(this.label, this.gravity);
  final String label;
  final double gravity;

  // 枚举也能有方法/getter
  bool get isHeavy => gravity > 10;
}

// ---------- 9. Dart 3：sealed 类 + 穷尽模式匹配 ----------
// sealed 密封类：其所有直接子类必须在「同一个库」内定义。
// 好处：switch 时编译器能做「穷尽性检查」，漏掉一个分支会编译报错。
sealed class ApiResult {}

class Success extends ApiResult {
  final List<String> data;
  Success(this.data);
}

class Failure extends ApiResult {
  final String message;
  final int code;
  Failure(this.message, this.code);
}

class Loading extends ApiResult {}

// switch 表达式 + 对象模式解构，覆盖 sealed 的全部子类（无需 default）
String render(ApiResult r) => switch (r) {
      Success(:final data) => '✅ 成功，共 ${data.length} 条: $data',
      Failure(:final message, :final code) => '❌ 失败[$code]: $message',
      Loading() => '⏳ 加载中…',
    };

// ---------- 10. extension 扩展方法 ----------
extension StringRepeat on String {
  // 给 String 增加 repeat 方法
  String repeat(int times) => List.filled(times, this).join();
}

extension IntParity on int {
  // 给 int 增加 parityLabel getter
  String get parityLabel => isEven ? '偶数' : '奇数';
}
