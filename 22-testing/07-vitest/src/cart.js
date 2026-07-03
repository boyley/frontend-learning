// 购物车逻辑：纯计算 + 依赖外部税率
import { getTaxRate } from './taxApi.js';

/** 小计：所有商品 单价×数量 之和（纯函数，好测） */
export function subtotal(items) {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0);
}

/** 结账：小计 + 税（税率来自外部依赖 getTaxRate，测试时会被 mock） */
export async function checkout(items, region, notify) {
  const sub = subtotal(items);
  const rate = await getTaxRate(region);
  const total = Math.round(sub * (1 + rate) * 100) / 100;
  notify?.(`应付 ¥${total}`); // 回调，用于演示 spy/mock 函数
  return total;
}
