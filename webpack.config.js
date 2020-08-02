require('dotenv/config')
const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const clientPath = path.join(__dirname, 'client')
const publicPath = path.join(__dirname, 'server', 'public')

module.exports = {
  entry: {
    main: path.join(clientPath, 'app'),
    tester: path.join(clientPath, 'test')
  },
  output: {
    filename: '[name].js',
    path: publicPath
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.ttf$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['html', 'css', 'javascript']
    })
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: publicPath,
    historyApiFallback: true,
    host: '0.0.0.0',
    port: process.env.DEV_SERVER_PORT,
    proxy: {
      '/api': `http://localhost:${process.env.PORT}`
    },
    stats: 'minimal',
    watchContentBase: true
  }
}
