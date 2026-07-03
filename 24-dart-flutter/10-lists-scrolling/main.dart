// 10 · 列表与滚动 —— ListView.builder 长列表 + 下拉刷新
//
// 本示例演示最常用的滚动列表：
//   - ListView.builder：按需懒加载，只构建可视区域附近的 item，适合长/无限列表。
//   - ListView.separated：在 item 之间插入分隔线（这里通过 separatorBuilder 演示）。
//   - RefreshIndicator：下拉刷新，返回一个 Future，完成后收起刷新指示器。
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
      title: 'Lists & Scrolling',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const ListDemoPage(),
    );
  }
}

class ListDemoPage extends StatefulWidget {
  const ListDemoPage({super.key});

  @override
  State<ListDemoPage> createState() => _ListDemoPageState();
}

class _ListDemoPageState extends State<ListDemoPage> {
  // 数据源：初始 30 条。真实场景通常来自网络请求。
  List<String> _items = List.generate(30, (i) => '列表项 #${i + 1}');

  // 下拉刷新回调：必须返回 Future，RefreshIndicator 会等它完成再收起。
  Future<void> _onRefresh() async {
    // 模拟网络延迟
    await Future.delayed(const Duration(seconds: 1));
    if (!mounted) return;
    setState(() {
      // 用新数据替换（这里简单地重新生成，加一个时间戳区分刷新前后）
      final stamp = DateTime.now().second;
      _items = List.generate(30, (i) => '刷新后列表项 #${i + 1}（$stamp）');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('10 列表与滚动')),
      // RefreshIndicator 包裹可滚动列表即可获得下拉刷新能力。
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        // ListView.separated：itemBuilder 构建 item，separatorBuilder 构建分隔线。
        // 它本质也是懒加载（builder 模式），只构建可视区域附近的 item。
        child: ListView.separated(
          // itemCount 为 null 表示无限列表；这里给定数量。
          itemCount: _items.length,
          // 分隔线：每两个 item 之间插入一条 Divider。
          separatorBuilder: (context, index) => const Divider(height: 1),
          // itemBuilder 只在 item 即将进入可视区域时被调用（懒加载核心）。
          itemBuilder: (context, index) {
            final item = _items[index];
            return ListTile(
              leading: CircleAvatar(child: Text('${index + 1}')),
              title: Text(item),
              subtitle: const Text('点击查看（此处仅演示滚动）'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                // SnackBar 简单反馈点击
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('点击了 $item')),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
