// 05 · Flutter 架构入门 —— 最小 Hello World
//
// 这是一个可以直接编译运行的最小 Flutter 应用。
// 运行前提：已 `flutter create demo`，然后用本文件覆盖 lib/main.dart。
//
// 核心思路：Flutter 中「一切皆 Widget」，界面由 Widget 声明式描述，
// 框架据此构建 Element 树与 RenderObject 树，最终由自绘引擎（Impeller/Skia）绘制。

import 'package:flutter/material.dart';

// main 是 Dart 程序入口。runApp 把根 Widget 挂载到屏幕上，
// 触发框架构建三棵树并启动渲染流水线。
void main() {
  runApp(const MyApp());
}

// MyApp 是根 Widget，通常用无状态 Widget 承载 MaterialApp。
// MaterialApp 提供 Material Design 主题、路由、本地化等一整套脚手架能力。
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Intro', // 应用标题（多任务窗口显示等场景用到）
      debugShowCheckedModeBanner: false, // 关闭右上角 DEBUG 横幅
      theme: ThemeData(
        // 从种子色生成 Material 3 配色方案，是当前推荐写法
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomePage(), // 首页 Widget
    );
  }
}

// HomePage 演示最典型的页面骨架：Scaffold + AppBar + body。
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    // Scaffold 提供页面基本结构：顶部栏、主体、悬浮按钮等
    return Scaffold(
      appBar: AppBar(
        title: const Text('05 Flutter Intro'),
      ),
      // Center 让子 Widget 在可用空间内居中
      body: const Center(
        // Text 是最基础的文本 Widget
        child: Text(
          'Hello, Flutter!',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
