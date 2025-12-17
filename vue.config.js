const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = defineConfig({
  transpileDependencies: true,

  // 打包目录
  outputDir: './build',

  // ✅ 正确的开发服务器配置（不是 server，是 devServer）
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:22223',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },

  // webpack 原生配置
  configureWebpack: {
    resolve: {
      alias: {
        components: '@/components'
      }
    },
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      require('unplugin-element-plus/webpack')({
        resolvers: [ElementPlusResolver()]
      })
    ]
  }
})
