// src/main-good.js —— ✅ 优化写法（具名按需导入）
//
// 最佳实践：只 import 你真正要用的具名导出。
//   打包器基于 ESM 的静态结构，能确定「只有 unique 和 capitalize 被引用」，
//   于是 deepClone / debounce / throttle / formatThousands / randomColor
//   这些未被引用的导出会被 tree-shake 掉，不进入最终产物。
//
//   前提：utils.js 里这些函数是「无副作用的纯导出」，且 package.json 声明 "sideEffects": false，
//        打包器才敢放心删除。
import { unique, capitalize } from './utils.js'

const list = ['vue', 'react', 'vue', 'svelte', 'react']
const deduped = unique(list)
const title = capitalize('performance')

// ✅ 不挂全局、不动态取名，一切都是编译期可分析的静态引用。

document.querySelector('#app').innerHTML = `
  <h1>✅ 已优化（main-good.js）</h1>
  <p>去重结果：${deduped.join(', ')}</p>
  <p>标题：${title}</p>
  <p>只有用到的两个函数进入产物，其余被 tree-shake。打开 dist/stats.html 对比体积。</p>
`

// ------------------------------------------------------------------
// 【按需引入 vs 整包引入】—— 以 lodash 为例的说明（本 demo 不真正安装 lodash）
// ------------------------------------------------------------------
//
// ❌ 整包引入：
//     import _ from 'lodash'
//     _.debounce(fn, 300)
//   lodash 是 CommonJS 包，且默认导出是一个「巨大的聚合对象」。
//   即便你只用 debounce，很多打包配置下也会把 ~70KB(min) 的整个 lodash 打进来。
//
// ✅ 按需引入（子路径导入）：
//     import debounce from 'lodash/debounce'
//     debounce(fn, 300)
//   只引入 debounce 这一个模块文件，体积从 ~70KB 降到 ~2KB 量级。
//
// ✅ 或使用天生 ESM、可 tree-shake 的替代：lodash-es
//     import { debounce } from 'lodash-es'
//   lodash-es 是 ESM 版本，配合 "sideEffects": false 可被打包器精确裁剪。
//
// 结论：对「聚合式大库」（lodash / antd / element-plus / rxjs 等），
//       优先用「子路径按需引入」或其 ESM 版本 + 官方按需插件，避免整包引入。
