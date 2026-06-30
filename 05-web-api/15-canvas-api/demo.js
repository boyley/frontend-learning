// ============================================================
// Canvas 2D 绘图 Demo
//   1) 基本图形示例：矩形 / 圆 / 线 / 文字
//   2) 简易画板：鼠标按下拖动绘制，可选颜色 / 线宽 / 清空
// ============================================================

// ------------------------------------------------------------
// Part 1：基本图形示例
//   getContext('2d') 拿到 2D 绘图上下文（CanvasRenderingContext2D）
//   坐标系：左上角为原点 (0,0)，x 向右、y 向下
// ------------------------------------------------------------
const shapeCanvas = document.querySelector('#shapeCanvas');
const sctx = shapeCanvas.getContext('2d');

function drawShapes() {
  // clearRect(x, y, w, h)：清空一块区域（这里清空整个画布）
  sctx.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);

  // —— 填充矩形 fillRect —— //
  sctx.fillStyle = '#4f46e5';            // 填充色
  sctx.fillRect(20, 20, 100, 60);        // (x, y, 宽, 高)

  // —— 描边矩形 strokeRect —— //
  sctx.strokeStyle = '#e11d48';          // 描边色
  sctx.lineWidth = 3;                    // 线宽
  sctx.strokeRect(140, 20, 100, 60);

  // —— 圆形：路径 + arc —— //
  sctx.beginPath();                      // 开始一条新路径
  // arc(圆心x, 圆心y, 半径, 起始弧度, 结束弧度)
  sctx.arc(310, 50, 32, 0, Math.PI * 2);
  sctx.fillStyle = '#16a34a';
  sctx.fill();                           // 填充路径
  sctx.strokeStyle = '#065f46';
  sctx.lineWidth = 2;
  sctx.stroke();                         // 描边路径

  // —— 折线：moveTo / lineTo —— //
  sctx.beginPath();
  sctx.moveTo(20, 130);                  // 抬笔移动到起点
  sctx.lineTo(90, 170);                  // 画线到下一点
  sctx.lineTo(160, 120);
  sctx.lineTo(230, 175);
  sctx.strokeStyle = '#f59e0b';
  sctx.lineWidth = 4;
  sctx.stroke();

  // —— 三角形：闭合路径 closePath —— //
  sctx.beginPath();
  sctx.moveTo(280, 175);
  sctx.lineTo(330, 110);
  sctx.lineTo(380, 175);
  sctx.closePath();                      // 自动连回起点，闭合
  sctx.fillStyle = 'rgba(99,102,241,.5)';
  sctx.fill();
  sctx.strokeStyle = '#4f46e5';
  sctx.stroke();

  // —— 文字 fillText —— //
  sctx.fillStyle = '#111';
  sctx.font = 'bold 16px sans-serif';
  sctx.fillText('Canvas 2D 基本图形', 20, 205);
}
drawShapes();

// ------------------------------------------------------------
// Part 2：简易画板
//   关键点：canvas 的 width/height 要用「属性」设置，决定位图分辨率；
//   鼠标坐标要减去 canvas 在页面中的偏移（getBoundingClientRect）
// ------------------------------------------------------------
const board = document.querySelector('#board');
const bctx = board.getContext('2d');
const colorInput = document.querySelector('#color');
const widthInput = document.querySelector('#lineWidth');
const widthLabel = document.querySelector('#widthLabel');
const clearBtn = document.querySelector('#clearBoard');

let drawing = false; // 是否处于「按下并拖动」状态

/**
 * 把鼠标 / 触摸的「视口坐标」换算成「canvas 内部坐标」。
 * 必须减去 canvas 的 left/top 偏移；若 CSS 显示尺寸与 width/height
 * 属性不一致，还要按比例缩放（这里用 scaleX/scaleY 兼容）。
 */
function getPos(evt) {
  const rect = board.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
  const scaleX = board.width / rect.width;
  const scaleY = board.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function startDraw(evt) {
  drawing = true;
  const { x, y } = getPos(evt);
  bctx.beginPath();      // 开新路径
  bctx.moveTo(x, y);     // 落笔
}

function moveDraw(evt) {
  if (!drawing) return;
  evt.preventDefault();  // 触摸时阻止页面滚动
  const { x, y } = getPos(evt);
  bctx.lineTo(x, y);             // 连到当前位置
  bctx.strokeStyle = colorInput.value;
  bctx.lineWidth = Number(widthInput.value);
  bctx.lineCap = 'round';        // 线帽圆润，画起来顺滑
  bctx.lineJoin = 'round';       // 拐角圆润
  bctx.stroke();                 // 实际绘制
}

function endDraw() {
  drawing = false;
}

// 鼠标事件
board.addEventListener('mousedown', startDraw);
board.addEventListener('mousemove', moveDraw);
window.addEventListener('mouseup', endDraw); // 抬起绑 window，移出画布也能结束

// 触摸事件（移动端）
board.addEventListener('touchstart', startDraw, { passive: false });
board.addEventListener('touchmove', moveDraw, { passive: false });
board.addEventListener('touchend', endDraw);

// 线宽滑块实时显示
widthInput.addEventListener('input', () => {
  widthLabel.textContent = widthInput.value + ' px';
});

// 清空画板
clearBtn.addEventListener('click', () => {
  bctx.clearRect(0, 0, board.width, board.height);
});

// ------------------------------------------------------------
// Part 3：requestAnimationFrame 动画——一个绕圈的小球
//   rAF 在每次浏览器重绘前调用回调，约 60fps，比 setInterval 更平滑
// ------------------------------------------------------------
const animCanvas = document.querySelector('#animCanvas');
const actx = animCanvas.getContext('2d');
let angle = 0;

function animate() {
  actx.clearRect(0, 0, animCanvas.width, animCanvas.height);

  const cx = animCanvas.width / 2;
  const cy = animCanvas.height / 2;
  const r = 50; // 轨道半径
  const x = cx + Math.cos(angle) * r;
  const y = cy + Math.sin(angle) * r;

  // 轨道
  actx.beginPath();
  actx.arc(cx, cy, r, 0, Math.PI * 2);
  actx.strokeStyle = '#ddd';
  actx.lineWidth = 1;
  actx.stroke();

  // 小球
  actx.beginPath();
  actx.arc(x, y, 12, 0, Math.PI * 2);
  actx.fillStyle = '#4f46e5';
  actx.fill();

  angle += 0.04;                  // 每帧推进角度
  requestAnimationFrame(animate); // 预约下一帧
}
animate();
