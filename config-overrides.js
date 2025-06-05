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
    
    // Desativa verificações pesadas em produção
    config.plugins = config.plugins.filter(
      p => !['ForkTsCheckerWebpackPlugin', 'ESLintWebpackPlugin'].includes(p.constructor.name)
    );

    // Otimização extrema
    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: 4, // Limita a 4 threads para evitar sobrecarga
          terserOptions: {
            ecma: 2015,
            compress: {
              drop_console: true,
              passes: 3 // Mais agressivo
            },
            output: {
              comments: false
            }
          }
        })
      ],
      splitChunks: {
        chunks: 'all',
        maxSize: 200 * 1024, // Reduzido para 200KB
        minSize: 30 * 1024,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
          },
          default: {
            minChunks: 2,
            priority: -20
          }
        }
      }
    };

    // Configuração de performance
    config.performance = {
      maxAssetSize: 800 * 1024, // Aumentado para 800KB
      maxEntrypointSize: 800 * 1024
    };
  }

  return config;

};
