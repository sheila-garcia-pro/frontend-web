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
    config.plugins = config.plugins.filter(
      plugin => !['ForkTsCheckerWebpackPlugin', 'ESLintWebpackPlugin'].includes(plugin.constructor.name)
    );

    // 2. Configuração extrema de otimização
    config.optimization = {
      ...config.optimization,
      minimize: true,
      minimizer: config.optimization.minimizer.map(plugin => {
        if (plugin.constructor.name === 'TerserPlugin') {
          plugin.options.parallel = 2; // Reduz threads para economizar memória
          plugin.options.terserOptions.compress.drop_console = true;
        }
        return plugin;
      }),
      splitChunks: {
        chunks: 'all',
        maxSize: 200 * 1024, // Chunks de no máximo 200KB
      }
    };

    // 3. Desativa source maps
    config.devtool = false;
  }


return config;


};
