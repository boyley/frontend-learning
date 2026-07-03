// 14-middleware-compose-principle —— 手写 koa-compose 核心算法
//
// 目标：把「中间件数组」组合成「一个函数」，调用它就能触发洋葱模型执行。
// 这就是 Koa 洋葱模型的底层引擎（koa-compose 包的核心逻辑），仅约 20 行。
//
// 原理一句话：用递归的 dispatch(i) 逐个执行中间件，
// 把「执行下一个中间件」这件事包装成 next（即 dispatch(i+1)）传给当前中间件；
// 每个 dispatch 都返回 Promise，await next() 就能挂起/恢复，形成对称的去程+回程。

/**
 * compose：把中间件数组组合成一个可执行函数
 * @param {Array<Function>} middleware 中间件数组，每个是 async (ctx, next) => {}
 * @returns {Function} 组合后的函数 (ctx, next?) => Promise
 */
function compose(middleware) {
  // 防御性校验：必须是数组，且元素必须是函数
  if (!Array.isArray(middleware)) {
    throw new TypeError('中间件集合必须是数组 Array!');
  }
  for (const fn of middleware) {
    if (typeof fn !== 'function') {
      throw new TypeError('中间件必须是函数 Function!');
    }
  }

  // 返回「组合后的函数」。ctx 是上下文；next 是可选的「最外层之外」的收尾函数
  return function composed(ctx, next) {
    // index 记录「上一次被调用的中间件下标」，用于检测同一个中间件里 next() 被调用多次
    let index = -1;

    // 递归调度器：执行第 i 个中间件
    function dispatch(i) {
      // ── 关键：防止同一个中间件里多次调用 next() ──
      // 正常情况下 i 一定大于上一次的 index（严格递增）。
      // 如果 i <= index，说明当前中间件里 next() 被调用了不止一次 → 抛错。
      if (i <= index) {
        return Promise.reject(new Error('next() 在同一个中间件里被调用了多次!'));
      }
      index = i; // 记录本次调度到的下标

      // 取出第 i 个中间件。当 i === middleware.length 时，fn 是 undefined，
      // 此时用外部传入的 next 作为「最内层再往里」的收尾（通常没有，就 undefined）
      let fn = middleware[i];
      if (i === middleware.length) fn = next;

      // 没有中间件可执行了（洋葱到底了）→ 返回一个已 resolve 的 Promise，开始回程
      if (!fn) return Promise.resolve();

      // ── 核心：执行当前中间件 fn(ctx, next) ──
      // 第二个参数就是「下一个中间件的触发器」：一个返回 Promise 的函数 () => dispatch(i+1)
      // 当前中间件里 await next() 时，实际就是 await dispatch(i+1)，
      // 于是控制权递归进入下一层；下一层的 Promise resolve 后，当前 await 才恢复（回程）。
      // 用 Promise.resolve(...) 包一层：即使中间件不是 async（返回非 Promise），也能统一 .then/await。
      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        // 中间件同步抛错，也转成 rejected Promise，保证外层能用 catch 兜住
        return Promise.reject(err);
      }
    }

    // 从第 0 个中间件开始整条链
    return dispatch(0);
  };
}

module.exports = compose;
