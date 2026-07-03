// 09 · 导航与路由 —— 两页导航（首页 → 详情页，传参并返回结果）
//
// 本示例演示 Flutter 最核心的两种页面跳转方式：
//   1. Navigator.push + MaterialPageRoute：直接构造目标页并入栈（匿名路由）。
//   2. 命名路由 routes 表 + Navigator.pushNamed + onGenerateRoute：集中管理路由。
// 同时演示「传参 + await 返回值」：首页把参数传给详情页，详情页 pop 时回传结果，
// 首页 await 拿到结果并刷新界面。
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
      title: 'Navigation & Routing',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      // initialRoute 指定应用启动时的首屏命名路由。
      initialRoute: '/',
      // routes 表：字符串路由名 → 页面构造器。适合「无参数」的静态路由。
      routes: {
        '/': (context) => const HomePage(),
      },
      // onGenerateRoute：当 routes 表里找不到、或需要携带参数时的兜底工厂。
      // 命名路由传参推荐走这里，从 settings.arguments 取出参数再构造页面。
      onGenerateRoute: (settings) {
        if (settings.name == '/detail') {
          // arguments 是 Object?，需按约定类型强转。
          final args = settings.arguments as String? ?? '（无参数）';
          return MaterialPageRoute(
            builder: (context) => DetailPage(message: args),
            settings: settings, // 保留 settings 便于调试/分析
          );
        }
        // 未匹配到的路由，返回一个 404 兜底页，避免抛异常。
        return MaterialPageRoute(
          builder: (context) => const Scaffold(
            body: Center(child: Text('404 未知路由')),
          ),
        );
      },
    );
  }
}

// 首页：用 StatefulWidget 才能在拿到详情页返回值后 setState 刷新界面。
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  // 保存从详情页返回的结果，用于展示。
  String _result = '尚未从详情页返回结果';

  // 方式一：匿名路由 push。直接 new 一个页面塞进 MaterialPageRoute。
  // Navigator.push 返回 Future，await 它即可拿到目标页 pop 时回传的值。
  Future<void> _openByPush() async {
    final result = await Navigator.push<String>(
      context,
      MaterialPageRoute(
        builder: (context) => const DetailPage(message: '来自 push 的参数'),
      ),
    );
    // 返回后（可能是 null，如用户点系统返回键直接退出），刷新界面。
    if (!mounted) return; // 异步 gap 后使用 context/setState 前先判 mounted
    setState(() {
      _result = result ?? '用户未选择（直接返回）';
    });
  }

  // 方式二：命名路由 pushNamed，参数通过 arguments 传递。
  Future<void> _openByNamed() async {
    final result = await Navigator.pushNamed<String>(
      context,
      '/detail',
      arguments: '来自 pushNamed 的参数',
    );
    if (!mounted) return;
    setState(() {
      _result = result ?? '用户未选择（直接返回）';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('09 导航与路由 · 首页')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('返回结果：$_result', style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _openByPush,
              child: const Text('push 打开详情页（匿名路由）'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: _openByNamed,
              child: const Text('pushNamed 打开详情页（命名路由）'),
            ),
          ],
        ),
      ),
    );
  }
}

// 详情页：接收首页传入的 message，并可回传一个结果。
class DetailPage extends StatelessWidget {
  final String message; // 由首页传入的参数

  const DetailPage({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('详情页')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('收到参数：$message', style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 24),
            FilledButton(
              // pop 的第二个参数即返回给上一页的结果，会被 await 接收。
              onPressed: () => Navigator.pop(context, '你选择了「确认」'),
              child: const Text('确认并返回'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => Navigator.pop(context, '你选择了「取消」'),
              child: const Text('取消并返回'),
            ),
          ],
        ),
      ),
    );
  }
}
