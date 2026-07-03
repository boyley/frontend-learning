// 03 · Dart 异步编程演示
// 运行方式：dart run main.dart   （或 dart main.dart）
// 覆盖：Future、async/await、then/catchError、Future.wait、
//       Stream（单订阅/广播）、async* yield、await for、try/catch 错误处理。
//
// 注意：main 用 async，程序会等所有异步任务跑完才退出。

import 'dart:async';
import 'dart:io'; // 用 stdout.write 做不换行输出

Future<void> main() async {
  print('=== 1. Future + async/await ===');
  final user = await fetchUser(1); // await 暂停当前函数直到 Future 完成
  print('拿到用户：$user');

  print('\n=== 2. then / catchError 链式写法 ===');
  // 与 await 等价的"回调风格"，返回值继续沿链传递。
  await fetchUser(2)
      .then((u) => '欢迎, $u')
      .then((msg) => print(msg))
      .catchError((e) => print('捕获错误: $e'));

  print('\n=== 3. 错误处理 try / catch ===');
  try {
    await fetchUser(-1); // id 非法 → 抛异常
  } catch (e) {
    print('try/catch 捕获: $e');
  } finally {
    print('finally 总会执行（清理资源）');
  }

  print('\n=== 4. Future.wait 并发等待多个 ===');
  final sw = Stopwatch()..start();
  // 三个请求"同时"发出（各 300ms），总耗时约 300ms 而非 900ms。
  final results = await Future.wait([
    fetchUser(10),
    fetchUser(11),
    fetchUser(12),
  ]);
  sw.stop();
  print('并发结果=$results，耗时约 ${sw.elapsedMilliseconds}ms');

  print('\n=== 5. microtask vs event queue 顺序 ===');
  demoEventLoop();
  // 让上面的调度打印完再继续
  await Future.delayed(Duration(milliseconds: 50));

  print('\n=== 6. Stream：单订阅 + await for ===');
  // countStream 是单订阅流，await for 逐个消费。
  await for (final tick in countStream(3)) {
    print('单订阅收到: $tick');
  }

  print('\n=== 7. async* + yield 生成 Stream ===');
  // fibStream 用 async* 惰性产出斐波那契数列。
  await for (final f in fibStream(6)) {
    stdout.write('$f '); // 不换行输出
  }
  stdout.writeln(); // 收尾换行

  print('\n=== 8. Stream 错误处理（listen 的 onError）===');
  final done = Completer<void>();
  riskyStream().listen(
    (data) => print('数据: $data'),
    onError: (e) => print('流内错误: $e'),
    onDone: () {
      print('流结束 onDone');
      done.complete();
    },
  );
  await done.future;

  print('\n=== 9. 广播流 broadcast：多个监听者 ===');
  final controller = StreamController<int>.broadcast();
  controller.stream.listen((v) => print('监听者 A: $v'));
  controller.stream.listen((v) => print('监听者 B: $v'));
  controller.add(100);
  controller.add(200);
  await Future.delayed(Duration(milliseconds: 10));
  await controller.close();

  print('\n全部演示结束。');
}

// 模拟网络请求：延迟 300ms 返回用户名；id 非法则抛错。
Future<String> fetchUser(int id) async {
  await Future.delayed(const Duration(milliseconds: 300)); // 模拟耗时
  if (id < 0) {
    throw ArgumentError('非法用户 id: $id');
  }
  return 'User#$id';
}

// 演示事件循环：同步代码 > microtask 队列 > event 队列
void demoEventLoop() {
  print('A: 同步代码（立即执行）');
  Future(() => print('D: event 队列（Future 普通任务）')); // 进 event queue
  Future.microtask(() => print('C: microtask 队列')); // 进 microtask queue，优先于 event
  scheduleMicrotask(() => print('C2: 另一个 microtask'));
  print('B: 同步代码（立即执行）');
  // 预期输出顺序：A → B → C → C2 → D
  // 因为：先跑完所有同步代码，再清空 microtask 队列，最后才处理 event 队列。
}

// 单订阅流：每 100ms 产出一个自增数字
Stream<int> countStream(int n) async* {
  for (var i = 1; i <= n; i++) {
    await Future.delayed(const Duration(milliseconds: 100));
    yield i; // 产出一个值给下游
  }
}

// async* 生成斐波那契流
Stream<int> fibStream(int n) async* {
  int a = 0, b = 1;
  for (var i = 0; i < n; i++) {
    yield a; // 逐个产出
    final next = a + b;
    a = b;
    b = next;
  }
}

// 会在中途抛错的流，用于演示 onError
Stream<int> riskyStream() async* {
  yield 1;
  yield 2;
  throw StateError('第 3 个元素出错了'); // 抛出后触发 onError，然后 onDone
}
