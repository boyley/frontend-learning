// 01 · Dart 变量 / 类型 / Null Safety 演示
// 运行方式：dart run main.dart   （或 dart main.dart）
// 目标：Dart 3.x，内置 sound null safety，无需 Flutter。

void main() {
  // ============================================================
  // 一、变量声明：var / final / const
  // ============================================================

  // var：类型由右侧值推断（这里推断为 int），之后可以重新赋值，但类型固定。
  var count = 10;
  count = 20; // OK：值可变
  // count = 'hi'; // ❌ 编译错误：count 已被推断为 int

  // final：运行期常量，只能赋值一次；值可以来自运行期计算。
  final now = DateTime.now(); // 运行期才知道的值也能用 final
  final String name = 'Dart';

  // const：编译期常量，声明时值必须能在编译阶段确定。
  const pi = 3.14159;
  // const bad = now; // ❌ now 是运行期值，不能用作 const

  print('count=$count, name=$name, pi=$pi, now=$now');

  // ============================================================
  // 二、内置类型：int / double / String / bool
  // ============================================================
  int age = 30; // 整数
  double height = 1.75; // 浮点数
  String greeting = 'Hello'; // 字符串（单引号或双引号均可）
  bool isDartFun = true; // 布尔
  num anyNumber = 42; // num 是 int 和 double 的共同父类

  // Dart 没有隐式 int→double 转换，但字面量 3 可直接赋给 double 变量：
  double x = 3; // OK，编译器补成 3.0
  print('age=$age height=$height x=$x greeting=$greeting isDartFun=$isDartFun anyNumber=$anyNumber');

  // ============================================================
  // 三、类型推断
  // ============================================================
  // 右侧字面量决定类型，无需写类型注解。
  var list = [1, 2, 3]; // 推断为 List<int>
  var pair = ('Ada', 36); // 推断为 (String, int) 记录 Record
  print('list=$list  runtimeType=${list.runtimeType}  pair=$pair');

  // ============================================================
  // 四、可空类型 int? 与非空类型
  // ============================================================
  int notNull = 1; // 非空：永远不可能是 null
  int? maybeNull; // 可空：默认值就是 null
  print('notNull=$notNull maybeNull=$maybeNull');
  maybeNull = 5;
  print('maybeNull now = $maybeNull');

  // ============================================================
  // 五、null 相关操作符：?.  ??  ??=  !
  // ============================================================
  String? nickname; // 现在是 null

  // ?? ：如果左侧为 null，则取右侧默认值
  String display = nickname ?? '匿名用户';
  print('display=$display');

  // ??= ：如果变量当前为 null，才赋值
  nickname ??= '小明';
  print('nickname after ??= : $nickname');

  // ?. ：安全调用，若对象为 null 则整体返回 null，不抛异常
  String? text; // null
  int? len = text?.length; // text 为 null，故 len 也是 null
  print('len(null?.length)=$len');
  text = 'flutter';
  print('len(after set)=${text?.length}'); // 7

  // ! ：断言"我确定它此刻不为 null"，把 T? 转成 T。若实际为 null 会运行期抛错。
  int? boxed = 99;
  int unboxed = boxed!; // 我们确信 boxed 非空
  print('unboxed=$unboxed');

  // ============================================================
  // 六、late：延迟初始化的非空变量
  // ============================================================
  // late 承诺"我用之前一定会赋值"，从而绕过"声明即初始化"的要求。
  late String config;
  config = loadConfig(); // 第一次访问前完成赋值
  print('config=$config');

  // ============================================================
  // 七、条件语句 / 三元 / if-case（Dart 3 模式）
  // ============================================================
  int score = 82;
  if (score >= 90) {
    print('等级：A');
  } else if (score >= 60) {
    print('等级：及格');
  } else {
    print('等级：不及格');
  }

  // 三元表达式
  String parity = count.isEven ? '偶数' : '奇数';
  print('count 是 $parity');

  // ============================================================
  // 八、字符串插值 $ 与 ${}
  // ============================================================
  // 简单变量用 $var；表达式用 ${expr}
  print('$name 的长度是 ${name.length}，大写是 ${name.toUpperCase()}');

  // 多行字符串
  const multiLine = '''
第一行
第二行''';
  print(multiLine);
}

// late 演示用：模拟"较晚才能拿到"的配置
String loadConfig() => 'env=production';
