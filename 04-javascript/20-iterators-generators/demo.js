// 20 · 迭代器与生成器 demo
// 本文件聚焦：可迭代协议、迭代器协议、generator function*/yield、惰性求值、用生成器实现迭代器
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

const lines = [];
function log(...args) {
  const text = args
    .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
    .join(' ');
  lines.push(text);
  console.log(text);
  if (typeof document !== 'undefined') {
    const pre = document.getElementById('output');
    if (pre) pre.textContent = lines.join('\n');
  }
}

// ============================================================
// 一、迭代器协议：一个对象有 next() 方法，每次返回 { value, done }
// ============================================================
log('===== 一、迭代器协议 next() =====');

// 手写一个迭代器：从 start 数到 end
function makeRangeIterator(start, end) {
  let current = start;
  return {
    // next() 是迭代器协议的核心：返回 { value: 当前值, done: 是否结束 }
    next() {
      if (current <= end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

const it = makeRangeIterator(1, 3);
log('  next():', JSON.stringify(it.next())); // {value:1, done:false}
log('  next():', JSON.stringify(it.next())); // {value:2, done:false}
log('  next():', JSON.stringify(it.next())); // {value:3, done:false}
log('  next():', JSON.stringify(it.next())); // {value:undefined, done:true}

// ============================================================
// 二、可迭代协议：对象实现 [Symbol.iterator]()，返回一个迭代器
//     实现后即可用 for...of、展开运算符、解构
// ============================================================
log('===== 二、可迭代协议 Symbol.iterator =====');

const range = {
  start: 1,
  end: 4,
  // [Symbol.iterator] 让对象"可迭代"
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

// for...of 会自动调用 [Symbol.iterator]() 拿迭代器，反复 next 直到 done
const collected = [];
for (const n of range) collected.push(n);
log('  for...of 结果:', collected); // [1,2,3,4]
log('  展开运算符:', [...range]); // [1,2,3,4]

// ============================================================
// 三、生成器函数：function* + yield，自动实现迭代器协议（无需手写 next）
// ============================================================
log('===== 三、生成器 function* / yield =====');

// 调用生成器函数不会立即执行函数体，而是返回一个"生成器对象"（既是迭代器又可迭代）
function* countGen(start, end) {
  for (let i = start; i <= end; i++) {
    // 每个 yield 都会"暂停"函数并交出一个值；下次 next() 再从这里"恢复"
    yield i;
  }
}

const gen = countGen(1, 3);
log('  gen.next():', JSON.stringify(gen.next())); // {value:1, done:false} 执行到第 1 个 yield 暂停
log('  gen.next():', JSON.stringify(gen.next())); // {value:2, done:false} 从暂停处恢复
log('  gen.next():', JSON.stringify(gen.next())); // {value:3, done:false}
log('  gen.next():', JSON.stringify(gen.next())); // {value:undefined, done:true}
log('  生成器也能 for...of:', [...countGen(10, 12)]); // [10,11,12]

// ============================================================
// 四、惰性求值：生成器按需产生值，可表示"无限序列"
// ============================================================
log('===== 四、惰性求值（无限序列）=====');

function* naturals() {
  let n = 1;
  while (true) {
    yield n++; // 不会一次性算完，要一个才给一个
  }
}

const nat = naturals();
const firstFive = [];
for (let i = 0; i < 5; i++) firstFive.push(nat.next().value);
log('  自然数前 5 个:', firstFive); // [1,2,3,4,5]（背后是无限序列，只取了 5 个）

// ============================================================
// 五、用生成器为对象实现 Symbol.iterator（最简洁的可迭代写法）
// ============================================================
log('===== 五、用生成器实现迭代器 =====');

const fibonacci = {
  count: 7,
  // 直接用生成器方法当作 [Symbol.iterator]，省去手写 next
  *[Symbol.iterator]() {
    let [a, b] = [0, 1];
    for (let i = 0; i < this.count; i++) {
      yield a;
      [a, b] = [b, a + b];
    }
  },
};
log('  斐波那契:', [...fibonacci]); // [0,1,1,2,3,5,8]
