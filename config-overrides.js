const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = function override(config) {
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@themes': path.resolve(__dirname, 'src/themes'),
      '@config': path.resolve(__dirname, 'src/config')
    }
  };

    // ======================================================
  // 2. Otimizações CRÍTICAS para evitar "heap out of memory"
  // ======================================================
  config.plugins = config.plugins.map(plugin => {
    if (plugin instanceof ForkTsCheckerWebpackPlugin) {
      // Limita a memória do TypeScript Checker para 2GB
      return new ForkTsCheckerWebpackPlugin({
        ...plugin.options,
        memoryLimit: 2048,
        async: false // Executa em série (reduz pressão na memória)
      });
    }
    return plugin;
  });

  // Configuração de otimização do Webpack
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      maxSize: 244 * 1024, // Quebra chunks maiores que 244KB
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        }
      }
    },
    minimize: true,
    minimizer: [
      // Adicione otimizadores customizados se necessário
    ]
  };

  return config;
}; 