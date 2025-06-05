const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');


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
   
 
  if (env === 'production') {
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
    );

    // Configuração avançada de otimização
    config.optimization = {
      ...config.optimization,
      runtimeChunk: 'single', // Otimiza o runtime
      splitChunks: {
        chunks: 'all',
        maxSize: 244 * 1024, // 244KB
        minSize: 30 * 1024,  // 30KB (aumentado um pouco)
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'async',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      },
      minimizer: [
        new TerserPlugin({
          parallel: true, // Usa todos os cores do CPU
          extractComments: false, // Não extrai comentários
          terserOptions: {
            parse: { ecma: 8 },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              drop_console: true // Remove console.log
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true
            }
          }
        })
      ]
    };

    // Habilitar cache persistente para builds mais rápidos
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      name: env === 'production' ? 'prod-cache' : 'dev-cache'
    };

    // Configuração adicional para produção
    config.performance = {
      hints: 'warning',
      maxAssetSize: 500 * 1024, // 500KB
      maxEntrypointSize: 500 * 1024 // 500KB
    };
  }

  return config;

};
