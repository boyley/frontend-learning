// 11 · 网络与 JSON —— http 请求 JSONPlaceholder + FutureBuilder 三态渲染
//
// 本示例演示 Flutter 里最典型的网络数据流：
//   发起 http.get → 拿到 JSON 字符串 → jsonDecode 解析 → fromJson 工厂映射为模型对象
//   → FutureBuilder 根据 Future 状态渲染 loading / error / data 三种界面。
//
// 依赖：flutter pub add http
// 运行前提：已 `flutter create demo`，用本文件覆盖 lib/main.dart，并添加 http 依赖。

import 'dart:convert'; // jsonDecode
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http; // as http 给包起别名，调用更清晰

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Network & JSON',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const PostListPage(),
    );
  }
}

// 数据模型：与后端 JSON 字段一一对应。
// 手写 fromJson 工厂构造函数是 Flutter 官方推荐的「小型项目」做法（无需代码生成）。
class Post {
  final int id;
  final int userId;
  final String title;
  final String body;

  const Post({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
  });

  // 工厂构造：从 jsonDecode 得到的 Map<String, dynamic> 映射成强类型对象。
  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'] as int,
      userId: json['userId'] as int,
      title: json['title'] as String,
      body: json['body'] as String,
    );
  }
}

// 发起网络请求并解析为 List<Post>。返回 Future，交给 FutureBuilder 消费。
Future<List<Post>> fetchPosts() async {
  final url = Uri.parse('https://jsonplaceholder.typicode.com/posts');

  // http.get 发起 GET 请求，可通过 headers 传自定义请求头。
  final response = await http.get(
    url,
    headers: {'Accept': 'application/json'},
  );

  // 只有 2xx 才算成功；否则抛异常，让 FutureBuilder 进入 error 分支。
  if (response.statusCode == 200) {
    // response.body 是 JSON 字符串；jsonDecode 解析成 Dart 对象（这里是 List）。
    final List<dynamic> jsonList = jsonDecode(response.body) as List<dynamic>;
    // 逐个元素映射为 Post。取前 20 条避免列表过长。
    return jsonList
        .take(20)
        .map((item) => Post.fromJson(item as Map<String, dynamic>))
        .toList();
  } else {
    throw Exception('请求失败：HTTP ${response.statusCode}');
  }
}

class PostListPage extends StatefulWidget {
  const PostListPage({super.key});

  @override
  State<PostListPage> createState() => _PostListPageState();
}

class _PostListPageState extends State<PostListPage> {
  // 用一个字段保存 Future。注意：不要在 build 里直接调用 fetchPosts()，
  // 否则每次重建都会重新发请求。应在 initState 里创建一次。
  late Future<List<Post>> _postsFuture;

  @override
  void initState() {
    super.initState();
    _postsFuture = fetchPosts();
  }

  // 重试：重新赋值 Future 并 setState 触发重建。
  void _retry() {
    setState(() {
      _postsFuture = fetchPosts();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('11 网络与 JSON')),
      // FutureBuilder 监听 Future，根据 snapshot 状态自动切换界面。
      body: FutureBuilder<List<Post>>(
        future: _postsFuture,
        builder: (context, snapshot) {
          // 1) loading 态：请求进行中
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          // 2) error 态：请求抛异常或返回错误
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 8),
                  Text('出错了：${snapshot.error}'),
                  const SizedBox(height: 8),
                  FilledButton(onPressed: _retry, child: const Text('重试')),
                ],
              ),
            );
          }
          // 3) data 态：成功拿到数据
          final posts = snapshot.data ?? [];
          if (posts.isEmpty) {
            return const Center(child: Text('暂无数据'));
          }
          return ListView.separated(
            itemCount: posts.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final post = posts[index];
              return ListTile(
                leading: CircleAvatar(child: Text('${post.id}')),
                title: Text(post.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text(post.body, maxLines: 2, overflow: TextOverflow.ellipsis),
              );
            },
          );
        },
      ),
    );
  }
}
