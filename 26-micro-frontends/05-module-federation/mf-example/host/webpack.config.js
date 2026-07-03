// ========================================================================
// host（宿主 / 消费者）应用的 Webpack 配置
// ------------------------------------------------------------------------
// 作用：本应用在运行时去「消费」remote 暴露出来的模块。
// 关键还是 ModuleFederationPlugin，但用的是 remotes 字段：
//   - remotes : 声明我要消费哪些远端。key 是本地引用名，
//               value 格式是 "远端name@远端remoteEntry地址"
//   - shared  : 与 remote 共享依赖，配置要和 remote 对得上（尤其 singleton）
// ========================================================================

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  devServer: {
    static: path.join(__dirname, 'public'),
    port: 3000, // host 跑在 3000
  },
  output: {
    publicPath: 'http://localhost:3000/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      // host 本身也可以有 name（如果它又想被别人消费的话）
      name: 'host',
      // 【remotes】声明消费的远端：
      //   本地用名 'remote'  =  远端 name 'remote'  @  远端 remoteEntry.js 的地址
      // 之后代码里就能写 import('remote/Button')：
      //   'remote' 对应这里的 key，'/Button' 对应 remote 的 exposes key './Button'
      remotes: {
        remote: 'remote@http://localhost:3001/remoteEntry.js',
      },
      // 【shared】共享依赖要和 remote 声明一致。
      // singleton=true：全页面只允许一份 lodash 实例，谁先加载用谁的；
      // 版本不满足 requiredVersion 时，控制台会给出警告。
      shared: {
        lodash: { singleton: true, requiredVersion: '^4.17.21' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
