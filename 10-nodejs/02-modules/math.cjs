// ============================================================
// CommonJS 模块（.cjs 后缀强制按 CommonJS 解析）
// 导出方式：module.exports / exports
// ============================================================

// 一个内部私有函数，不导出，外部无法访问（模块作用域天然隔离）
function log(msg) {
  console.log('[math.cjs]', msg);
}

// 方式一：给 exports 挂属性（exports 是 module.exports 的引用别名）
exports.add = function (a, b) {
  log(`add(${a}, ${b})`);
  return a + b;
};

exports.sub = function (a, b) {
  return a - b;
};

// 方式二：直接整体赋值给 module.exports（会覆盖上面的 exports，所以这里用 Object.assign 合并）
// 切记：写 `exports = {...}` 是无效的（断开了引用），必须写 `module.exports = {...}`。
module.exports.PI = 3.14159;
