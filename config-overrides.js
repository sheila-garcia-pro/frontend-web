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
    
    // Desativa todos os plugins pesados
    config.plugins = config.plugins.filter(plugin => 
      !['ForkTsCheckerWebpackPlugin', 'ESLintWebpackPlugin', 'WebpackBundleAnalyzer'].includes(plugin.constructor.name)
    );
    
    // Configuração extrema de otimização
    config.optimization = {
      ...config.optimization,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: 2, // Reduzido para 2 threads
          terserOptions: {
            compress: {
              drop_console: true,
              passes: 2
            },
            mangle: true,
            output: {
              comments: false
            }
          }
        })
      ]
    };
  }

  return config;

};
