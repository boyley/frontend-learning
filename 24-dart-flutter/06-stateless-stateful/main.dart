// 06 · StatelessWidget vs StatefulWidget
//
// 本文件包含两部分：
//   1. CounterPage —— StatefulWidget 计数器，演示 setState 触发重建与完整生命周期回调
//   2. InfoCard    —— StatelessWidget 卡片，演示无状态 Widget 只依赖构造参数渲染
//
// 运行前提：已 `flutter create demo`，用本文件覆盖 lib/main.dart。

import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: const CounterPage(title: '06 Stateless vs Stateful'),
    );
  }
}

// ============ StatefulWidget 部分：计数器 ============

// StatefulWidget 本身仍然是不可变的，它只负责「创建 State」。
// 可变数据与逻辑都住在 State 对象里。
class CounterPage extends StatefulWidget {
  const CounterPage({super.key, required this.title});

  // Widget 上的字段必须是 final（不可变）。State 里通过 widget.title 访问。
  final String title;

  @override
  State<CounterPage> createState() => _CounterPageState();
}

// State 对象在多次重建之间「存活」，用于保存可变状态。
class _CounterPageState extends State<CounterPage> {
  int _count = 0; // 可变状态：计数值

  // ---- 生命周期回调（按调用顺序）----

  @override
  void initState() {
    super.initState();
    // 只调用一次：State 首次插入树时。适合做订阅、初始化控制器、发起首屏请求。
    debugPrint('initState: State 已创建并插入树');
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 在 initState 之后调用，且当依赖的 InheritedWidget（如 Theme、MediaQuery）变化时会再次调用。
    debugPrint('didChangeDependencies: 依赖发生变化');
  }

  @override
  void didUpdateWidget(covariant CounterPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    // 当父级用「新的同类型 Widget」重建本节点时调用，可对比 oldWidget 与 widget 做处理。
    debugPrint('didUpdateWidget: 父级传入了新的配置');
  }

  void _increment() {
    // setState 通知框架：状态已变，需要重新 build。
    // 务必在 setState 的回调内部修改状态，框架才能正确调度重建。
    setState(() {
      _count++;
    });
  }

  @override
  void dispose() {
    // State 永久移除时调用一次。适合取消订阅、释放控制器，避免内存泄漏。
    debugPrint('dispose: State 被销毁');
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // build 可能被调用很多次（每次 setState、每次父级重建、依赖变化都会触发）。
    debugPrint('build: 重新构建 UI，当前 count=$_count');
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 复用下面的 StatelessWidget 卡片，把当前状态作为参数传入
            InfoCard(
              label: '当前计数',
              value: '$_count',
            ),
            const SizedBox(height: 24),
            const Text('点击右下角按钮 +1，观察控制台生命周期日志'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        tooltip: '增加',
        child: const Icon(Icons.add),
      ),
    );
  }
}

// ============ StatelessWidget 部分：信息卡片 ============

// 无状态 Widget：没有内部可变状态，渲染结果完全由构造参数决定。
// 参数一样，渲染就一样；要变化，只能由父级传入新参数并重建它。
class InfoCard extends StatelessWidget {
  const InfoCard({
    super.key,
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(label, style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.displaySmall?.copyWith(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
