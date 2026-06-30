// my-banner-plugin.js —— 一个「手写的 Vite 插件」，演示插件机制
//
// Vite 插件本质就是一个返回「对象」的函数，对象里写若干「钩子（hook）」。
// Vite 在构建的不同阶段会调用这些钩子。Vite 插件兼容 Rollup 的插件钩子。
//
// 本插件做两件事：
//   ① transform 钩子：给每个 .js 文件顶部自动加一行版权注释横幅（banner）
//   ② transformIndexHtml 钩子：往 index.html 注入一段构建时间

/**
 * @param {{ author?: string }} options 插件配置项
 * @returns {import('vite').Plugin}
 */
export default function myBannerPlugin(options = {}) {
  const author = options.author || '匿名';
  const banner = `/* 本文件由 my-banner-plugin 处理 · 作者：${author} */\n`;

  return {
    // 插件名，必填，出错时方便定位
    name: 'vite-plugin-my-banner',

    // enforce 控制插件执行顺序：'pre'(靠前) | 默认 | 'post'(靠后)
    enforce: 'pre',

    // ① transform 钩子：每个模块的源码经过它处理一次
    //    code = 源码字符串，id = 文件绝对路径
    transform(code, id) {
      // 只处理项目自己的 .js（跳过 node_modules，避免给第三方库乱加注释）
      if (id.endsWith('.js') && !id.includes('node_modules')) {
        return {
          code: banner + code, // 在源码顶部加 banner
          map: null,           // 这里不改动行号映射，简单返回 null
        };
      }
      // 返回 undefined / null 表示「这个模块我不处理，交给下一个插件」
    },

    // ② transformIndexHtml 钩子：专门用来改 index.html
    transformIndexHtml(html) {
      const time = new Date().toLocaleString('zh-CN');
      // 在 </body> 前插入一段构建信息
      return html.replace(
        '</body>',
        `  <p style="color:#aaa;font-size:12px">⏱ 由插件注入的构建时间：${time}</p>\n</body>`
      );
    },

    // configResolved 钩子：配置解析完成后调用，常用来读取最终配置
    configResolved(resolvedConfig) {
      console.log(`[my-banner-plugin] 当前命令 = ${resolvedConfig.command}, 作者 = ${author}`);
    },
  };
}
