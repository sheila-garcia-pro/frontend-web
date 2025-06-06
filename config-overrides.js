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
  console.log("entrou");
    // A. Remove TODOS os plugins não essenciais
    config.plugins = config.plugins.filter(
      plugin => !['ForkTsCheckerWebpackPlugin', 'ESLintWebpackPlugin', 'WebpackBundleAnalyzer']
        .includes(plugin.constructor?.name)
    );

    // B. Configuração agressiva do Terser
    config.optimization.minimizer = [
      new TerserPlugin({
        parallel: 1, // Apenas 1 thread para economizar memória
        terserOptions: {
          compress: {
            drop_console: true,
            passes: 1 // Reduz o número de otimizações
          },
          output: {
            comments: false
          }
        }
      })
    ];

    // C. SplitChunks mais conservador
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 150 * 1024, // Chunks de no máximo 150KB
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        }
      }
    };

    // D. Desativa features pesadas
    config.performance = {
      hints: false
    };
    config.devtool = false;
  }


return config;


};
