/**
 * 04 · SourceMap 还原压缩代码定位
 *
 * 目标：生产代码被压缩（minify）后，浏览器抛出的错误堆栈只会给出
 *       min.js 的 (line:column)，人类无法阅读。SourceMap（.map 文件）
 *       就是一张「压缩位置 → 源码位置」的对照表。
 *
 * 本 demo 完全离线：内置一张真实的 sourcemap，手写一个 Base64 VLQ 解码器，
 * 把 mappings 解析出来，然后根据你输入的 (生成行, 生成列) 查到对应的
 * 「源文件 / 源行 / 源列 / 符号名」。
 */

// ---------------------------------------------------------------------------
// 1. 一张真实、可验证的 SourceMap（version 3 标准）
// ---------------------------------------------------------------------------
// 场景：源码 app.js 里有 greet() 函数和 message 变量，被压缩成 min.js。
// mappings 字段用逗号分隔「段(segment)」、分号分隔「生成行」，每段是 VLQ 编码。
var rawSourceMap = {
  version: 3,
  file: "min.js",
  sources: ["app.js"],
  names: ["greet", "message"],
  // 这段 mappings 是经过严格验证的（见 README）：
  //   生成行1: 段"AAAA" 和 段"QAAIA"
  //   生成行2: 段"EACFC"
  mappings: "AAAA,QAAIA;EACFC"
};

// 为了让读者有直观对照，这里放一份「假想的」源码与压缩后代码文本。
var appJsSource =
  'function greet(name) {\n' +          // 源码第 1 行
  '  var message = "Hi " + name;\n' +   // 源码第 2 行
  '  return message;\n' +
  '}';

var minJsSource =
  'function greet(a){/* min */}\n' +    // 生成第 1 行，列 8 附近是 "greet"
  '  var m="Hi "+a;';                   // 生成第 2 行

// 把两份源码展示到页面上
document.getElementById("minSrc").textContent = minJsSource;
document.getElementById("mapSrc").textContent = JSON.stringify(rawSourceMap, null, 2);

// ---------------------------------------------------------------------------
// 2. 手写 Base64 VLQ 解码器
// ---------------------------------------------------------------------------
// Base64 字符表（注意：这是 sourcemap 专用的 Base64，顺序固定）
var BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// 建立「字符 → 数值(0~63)」的查表，加速解码
var charToInt = {};
for (var i = 0; i < BASE64_CHARS.length; i++) {
  charToInt[BASE64_CHARS[i]] = i;
}

/**
 * 解码一个 VLQ 字符串（可能包含多个数值），返回数值数组。
 *
 * VLQ（Variable Length Quantity）规则：
 *  - 每个 Base64 字符解出 6 bit（0~63）。
 *  - 最高位（第 6 位，值 32）是 continuation bit：为 1 表示「后面还有字符属于同一个数」。
 *  - 低 5 bit 是数据位，按小端（先低位后高位）依次拼接。
 *  - 拼好后，整个数的「最低位」是符号位：1 表示负数。
 */
function decodeVLQ(str) {
  var result = [];
  var index = 0;
  while (index < str.length) {
    var value = 0;   // 当前数字累积值
    var shift = 0;   // 当前位移量
    var continuation;
    do {
      var digit = charToInt[str[index++]];        // 取一个 Base64 字符 → 0~63
      continuation = digit & 32;                  // 第 6 位：是否还有后续
      value += (digit & 31) << shift;             // 取低 5 位数据，按位移拼接
      shift += 5;
    } while (continuation);

    // 取出符号位（最低位），再右移 1 位得到真正的数值
    var isNegative = value & 1;
    value >>= 1;
    result.push(isNegative ? -value : value);
  }
  return result;
}

// ---------------------------------------------------------------------------
// 3. 解析整段 mappings → 结构化的映射记录
// ---------------------------------------------------------------------------
// 每个字段都是「相对上一段的增量」，需要累加还原成绝对值。
// 一段可能是 1、4 或 5 个字段：
//   [0] 生成列（相对上一段，同一行内累加；换行时归零）
//   [1] 源文件索引（相对上一次）
//   [2] 源行       （相对上一次）
//   [3] 源列       （相对上一次）
//   [4] 符号名索引 （相对上一次，可选）
function parseMappings(mappings) {
  var records = [];
  var lines = mappings.split(";");

  // 这些「源相关」的累加器跨行持续累加（只有生成列每换一行归零）
  var sourceIndex = 0;
  var sourceLine = 0;
  var sourceCol = 0;
  var nameIndex = 0;

  for (var li = 0; li < lines.length; li++) {
    var generatedCol = 0; // 每一生成行开头，生成列归零
    var segments = lines[li].split(",");

    for (var si = 0; si < segments.length; si++) {
      var seg = segments[si];
      if (!seg) continue; // 空段（比如连续逗号）跳过
      var fields = decodeVLQ(seg);

      generatedCol += fields[0];
      var rec = {
        generatedLine: li,      // 0 基
        generatedColumn: generatedCol
      };

      if (fields.length >= 4) {
        sourceIndex += fields[1];
        sourceLine += fields[2];
        sourceCol += fields[3];
        rec.sourceIndex = sourceIndex;
        rec.sourceLine = sourceLine;
        rec.sourceColumn = sourceCol;
      }
      if (fields.length >= 5) {
        nameIndex += fields[4];
        rec.nameIndex = nameIndex;
      }
      records.push(rec);
    }
  }
  return records;
}

// 预先解析好整张表
var allMappings = parseMappings(rawSourceMap.mappings);
console.log("[SourceMap] 解析出的全部映射记录：", allMappings);

// ---------------------------------------------------------------------------
// 4. 查找：给定压缩后的 (生成行, 生成列)，返回还原后的源码位置
// ---------------------------------------------------------------------------
// 规则：在同一生成行里，找到「生成列 <= 目标列」中最靠右的那一段，
//       它就是覆盖该位置的映射。
function originalPositionFor(generatedLine, generatedColumn) {
  var candidates = allMappings.filter(function (m) {
    return m.generatedLine === generatedLine &&
           m.generatedColumn <= generatedColumn &&
           m.sourceIndex !== undefined;
  });
  if (candidates.length === 0) return null;
  // 取生成列最大的那一段
  candidates.sort(function (a, b) { return a.generatedColumn - b.generatedColumn; });
  var best = candidates[candidates.length - 1];
  return {
    source: rawSourceMap.sources[best.sourceIndex],
    line: best.sourceLine + 1,     // 对外显示成 1 基，更符合编辑器习惯
    column: best.sourceColumn,
    name: best.nameIndex !== undefined ? rawSourceMap.names[best.nameIndex] : null
  };
}

// ---------------------------------------------------------------------------
// 5. 把结果渲染进捕获面板
// ---------------------------------------------------------------------------
var panel = document.getElementById("panel");

function restore(genLineOneBased, genCol) {
  var genLine0 = genLineOneBased - 1; // 内部用 0 基
  var pos = originalPositionFor(genLine0, genCol);

  var row = document.createElement("div");
  row.className = "row";
  if (!pos) {
    row.innerHTML =
      '<span class="from">min.js ' + genLineOneBased + ':' + genCol + '</span>' +
      ' <span class="k">→ 未找到映射（该位置没有对应源码记录）</span>';
    console.warn("[SourceMap] 未找到映射：", genLineOneBased, genCol);
  } else {
    row.innerHTML =
      '<span class="from">压缩位置 min.js ' + genLineOneBased + ':' + genCol + '</span>' +
      ' <span class="k">还原为</span> ' +
      '<span class="to">' + pos.source + ' ' + pos.line + ':' + pos.column + '</span>' +
      (pos.name ? ' <span class="k">符号名</span> <span class="name">' + pos.name + '</span>' : '');
    console.log("[SourceMap] 还原结果：", pos);
  }
  panel.appendChild(row);
}

// ---------------------------------------------------------------------------
// 6. 交互绑定
// ---------------------------------------------------------------------------
document.getElementById("restoreBtn").addEventListener("click", function () {
  var line = parseInt(document.getElementById("line").value, 10) || 1;
  var col = parseInt(document.getElementById("col").value, 10) || 0;
  restore(line, col);
});
document.getElementById("presetA").addEventListener("click", function () {
  restore(1, 8); // 应还原到 app.js 1:4 greet
});
document.getElementById("presetB").addEventListener("click", function () {
  restore(2, 2); // 应还原到 app.js 2:2 message
});

// 页面加载即演示一次，读者一打开就能看到效果
restore(1, 8);
