// 首页：这是一个 async Server Component。
// 在 App Router 里，Server Component 可以直接写成 async 函数，
// 然后在函数体内 await fetch(...) 取数据 —— 不需要 getServerSideProps / getStaticProps。
//
// 本文件的核心是演示【同一个 API】用三种不同的 fetch 配置，
// 分别得到 CSR 风格(动态)、SSG(构建时静态)、ISR(定时再验证) 三种缓存行为。

import Link from "next/link";

const API = "https://jsonplaceholder.typicode.com/posts?_limit=5";

// ---------------------------------------------------------------------------
// 策略一：默认不缓存（动态渲染，每次请求都取新数据）
//
// 重要变化（Next 16.x / 15.x）：fetch 请求【默认不再缓存】。
// 也就是说不写任何 cache 配置时，等价于以前的 { cache: 'no-store' }：
// 每一次请求进来都会真正去打这个 API，并阻塞渲染直到数据回来。
// 适合“实时性要求高、数据经常变”的场景（类似 SSR 每次现取）。
async function getDefault() {
  const res = await fetch(API); // 默认不缓存
  return res.json();
}

// ---------------------------------------------------------------------------
// 策略二：ISR（增量静态再生）—— { next: { revalidate: 60 } }
//
// 第一次请求时把结果缓存下来（静态化）；此后 60 秒内所有请求都直接命中缓存，
// 秒开且不打 API。60 秒过期后的第一个请求仍然先返回旧缓存（stale），
// 同时在后台重新取一次并更新缓存，下一个请求就能拿到新版本。
// 这就是“stale-while-revalidate”：既快又能定期刷新。
async function getISR() {
  const res = await fetch(API, { next: { revalidate: 60 } });
  return res.json();
}

// ---------------------------------------------------------------------------
// 策略三：force-cache（构建时缓存 / SSG 效果）—— { cache: 'force-cache' }
//
// 强制缓存：结果会被长期缓存，构建（next build）时就能预取并写进静态产物，
// 之后不会自动过期（除非手动 revalidate 或重新构建）。
// 适合“几乎不变”的内容，效果等同传统 SSG（构建时生成一次）。
async function getForceCache() {
  const res = await fetch(API, { cache: "force-cache" });
  return res.json();
}

export default async function Home() {
  // 注意：这三个 fetch 打的是同一个 URL，但因为 cache 配置不同，
  // Next 会分别按各自策略处理，不会被 memoize 合并（memoize 只针对完全相同的请求）。
  //
  // 关于 memoization（自动去重）：在同一次渲染的 React 组件树里，
  // 如果多个组件用【完全相同的参数】发起同一个 fetch，Next 只会真正请求一次，
  // 其余的复用同一个结果 —— 这样你可以在需要的组件里各自 fetch，而不必层层透传。
  const [defaultPosts, isrPosts, staticPosts] = await Promise.all([
    getDefault(),
    getISR(),
    getForceCache(),
  ]);

  return (
    <main>
      <h1>06 · 数据获取 / 缓存 / SSG / ISR</h1>
      <p>
        下面三个列表打的是<strong>同一个 API</strong>，只是 fetch 的缓存配置不同，
        对照体会“一行配置切换渲染策略”。
      </p>

      <Section
        title="① 默认不缓存（动态 / 每次请求现取）"
        desc="fetch(API) —— 等价 no-store，每次刷新都重新请求、阻塞渲染。"
        posts={defaultPosts}
      />

      <Section
        title="② ISR（60 秒后台再验证）"
        desc="fetch(API, { next: { revalidate: 60 } }) —— 命中缓存秒开，过期后后台更新。"
        posts={isrPosts}
      />

      <Section
        title="③ force-cache（构建时缓存 / SSG 效果）"
        desc="fetch(API, { cache: 'force-cache' }) —— 长期缓存，构建时即可静态化。"
        posts={staticPosts}
      />

      <hr style={{ margin: "32px 0" }} />

      <h2>SSG 动态路由预渲染</h2>
      <p>
        下面链接指向 <code>app/posts/[id]/page.js</code>，配合{" "}
        <code>generateStaticParams()</code> 在 <strong>next build</strong> 时把
        id 1~5 的页面预先生成为静态 HTML：
      </p>
      <ul>
        {[1, 2, 3, 4, 5].map((id) => (
          <li key={id}>
            <Link href={`/posts/${id}`}>/posts/{id}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

// 小型展示组件（纯 UI，无副作用）
function Section({ title, desc, posts }) {
  return (
    <section style={{ margin: "24px 0" }}>
      <h2 style={{ marginBottom: 4 }}>{title}</h2>
      <p style={{ margin: "0 0 8px", color: "#666", fontSize: 14 }}>{desc}</p>
      <ol>
        {posts.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ol>
    </section>
  );
}
