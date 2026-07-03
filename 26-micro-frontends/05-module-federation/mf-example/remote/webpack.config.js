// ========================================================================
// remote（远端 / 生产者）应用的 Webpack 配置
// ------------------------------------------------------------------------
// 作用：把本应用构建成一个「可被别人在运行时加载」的产物。
// 关键就是 ModuleFederationPlugin：
//   - name     : 本应用在联邦里的唯一名字（host 会用这个名字引用）
//   - filename : 对外暴露的入口清单文件名，约定俗成叫 remoteEntry.js
//   - exposes  : 把哪些内部模块「暴露」出去给别人用（key 是对外路径，value 是本地文件）
//   - shared   : 与 host 共享的第三方依赖（避免 React 被下载两份、且保证单例）
// ========================================================================

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// Webpack5 内置了 Module Federation，插件从 webpack.container 里取
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  // 开发模式：产物不压缩，方便看 remoteEntry.js 内容
  mode: 'development',
  // remote 独立部署，独立跑一个 dev server，端口 3001
  devServer: {
    static: path.join(__dirname, 'public'),
    port: 3001,
    // 允许被跨域加载：host 在 3000，会来 3001 拉 remoteEntry.js，必须放开 CORS
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    // publicPath 必须写成绝对地址，否则 host 加载 remoteEntry.js 后，
    // remoteEntry.js 内部再去按需拉取分包（chunk）时会拼错路径
    publicPath: 'http://localhost:3001/',
  },
  module: {
    rules: [
      {
        // 这个最小 demo 用原生 JS 写「组件」，如果你要写 JSX 就打开 babel-loader
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      // 【name】本 remote 的全局唯一名，host 里 remotes 的 key 要和它对应
      name: 'remote',
      // 【filename】对外暴露的清单文件名，host 通过 http://localhost:3001/remoteEntry.js 加载它
      filename: 'remoteEntry.js',
      // 【exposes】暴露模块：对外叫 './Button'，实际指向本地 ./src/Button.js
      // host 里就能 import('remote/Button') 拿到它
      exposes: {
        './Button': './src/Button.js',
      },
      // 【shared】共享依赖：这里演示共享一个假设的 lodash
      // singleton=true 保证整个页面只有一份实例；requiredVersion 声明期望版本
      shared: {
        lodash: { singleton: true, requiredVersion: '^4.17.21' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
