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
      // Desativa plugins pesados
  config.plugins = config.plugins.filter(
    plugin => !['ForkTsCheckerWebpackPlugin', 'ESLintWebpackPlugin'].includes(plugin.constructor.name)
  );
    // Configuração agressiva de otimização
    config.optimization = {
      ...config.optimization,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: 2, // Reduz threads para economizar memória
          terserOptions: {
            compress: {
              drop_console: true,
              passes: 2,
              keep_fargs: false,
              pure_getters: true
            },
            mangle: {
              properties: {
                regex: /^_/ // Mangle apenas propriedades que começam com _
              }
            },
            output: {
              comments: false,
              ascii_only: true
            }
          }
        })
      ],
      splitChunks: {
        chunks: 'all',
        maxSize: 150 * 1024, // 150KB por chunk
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    };

    // Desativa source maps
    config.devtool = false;
    
    // Otimizações adicionais
    config.performance = {
      maxAssetSize: 500 * 1024, // 500KB
      maxEntrypointSize: 500 * 1024
    };

  }

  return config;

};
