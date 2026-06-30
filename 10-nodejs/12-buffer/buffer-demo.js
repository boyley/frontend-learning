// ============================================================
// 12 · Buffer 二进制缓冲区 —— 处理字节、编码、文件/网络原始数据
// 运行方式：node buffer-demo.js
// ============================================================

// JS 原生擅长处理字符串/数字，但文件、网络、图片都是「二进制字节流」。
// Buffer 就是 Node 用来表示「一段固定长度原始字节」的类（底层是 Uint8Array）。

// ① 创建 Buffer 的几种方式
const b1 = Buffer.from('你好Node', 'utf-8'); // 从字符串创建（默认 utf-8）
const b2 = Buffer.from([72, 105]);            // 从字节数组创建 → 'Hi'
const b3 = Buffer.alloc(8);                   // 创建 8 字节、全部填 0 的安全 Buffer
// 注意：Buffer.allocUnsafe(8) 更快但不清零（含旧内存脏数据），写满前别读它

console.log('① b1（"你好Node" 的字节）：', b1);
console.log('   b1 长度（字节数）：', b1.length); // 中文 utf-8 占 3 字节，"你好"=6 + "Node"=4 = 10
console.log('   b2 转字符串：', b2.toString());   // Hi
console.log('   b3 全 0 缓冲：', b3);

// ② 字符串长度 vs 字节长度（中文是坑！）
const str = '你好';
console.log('\n② "你好" 的字符数 str.length =', str.length);                 // 2
console.log('   "你好" 的字节数 Buffer.byteLength =', Buffer.byteLength(str)); // 6（utf-8）
// 网络/文件按字节算，做协议、限流、分包时必须用字节数，别用 str.length

// ③ Buffer ↔ 不同编码互转（utf-8 / hex / base64）
const buf = Buffer.from('Node!');
console.log('\n③ 编码转换：');
console.log('   utf-8 ：', buf.toString('utf-8'));   // Node!
console.log('   hex   ：', buf.toString('hex'));     // 4e6f646521
console.log('   base64：', buf.toString('base64'));  // Tm9kZSE=
// base64 反解：
console.log('   base64 解码回字符串：', Buffer.from('Tm9kZSE=', 'base64').toString()); // Node!

// ④ 读写单个字节（Buffer 像数组一样可索引，值是 0~255）
const b4 = Buffer.from('ABC');
console.log('\n④ b4[0] =', b4[0], '（字符 A 的 ASCII 码）'); // 65
b4[0] = 90; // 改成 'Z' 的码
console.log('   改第一个字节后：', b4.toString());            // ZBC

// ⑤ 拼接与切片
const part1 = Buffer.from('前端');
const part2 = Buffer.from('学习');
const all = Buffer.concat([part1, part2]); // 合并多个 Buffer
console.log('\n⑤ concat 合并：', all.toString());            // 前端学习
console.log('   subarray 切片（共享内存）：', all.subarray(0, 6).toString()); // 前端（"前端"占6字节）

// ⑥ 中文截断陷阱：按字节切可能把一个汉字切成两半 → 乱码
const cn = Buffer.from('中文');                 // 每个汉字 3 字节，共 6 字节
console.log('\n⑥ 把 6 字节的"中文"在第 4 字节处截断：');
console.log('   错误截断 subarray(0,4)：', cn.subarray(0, 4).toString()); // "中" + 半个字 → 乱码
// 正确做法：用 string_decoder 模块按完整字符边界解码，或干脆按字符处理。

// 小结：Buffer 用于二进制场景（文件、流、加密、协议）。
//   字符长度 ≠ 字节长度；中文切片要小心边界；常用 toString/from 在字符串与字节间转换。
