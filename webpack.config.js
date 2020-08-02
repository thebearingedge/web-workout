require('dotenv/config')
const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const clientPath = path.join(__dirname, 'client')
const publicPath = path.join(__dirname, 'server', 'public')

module.exports = {
  entry: clientPath,
  output: {
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
      },
      {
        test: /\.worker\.js$/,
        include: clientPath,
        use: {
          loader: 'worker-loader',
          options: {
            publicPath: '/'
          }
        }
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      publicPath: '/',
      features: ['multicursor'],
      filename: '[name].worker.js',
      languages: ['html', 'css', 'javascript', 'typescript']
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
