// 07 · 布局 Widget 组合演示
//
// 综合演示 Column / Row / Container / Expanded / Flexible / Spacer / Stack / Positioned。
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
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const LayoutDemoPage(),
    );
  }
}

class LayoutDemoPage extends StatelessWidget {
  const LayoutDemoPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('07 Layout Widgets')),
      // Column 纵向排列：主轴=垂直，交叉轴=水平
      body: Column(
        // 主轴对齐：子项在垂直方向从顶部开始
        mainAxisAlignment: MainAxisAlignment.start,
        // 交叉轴对齐：子项在水平方向拉伸铺满
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // —— 1. Container：内外边距 + 装饰 ——
          Container(
            margin: const EdgeInsets.all(12), // 外边距
            padding: const EdgeInsets.all(16), // 内边距
            decoration: BoxDecoration(
              color: Colors.teal.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.teal),
            ),
            child: const Text(
              'Container：margin/padding/decoration',
              textAlign: TextAlign.center,
            ),
          ),

          // —— 2. Row + Expanded / Flexible / Spacer ——
          Container(
            height: 80,
            margin: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              // 主轴=水平
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Expanded：flex=2，按比例吃掉剩余空间并强制填满
                Expanded(
                  flex: 2,
                  child: _box('Expanded flex:2', Colors.teal),
                ),
                const SizedBox(width: 8),
                // Flexible：flex=1，按比例分配但允许子项比分到的更小
                Flexible(
                  flex: 1,
                  child: _box('Flexible flex:1', Colors.teal.shade300),
                ),
                // Spacer：占据剩余空间的弹性空白
                const Spacer(),
                _box('固定', Colors.teal.shade700, width: 60),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // —— 3. Stack + Positioned：层叠定位 ——
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(12),
              child: Stack(
                children: [
                  // 底层：铺满整个 Stack
                  Positioned.fill(
                    child: Container(color: Colors.teal.shade100),
                  ),
                  // 左上角徽标
                  Positioned(
                    top: 12,
                    left: 12,
                    child: _badge('左上'),
                  ),
                  // 右下角徽标
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: _badge('右下'),
                  ),
                  // 居中文字
                  const Center(
                    child: Text(
                      'Stack + Positioned',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 一个带文字的彩色盒子（辅助方法，避免重复代码）
  static Widget _box(String text, Color color, {double? width}) {
    return Container(
      width: width,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.white, fontSize: 12),
      ),
    );
  }

  // 一个小徽标
  static Widget _badge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.teal.shade700,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(text, style: const TextStyle(color: Colors.white)),
    );
  }
}
