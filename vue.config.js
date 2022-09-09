module.exports = {
  configureWebpack: {
    resolve: {
      
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://www.codeman.ink:3000',
        changeOrigin: true,
        ws: true,
        secure: false,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
}