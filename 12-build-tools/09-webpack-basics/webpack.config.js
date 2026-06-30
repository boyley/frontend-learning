// webpack.config.js —— Webpack 5 配置（带详细中文注释）
// Webpack 用 CommonJS 写配置（module.exports），这点和 Vite（ESM）不同。
//
// 五大核心概念全在这一个文件里：entry / output / loader / plugin / mode

const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // ───────────────────────────────────────────────
  // ① entry 入口：Webpack 从这里出发，递归构建依赖图
  // ───────────────────────────────────────────────
  entry: './src/index.js',

  // ───────────────────────────────────────────────
  // ② output 出口：打包结果输出到哪、叫什么名
  // ───────────────────────────────────────────────
  output: {
    path: path.resolve(__dirname, 'dist'), // 必须是绝对路径
    filename: '[name].[contenthash].js',   // [contenthash] 带内容 hash,用于缓存失效
    clean: true,                           // 每次构建前清空 dist
  },

  // ───────────────────────────────────────────────
  // ③ module.rules 里配 loader：教 Webpack「如何处理非 JS 文件」
  //    Webpack 本身只认 JS/JSON，其它文件类型都要靠 loader 转换。
  //    loader 链式执行,顺序「从右到左 / 从下到上」。
  // ───────────────────────────────────────────────
  module: {
    rules: [
      {
        test: /\.css$/i,                    // 匹配 .css 文件
        // css-loader：解析 CSS 里的 @import / url()，把 CSS 变成 JS 模块
        // style-loader：把 CSS 通过 <style> 标签注入到页面
        // 执行顺序：css-loader 先,style-loader 后（从右到左）
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: 'asset',  // Webpack5 内置资源模块,不再需要 file-loader/url-loader
      },
      // 处理 ES6+/JSX 通常再加 babel-loader（此 demo 未引入）：
      // { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
    ],
  },

  // ───────────────────────────────────────────────
  // ④ plugins 插件：干 loader 干不了的更广泛的活
  //    （打包优化、资源管理、注入环境变量、生成 HTML 等）
  // ───────────────────────────────────────────────
  plugins: [
    // 自动生成 index.html，并把打包出的带 hash 的 js 自动注入进去
    // 这正是「Vite 的 index.html 是入口」与「Webpack 的 html 是产物」的根本差异点
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: '09 · Webpack 基础',
    }),
  ],

  // ───────────────────────────────────────────────
  // ⑤ mode 模式：development(不压缩,利调试) | production(压缩优化) | none
  //    这里通过命令行 --mode 传入,所以不在配置里写死
  // ───────────────────────────────────────────────

  // 开发服务器配置（webpack-dev-server）
  devServer: {
    static: './dist',
    port: 8090,
    open: true,
    hot: true, // 开启 HMR
  },

  // source map：开发态用 'eval-source-map' 兼顾速度和调试
  devtool: 'eval-source-map',
};
