// 02 · Dart 集合与函数演示
// 运行方式：dart run main.dart   （或 dart main.dart）
// 覆盖：List/Set/Map、集合字面量、spread、collection if/for、
//       map/where/reduce/fold、各类参数、箭头函数、匿名函数、闭包、一等函数。

void main() {
  // ============================================================
  // 一、三大集合：List / Set / Map
  // ============================================================
  List<int> nums = [1, 2, 3]; // 有序可重复
  Set<String> tags = {'dart', 'flutter', 'dart'}; // 去重，结果只有两个元素
  Map<String, int> ages = {'Ada': 36, 'Bob': 40}; // 键值对

  print('nums=$nums');
  print('tags=$tags (自动去重)');
  print('ages=$ages, Ada=${ages['Ada']}');

  // 空集合字面量要注意：{} 默认是空 Map，空 Set 需写 <String>{}
  var emptyMap = {}; // Map<dynamic, dynamic>
  var emptySet = <int>{}; // Set<int>
  print('emptyMap.runtimeType=${emptyMap.runtimeType}, emptySet.runtimeType=${emptySet.runtimeType}');

  // ============================================================
  // 二、展开操作符 spread ... 与 空安全展开 ...?
  // ============================================================
  var head = [0];
  var tail = [4, 5];
  List<int>? maybeMore; // null
  var merged = [
    ...head, // 展开 head
    1, 2, 3,
    ...tail, // 展开 tail
    ...?maybeMore, // maybeMore 为 null 时安全跳过（普通 ... 会崩）
  ];
  print('merged=$merged');

  // ============================================================
  // 三、集合内 if / for（collection if / collection for）
  // ============================================================
  bool promoMode = true;
  var menu = [
    '首页',
    '商品',
    if (promoMode) '限时促销', // 条件成立才加入该元素
    for (var i = 1; i <= 3; i++) '分类$i', // 循环生成元素
  ];
  print('menu=$menu');

  // ============================================================
  // 四、常用高阶方法：map / where / reduce / fold
  // ============================================================
  var source = [1, 2, 3, 4, 5, 6];

  // map：逐个变换（返回惰性 Iterable，用 toList 物化）
  var doubled = source.map((n) => n * 2).toList();

  // where：过滤，保留满足条件者
  var evens = source.where((n) => n.isEven).toList();

  // reduce：无初始值累积，元素类型与结果类型一致；空集合会抛错
  var sum = source.reduce((acc, n) => acc + n);

  // fold：带初始值累积，结果类型可与元素不同；空集合安全（返回初始值）
  var total = source.fold<int>(100, (acc, n) => acc + n); // 100 + 21
  var joined = source.fold<String>('', (acc, n) => '$acc$n'); // 拼成字符串

  print('doubled=$doubled');
  print('evens=$evens');
  print('sum(reduce)=$sum');
  print('total(fold 起点100)=$total');
  print('joined(fold 成串)=$joined');

  // 链式管道：过滤偶数 → 平方 → 求和
  var pipeline = source.where((n) => n.isEven).map((n) => n * n).fold<int>(0, (a, b) => a + b);
  print('pipeline(偶数平方和)=$pipeline');

  // ============================================================
  // 五、函数与各种参数
  // ============================================================

  // 位置参数（必填）
  print(add(2, 3));

  // 可选位置参数 []：可省略，需给默认值或用可空类型
  print(greet('Ada')); // 用默认 greeting
  print(greet('Bob', '晚上好')); // 覆盖 greeting

  // 命名参数 {}：调用时写参数名；required 表示必填，其余可给默认值
  print(buildUser(name: 'Cara', age: 28));
  print(buildUser(name: 'Dan', age: 30, city: '上海'));

  // ============================================================
  // 六、箭头函数 => 与匿名函数
  // ============================================================
  // 箭头函数：单表达式函数体的语法糖，=> expr 等价 { return expr; }
  int square(int n) => n * n;
  print('square(5)=${square(5)}');

  // 匿名函数（闭包字面量）直接作为参数传入
  [10, 20, 30].forEach((v) {
    print('forEach 元素: $v');
  });

  // ============================================================
  // 七、闭包 Closure：函数捕获其定义处的变量
  // ============================================================
  var counter = makeCounter(); // 每次调用返回一个独立计数器
  print('counter()=${counter()}'); // 1
  print('counter()=${counter()}'); // 2
  print('counter()=${counter()}'); // 3

  // ============================================================
  // 八、一等函数：函数可存入变量、作参数、作返回值
  // ============================================================
  // 存入变量（用 Function 类型或具体签名 int Function(int,int)）
  int Function(int, int) op = add;
  print('op(4,6)=${op(4, 6)}');

  // 作参数
  print('applyTwice(3)=${applyTwice(3, (n) => n + 10)}'); // (3+10)+10 = 23

  // 作返回值：makeCounter / makeAdder
  var add10 = makeAdder(10);
  print('add10(5)=${add10(5)}'); // 15
}

// 位置参数
int add(int a, int b) => a + b;

// 可选位置参数（用 [] 包裹，带默认值）
String greet(String name, [String greeting = '你好']) => '$greeting, $name!';

// 命名参数（{} 包裹；required 必填，city 可选带默认）
String buildUser({required String name, required int age, String city = '未知'}) =>
    '用户[$name, ${age}岁, $city]';

// 闭包工厂：返回一个记住 count 的函数
int Function() makeCounter() {
  int count = 0; // 被返回的闭包捕获
  return () => ++count;
}

// 高阶函数：把函数作为参数
int applyTwice(int x, int Function(int) f) => f(f(x));

// 高阶函数：把函数作为返回值
int Function(int) makeAdder(int base) => (int n) => base + n;
