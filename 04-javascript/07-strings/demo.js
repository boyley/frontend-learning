// ============================================================
// 07 · 字符串（Strings）演示
// 浏览器和 Node 都能运行：node demo.js 直接看输出
// ============================================================

const lines = [];
function print(label, value) {
  const text =
    typeof value === 'object' && value !== null
      ? JSON.stringify(value)
      : String(value);
  const line = label + ' => ' + text;
  lines.push(line);
  console.log(line);
}

const str = 'Hello, JavaScript!';

// ============================================================
// 1) length：字符串长度（字符个数）
// ============================================================
print('length 长度', str.length); // 18

// ============================================================
// 2) 截取：slice / substring（注意区别）
// ============================================================
// slice(start, end)：支持负数索引（从末尾倒数）
print('slice(0, 5)', str.slice(0, 5));   // Hello
print('slice(7)', str.slice(7));         // JavaScript!
print('slice(-11) 负数从末尾数', str.slice(-11)); // JavaScript!
// substring(start, end)：不支持负数（负数当 0），会自动把较小值当 start
print('substring(0, 5)', str.substring(0, 5)); // Hello
print('substring(5, 0) 自动交换参数', str.substring(5, 0)); // Hello

// ============================================================
// 3) 查找：indexOf / includes
// ============================================================
print('indexOf("Java") 返回下标', str.indexOf('Java')); // 7
print('indexOf("Python") 找不到返回 -1', str.indexOf('Python')); // -1
print('includes("Script") 是否包含', str.includes('Script')); // true
print('startsWith("Hello")', str.startsWith('Hello')); // true
print('endsWith("!")', str.endsWith('!')); // true

// ============================================================
// 4) 替换：replace（只替换第一个）/ replaceAll（替换全部）
// ============================================================
const repeated = 'cat cat cat';
print('replace 只换第一个', repeated.replace('cat', 'dog')); // dog cat cat
print('replaceAll 全部替换', repeated.replaceAll('cat', 'dog')); // dog dog dog
// 用正则 + g 也能全部替换（replaceAll 内部等价）
print('replace + 正则g', repeated.replace(/cat/g, 'dog')); // dog dog dog

// ============================================================
// 5) 拆分与合并：split
// ============================================================
const csv = 'apple,banana,orange';
const fruits = csv.split(','); // 按逗号拆成数组
print('split(",") 拆成数组', fruits);
print('split("") 拆成单字符数组', 'abc'.split(''));
print('数组 join 合回字符串', fruits.join(' / '));

// ============================================================
// 6) 去空白：trim / trimStart / trimEnd
// ============================================================
const dirty = '   留白文本   ';
print('trim 去两端空白', '[' + dirty.trim() + ']'); // [留白文本]
print('trimStart 去开头', '[' + dirty.trimStart() + ']');

// ============================================================
// 7) 补齐：padStart / padEnd（常用于补零、对齐）
// ============================================================
print('padStart 补零到4位', '7'.padStart(4, '0')); // 0007
print('padEnd 右侧补齐', 'ab'.padEnd(5, '*')); // ab***
// 实用例：格式化时间 09:05
const h = 9, m = 5;
print('格式化时间', `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`); // 09:05

// ============================================================
// 8) 重复：repeat
// ============================================================
print('repeat(3) 重复', 'ab'.repeat(3)); // ababab
print('画分割线', '='.repeat(10)); // ==========

// ============================================================
// 9) 大小写：toUpperCase / toLowerCase
// ============================================================
print('toUpperCase', 'hello'.toUpperCase()); // HELLO
print('toLowerCase', 'WORLD'.toLowerCase()); // world

// ============================================================
// 10) 模板字符串：反引号 ` ` 支持插值 ${} 和多行
// ============================================================
const userName = '小明';
const userAge = 18;
// 插值：${表达式} 直接嵌入变量或运算
const intro = `我叫${userName}，今年${userAge}岁，明年${userAge + 1}岁。`;
print('模板字符串插值', intro);
// 多行：反引号内可以直接换行，无需 \n 拼接
const multiLine = `第一行
第二行
第三行`;
print('多行字符串', JSON.stringify(multiLine)); // 用 JSON 显示换行符

// ============================================================
// DOM 输出：仅浏览器执行
// ============================================================
if (typeof document !== 'undefined') {
  const out = document.getElementById('output');
  if (out) out.textContent = lines.join('\n');
}
