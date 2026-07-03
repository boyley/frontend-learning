// 一个“外部依赖”：假装去查某地区的税率（真实场景是网络请求）
// 测试时我们不想真发请求 → 用 vi.mock 把整个模块替换掉。
export async function getTaxRate(region) {
  // 模拟异步网络
  await new Promise((r) => setTimeout(r, 10));
  const table = { CN: 0.13, US: 0.07, JP: 0.1 };
  if (!(region in table)) throw new Error(`未知地区: ${region}`);
  return table[region];
}
