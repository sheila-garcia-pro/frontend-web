const path = require('path');

module.exports = function override(config) {
  // Configurações de alias existentes
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
      '@config': path.resolve(__dirname, 'src/config'),
    },
  };

  // Otimizações para reduzir uso de memória
  config.optimization = {
    ...config.optimization,
    moduleIds: 'deterministic',
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 20,
      maxAsyncRequests: 20,
      minSize: 40000,
    },
  };

  // Reduzir paralelismo do webpack para diminuir uso de memória
  config.parallelism = 1;

  // Habilitar cache do webpack
  config.cache = {
    type: 'filesystem',
    compression: 'gzip',
    cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
  };

  return config;
};
