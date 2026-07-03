// 08 · 状态管理：setState → Provider（ChangeNotifier）
//
// 本文件用 Provider 实现一个「购物车」，对比裸 setState 的局限：
//   - 用 ChangeNotifier 把状态与逻辑从 Widget 里抽出，做成可共享的 CartModel。
//   - 用 ChangeNotifierProvider 注入到 Widget 树顶部。
//   - 子 Widget 用 context.watch / Consumer 订阅，状态变化只重建订阅处，而非整棵树。
//
// 依赖：flutter pub add provider
// 运行前提：flutter create demo，用本文件覆盖 lib/main.dart，先装 provider 再 flutter run。
//
// 文件末尾以注释给出等价的 Riverpod 写法，便于对照，无需运行。

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(
    // 在树的顶部提供 CartModel：其下任意后代都能拿到同一个实例。
    ChangeNotifierProvider(
      create: (_) => CartModel(),
      child: const MyApp(),
    ),
  );
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
      home: const CartPage(),
    );
  }
}

// ============ 状态模型：ChangeNotifier ============
// ChangeNotifier 是「可被监听的状态容器」。
// 修改数据后调用 notifyListeners()，所有订阅者收到通知并重建。
class CartModel extends ChangeNotifier {
  // 私有状态，外部只读，杜绝绕过 notifyListeners 直接改内部列表。
  final List<String> _items = [];

  // 对外暴露不可变视图
  List<String> get items => List.unmodifiable(_items);
  int get count => _items.length;
  // 派生状态：单价 10 元
  int get totalPrice => _items.length * 10;

  void add(String name) {
    _items.add(name);
    notifyListeners(); // 关键：通知所有监听者「我变了，请重建」
  }

  void removeLast() {
    if (_items.isNotEmpty) {
      _items.removeLast();
      notifyListeners();
    }
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}

// ============ 页面 ============
class CartPage extends StatelessWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context) {
    debugPrint('CartPage.build（外壳，通常只建一次）');
    return Scaffold(
      appBar: AppBar(
        title: const Text('08 状态管理 · Provider 购物车'),
        actions: [
          // context.watch：订阅 count 变化，徽标数字实时更新
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                '🛒 ${context.watch<CartModel>().count}',
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ),
        ],
      ),
      // Consumer 只包住需要随状态变化的那部分，缩小重建范围
      body: Consumer<CartModel>(
        builder: (context, cart, child) {
          debugPrint('Consumer.build（仅状态变化时重建这一块）');
          if (cart.count == 0) {
            return const Center(child: Text('购物车是空的，点右下角添加商品'));
          }
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  '共 ${cart.count} 件，合计 ¥${cart.totalPrice}',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: cart.count,
                  itemBuilder: (_, i) => ListTile(
                    leading: const Icon(Icons.shopping_bag),
                    title: Text(cart.items[i]),
                    trailing: const Text('¥10'),
                  ),
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: 'clear',
            onPressed: () => context.read<CartModel>().clear(), // read：只调方法不订阅
            tooltip: '清空',
            child: const Icon(Icons.delete_sweep),
          ),
          const SizedBox(width: 12),
          FloatingActionButton(
            heroTag: 'remove',
            onPressed: () => context.read<CartModel>().removeLast(),
            tooltip: '移除最后一件',
            child: const Icon(Icons.remove),
          ),
          const SizedBox(width: 12),
          FloatingActionButton(
            heroTag: 'add',
            // read 拿到 model 调用 add；不需要在这里订阅重建，故用 read 而非 watch。
            onPressed: () => context.read<CartModel>().add('商品 #${DateTime.now().second}'),
            tooltip: '添加',
            child: const Icon(Icons.add),
          ),
        ],
      ),
    );
  }
}

// ============ 对照：等价的 Riverpod 写法（仅注释，不参与编译）============
//
// 依赖：flutter pub add flutter_riverpod
//
// // 1. 定义 Notifier（Riverpod 2.x 推荐 NotifierProvider）
// final cartProvider = NotifierProvider<CartNotifier, List<String>>(CartNotifier.new);
// class CartNotifier extends Notifier<List<String>> {
//   @override
//   List<String> build() => [];                     // 初始状态
//   void add(String name) => state = [...state, name]; // 用「不可变替换」触发更新
//   void clear() => state = [];
// }
//
// // 2. 入口用 ProviderScope 包裹（替代 ChangeNotifierProvider）
// void main() => runApp(const ProviderScope(child: MyApp()));
//
// // 3. 在 ConsumerWidget 里用 ref.watch 订阅
// class CartView extends ConsumerWidget {
//   @override
//   Widget build(BuildContext context, WidgetRef ref) {
//     final items = ref.watch(cartProvider);          // 订阅
//     return Text('共 ${items.length} 件');
//   }
//   // 事件：ref.read(cartProvider.notifier).add('鞋');
// }
//
// 区别速记：
//   - Provider 靠 BuildContext + InheritedWidget 定位依赖；Riverpod 用全局 provider，
//     不依赖 context，编译期类型安全、更好测试、天然支持自动释放(autoDispose)。
