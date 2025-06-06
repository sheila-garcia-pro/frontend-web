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
      // Desativa plugins pesados
  config.plugins = config.plugins.filter(
    plugin => !['ForkTsCheckerWebpackPlugin', 'ESLintWebpackPlugin'].includes(plugin.constructor.name)
  );
     // 2. Otimizações de bundle
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      maxSize: 244 * 1024, // 244KB por chunk
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  };

  // 3. Análise do bundle (opcional)
  if (env.ANALYZE_BUNDLE) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  }

  return config;

};
