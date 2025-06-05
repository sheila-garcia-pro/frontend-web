const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');


module.exports = function override(config, env) {
  console.log(env);
  config.resolve = {
    ...config.resolve,
    alias: {
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
   
  // Remover ForkTsChecker apenas em produção (economiza memória)
  if (env === 'production') {
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
    );

    // Configurações mais agressivas de otimização
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      maxSize: 244 * 1024,
      minSize: 20 * 1024,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    minimize: true,
    minimizer: config.optimization.minimizer.map(plugin => {
      if (plugin.constructor.name === 'TerserPlugin') {
        plugin.options.parallel = true;
        plugin.options.extractComments = false;
        plugin.options.terserOptions = {
          ...plugin.options.terserOptions,
          compress: {
            drop_console: true,
          },
        };
      }
      return plugin;
    }),
  };

  config.cache = {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  };
  }

  return config;

};
