// ============================================================
// 03 · DOM 事件基础 demo
// 演示：addEventListener / event 对象 / removeEventListener /
//       preventDefault / stopPropagation / 各种事件类型 / once 选项
// ============================================================

// ---------- ① click 计数 + once ----------
var count = 0;
var countNum = document.getElementById('countNum');

document.getElementById('countBtn').addEventListener('click', function (event) {
  count++;
  countNum.textContent = count;
  // event 对象：type 是事件类型，target 是真正触发事件的元素
  console.log('事件类型 event.type =', event.type, '；target =', event.target);
});

// once: true —— handler 触发一次后自动移除监听，无需手动 removeEventListener
document.getElementById('onceBtn').addEventListener('click', function (event) {
  // this 指向绑定监听的元素（即按钮本身），等价于 event.currentTarget
  this.textContent = '已用掉了（once）';
  this.disabled = true;
  document.getElementById('countOut').firstChild.nodeValue = '上面这个按钮用了 { once: true }，只能点一次。点击次数：';
}, { once: true });

// ---------- ② input 实时回显 ----------
var echoOut = document.getElementById('echoOut');
document.getElementById('echoInput').addEventListener('input', function (event) {
  // input 事件：每次内容变化（输入/删除/粘贴）都触发，event.target.value 是当前值
  var v = event.target.value;
  echoOut.textContent = v ? ('实时内容：' + v) : '你输入的内容会实时出现在这里…';
});

// ---------- ③ keydown 显示按键 ----------
var keyOut = document.getElementById('keyOut');
document.getElementById('keyInput').addEventListener('keydown', function (event) {
  // keydown：event.key 是按键的字符值，event.code 是物理键位
  keyOut.innerHTML =
    '<span class="key">' + event.key + '</span>' +
    '   key="' + event.key + '"   code="' + event.code + '"' +
    (event.ctrlKey ? '  +Ctrl' : '') +
    (event.shiftKey ? '  +Shift' : '') +
    (event.altKey ? '  +Alt' : '');
});

// ---------- ④ mousemove 鼠标坐标 ----------
var mouseArea = document.getElementById('mouseArea');
var mouseOut = document.getElementById('mouseOut');
mouseArea.addEventListener('mousemove', function (event) {
  // offsetX/offsetY：相对于触发元素左上角的坐标
  mouseOut.textContent = '区域内坐标 (offsetX, offsetY) = (' +
    event.offsetX + ', ' + event.offsetY + ')   |   页面坐标 (clientX, clientY) = (' +
    event.clientX + ', ' + event.clientY + ')';
});

// ---------- ⑤ preventDefault 阻止链接跳转 ----------
var pdOut = document.getElementById('pdOut');
document.getElementById('preventLink').addEventListener('click', function (event) {
  // preventDefault：阻止元素的默认行为（这里是 <a> 的跳转）
  event.preventDefault();
  pdOut.textContent = '已调用 event.preventDefault()，链接没有跳转！（默认行为被取消）';
});
document.getElementById('normalLink').addEventListener('click', function () {
  pdOut.textContent = '普通链接：未阻止默认行为，会在新标签页打开。';
});

// ---------- ⑥ 冒泡 / stopPropagation / removeEventListener ----------
var bubbleOut = document.getElementById('bubbleOut');
var outer = document.getElementById('outer');
var inner = document.getElementById('inner');
var stopChk = document.getElementById('stopChk');

// 关键点：removeEventListener 必须传「同一个函数引用」才能移除，
// 所以这里把 handler 抽成具名函数，而不是匿名函数。
function outerHandler(event) {
  // currentTarget 永远是「绑定监听的元素」(outer)；target 是最初被点的元素
  appendBubble('outer 被触发  | target=' + event.target.id + '  currentTarget=' + event.currentTarget.id);
}

function innerHandler(event) {
  appendBubble('inner 被触发（先于 outer，因为事件从内往外冒泡）');
  if (stopChk.checked) {
    // stopPropagation：阻止事件继续向上冒泡，outer 的 handler 不会再被触发
    event.stopPropagation();
    appendBubble('→ 已 stopPropagation，冒泡被截断，outer 不会触发');
  }
}

outer.addEventListener('click', outerHandler);
inner.addEventListener('click', innerHandler);

var bubbleLog = [];
function appendBubble(msg) {
  bubbleLog.push(msg);
  if (bubbleLog.length > 4) bubbleLog.shift();
  bubbleOut.textContent = bubbleLog.join('\n');
}
// 每次点击前清空一下日志，便于观察单次冒泡顺序
outer.addEventListener('click', function () {}, false);
outer.addEventListener('mousedown', function () { bubbleLog = []; });

// 移除 outer 监听器：因为用的是具名函数 outerHandler，可以正确移除
document.getElementById('removeBtn').addEventListener('click', function () {
  outer.removeEventListener('click', outerHandler);
  appendBubble('已 removeEventListener：再点 outer 不会触发它的 handler 了。');
  this.disabled = true;
  this.textContent = '已移除';
});
