// 12 · 跨端对比 · 平台自适应小 demo（本模块以文档为主，demo 为辅）
//
// 一份代码跑在所有平台，靠运行时判断当前平台做「自适应」：
//   - kIsWeb                         是否运行在 Web（编译为 JS/Wasm）
//   - defaultTargetPlatform          当前目标平台（iOS/Android/macOS/...）
//   - Theme.of(context).platform     受主题影响的平台（可被覆盖，做 UI 适配用它）
// 本 demo 展示同一按钮在 iOS 用 Cupertino 风格、其余用 Material 风格。
//
// 运行前提：flutter create demo，用本文件覆盖 lib/main.dart，
//           flutter run（可 -d chrome 跑 Web，-d macos 跑桌面，感受同码多端）。

import 'package:flutter/foundation.dart'; // kIsWeb / defaultTargetPlatform
import 'package:flutter/cupertino.dart'; // iOS 风格控件
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true),
      home: const PlatformDemoPage(),
    );
  }
}

class PlatformDemoPage extends StatelessWidget {
  const PlatformDemoPage({super.key});

  // 把 defaultTargetPlatform 转成中文标签
  String get _platformLabel {
    if (kIsWeb) return 'Web（编译成 JS / WebAssembly）';
    switch (defaultTargetPlatform) {
      case TargetPlatform.iOS:
        return 'iOS';
      case TargetPlatform.android:
        return 'Android';
      case TargetPlatform.macOS:
        return 'macOS';
      case TargetPlatform.windows:
        return 'Windows';
      case TargetPlatform.linux:
        return 'Linux';
      default:
        return '未知平台';
    }
  }

  @override
  Widget build(BuildContext context) {
    // 用 Theme 的 platform 做 UI 适配（它可被开发者覆盖，比 defaultTargetPlatform 更适合调 UI）
    final isCupertino = Theme.of(context).platform == TargetPlatform.iOS ||
        Theme.of(context).platform == TargetPlatform.macOS;

    return Scaffold(
      appBar: AppBar(title: const Text('12 跨端 · 平台自适应')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('当前运行平台：$_platformLabel',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 24),
            const Text('下面这个按钮会按平台切换风格：'),
            const SizedBox(height: 12),
            // 关键：同一逻辑，按平台渲染不同风格的原生化控件
            if (isCupertino)
              CupertinoButton.filled(
                onPressed: () => _toast(context, '你点了 iOS 风格按钮'),
                child: const Text('Cupertino 按钮'),
              )
            else
              FilledButton(
                onPressed: () => _toast(context, '你点了 Material 风格按钮'),
                child: const Text('Material 按钮'),
              ),
          ],
        ),
      ),
    );
  }

  void _toast(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), duration: const Duration(seconds: 1)),
    );
  }
}
