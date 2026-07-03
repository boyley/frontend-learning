// src/main-bad.js —— ❌ 未优化写法（整包 / 命名空间导入）
//
// 反模式 1：import * as utils 命名空间导入。
//   这会把 utils.js 的「整个命名空间对象」引入。虽然现代 Rollup 仍能对
//   命名空间访问做一定裁剪，但一旦你把 utils 整体传给别处（如 window.utils = utils，
//   或动态 utils[name]()），打包器就无法确定哪些成员被用到，只能【全部保留】。
//   下面就故意制造了这种「动态访问 + 挂到全局」的无法静态分析场景。
import * as utils from './utils.js'

// 演示逻辑：其实业务只需要 unique + capitalize 两个函数。
const list = ['vue', 'react', 'vue', 'svelte', 'react']
const deduped = utils.unique(list)
const title = utils.capitalize('performance')

// ❌ 关键：把整个 utils 挂到全局，并用变量名动态取函数。
//    这让 deepClone / debounce / throttle / formatThousands / randomColor
//    即使没被直接调用，也【无法被裁剪】—— 打包器必须假设它们可能被 utils[x]() 用到。
window.utils = utils
const dynamicName = Math.random() > 2 ? 'deepClone' : 'unique' // 永远取 unique，但打包器不知道
utils[dynamicName]([1, 2])

document.querySelector('#app').innerHTML = `
  <h1>❌ 未优化（main-bad.js）</h1>
  <p>去重结果：${deduped.join(', ')}</p>
  <p>标题：${title}</p>
  <p>整个工具库（含未用函数）都被打进产物。打开 dist/stats.html 看体积。</p>
`
