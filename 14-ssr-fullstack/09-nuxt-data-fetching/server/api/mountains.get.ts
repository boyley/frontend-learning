// 服务端 API 路由：文件名 mountains.get.ts
//   - 位置 server/api/ -> 自动映射到 URL /api/mountains
//   - 后缀 .get      -> 只匹配 HTTP GET 方法（还有 .post / .put / .delete ...）
// 这段代码只在「服务器」运行，永远不会打包进浏览器，
// 所以里面可以安全地访问数据库、密钥、文件系统等。
//
// defineEventHandler 是 Nitro（Nuxt 的服务端引擎）提供的，自动导入，无需 import。

interface Mountain {
  id: number
  name: string
  height: number // 海拔（米）
  country: string
}

// 写死一份山峰数据，模拟「数据库/第三方接口」的返回。
const mountains: Mountain[] = [
  { id: 1, name: '珠穆朗玛峰 (Everest)', height: 8848, country: '中国 / 尼泊尔' },
  { id: 2, name: '乔戈里峰 (K2)', height: 8611, country: '中国 / 巴基斯坦' },
  { id: 3, name: '干城章嘉峰 (Kangchenjunga)', height: 8586, country: '印度 / 尼泊尔' },
  { id: 4, name: '洛子峰 (Lhotse)', height: 8516, country: '中国 / 尼泊尔' },
  { id: 5, name: '马卡鲁峰 (Makalu)', height: 8485, country: '中国 / 尼泊尔' },
]

export default defineEventHandler((event) => {
  // getQuery 读取 URL 查询参数，例如 /api/mountains?id=2
  const query = getQuery(event)

  if (query.id) {
    const id = Number(query.id)
    const found = mountains.find((m) => m.id === id)
    if (!found) {
      // createError 生成规范的 HTTP 错误，客户端 useFetch/useAsyncData 的 error 会拿到它
      throw createError({ statusCode: 404, statusMessage: `找不到 id=${id} 的山峰` })
    }
    return found // 直接 return 对象/数组，Nitro 自动序列化成 JSON
  }

  // 不带 id 时返回整个列表
  return mountains
})
