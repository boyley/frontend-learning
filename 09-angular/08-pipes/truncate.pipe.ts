/**
 * truncate.pipe.ts
 * ------------------------------------------------------------------
 * 自定义管道：把过长的字符串截断，并在末尾加省略号。
 *
 * 管道（Pipe）的作用：在模板里「转换显示值」，不修改源数据。
 * 用法：{{ longText | truncate:20:'…' }}
 *                          └参数1┘ └参数2┘
 *
 * standalone:true → 现代 Angular 管道默认独立，组件直接 imports 即可，无需 NgModule。
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate', // 模板中使用的名字：| truncate
  standalone: true,
  pure: true, // 纯管道（默认）：输入不变就不重新计算，性能好
})
export class TruncatePipe implements PipeTransform {
  /**
   * @param value   待转换的原始字符串（管道左边的值）
   * @param limit   最大保留字符数，默认 20（第一个参数 :limit）
   * @param ellipsis 截断后追加的后缀，默认 '…'（第二个参数 :ellipsis）
   */
  transform(value: string | null | undefined, limit = 20, ellipsis = '…'): string {
    if (!value) return ''; // 防御：null/undefined/空串
    if (value.length <= limit) return value; // 没超长，原样返回
    return value.slice(0, limit).trimEnd() + ellipsis;
  }
}
