const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');


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
   // 1. Remove plugins pesados
    config.plugins = config.plugins.filter(
      plugin => !['ForkTsCheckerWebpackPlugin', 'ESLintWebpackPlugin'].includes(plugin.constructor?.name)
    );

    // 2. Configuração segura do TerserPlugin
    config.optimization.minimizer = [
      new TerserPlugin({
        parallel: 2, // Reduz para 2 threads
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log
            passes: 2 // Mais otimizações
          },
          format: {
            comments: false // Remove comentários
          }
        },
        extractComments: false
      })
    ];

    // 3. Otimização de chunks
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 244 * 1024, // 244KB por chunk
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    };

    // 4. Desativa source maps
    config.devtool = false;
  }


return config;


};
