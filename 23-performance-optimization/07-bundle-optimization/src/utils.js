// src/utils.js —— 自写工具库，导出多个「命名导出」函数。
// tree-shaking 的前提：使用 ESM 的 export / import（静态结构，编译期可分析），
// 而不是 CommonJS 的 module.exports（运行期动态，无法静态裁剪）。
//
// 下面每个函数体里都塞了一段「占位注释 + 逻辑」，让它们各自有可观的体积，
// 这样在 dist / stats.html 里能清楚看到：没被用到的函数会不会出现在产物中。

/**
 * 数组去重（本 demo 会用到）
 */
export function unique(arr) {
  // 使用 Set 去重，再转回数组
  return Array.from(new Set(arr))
}

/**
 * 首字母大写（本 demo 会用到）
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ↓↓↓ 下面这些函数在 main-good.js 里【不会被引用】，
//     优化后它们应当被 tree-shake 彻底删除，不出现在最终产物里。↓↓↓

/**
 * 深拷贝（demo 不用 —— 应被裁剪）
 */
export function deepClone(obj) {
  // 用一段较长的实现制造体积，方便在体积图里辨认
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item))
  const result = {}
  for (const key of Object.keys(obj)) {
    result[key] = deepClone(obj[key])
  }
  return result
}

/**
 * 防抖（demo 不用 —— 应被裁剪）
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流（demo 不用 —— 应被裁剪）
 */
export function throttle(fn, interval = 300) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn.apply(this, args)
    }
  }
}

/**
 * 千分位格式化（demo 不用 —— 应被裁剪）
 */
export function formatThousands(num) {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 生成随机颜色（demo 不用 —— 应被裁剪）
 */
export function randomColor() {
  const hex = Math.floor(Math.random() * 0xffffff).toString(16)
  return '#' + hex.padStart(6, '0')
}
