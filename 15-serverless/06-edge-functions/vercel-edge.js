/**
 * 06 · Vercel Edge Function（边缘函数）示例
 * ---------------------------------------------------------------
 * 边缘函数跑在「离用户最近的 CDN 节点」上，用的是 Web 标准 API
 * （Request / Response / fetch），而不是 Node 的 req/res。
 * 冷启动极快（基于 V8 isolate 而非容器，见原理详解.md）。
 *
 * Vercel 约定：在 api/ 目录放文件，导出 config.runtime = 'edge'
 * 即声明这是边缘函数；默认是 Node.js serverless 函数。
 * 对照官方：https://vercel.com/docs/functions/runtimes/edge
 *
 * 文件应放在 Vercel 项目的  api/geo.js  处，部署后即得到边缘接口。
 */

// ① 声明运行时为 edge —— 这一行是「普通函数 vs 边缘函数」的开关
export const config = {
  runtime: 'edge',
};

// ② 处理函数用 Web 标准签名：接收 Request，返回 Response
export default function handler(request) {
  // 边缘节点能就近拿到用户地理信息（Vercel 注入到请求头 / geo）
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || 'world';

  // Vercel 在边缘注入 request.geo（这里做兜底，便于理解结构）
  const geo = request.geo || { city: '未知', country: '未知' };

  return new Response(
    JSON.stringify({
      message: `Hello ${name}, 你被就近的边缘节点处理了`,
      city: geo.city,
      country: geo.country,
      // Web 标准里没有 Node 的 process；边缘运行时是精简的 V8 环境
      runtime: 'edge (V8 isolate)',
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    }
  );
}
