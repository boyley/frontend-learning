/**
 * 加载态 UI（loading.js 约定）。
 *
 * App Router 约定：某个路由段下放一个 loading.js，
 * 当该段（及其子页面）正在服务端渲染/取数、还没就绪时，
 * Next 会自动先展示这里返回的内容（底层用 React <Suspense> 实现）。
 *
 * 本示例页面渲染很快，通常一闪而过甚至看不到；
 * 真实项目里页面有较慢的数据请求时，用户就会先看到这个占位。
 */
export default function BlogLoading() {
  return <p style={{ color: "#999" }}>⏳ 博客文章加载中…</p>;
}
