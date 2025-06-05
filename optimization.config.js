// 'use strict';

// const path = require('path');

// module.exports = {
//   webpack: {
//     configure: (webpackConfig) => {
//       // Otimizações específicas para produção
//       if (webpackConfig.mode === 'production') {
//         // Configurar chunking para reduzir o tamanho dos bundles
//         webpackConfig.optimization.splitChunks = {
//           chunks: 'all',
//           name: false,
//           cacheGroups: {
//             default: false,
//             defaultVendors: false,
//             // Bundle React separadamente
//             react: {
//               test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
//               name: 'vendor-react',
//               chunks: 'all',
//             },
//             // Bundle MUI separadamente
//             mui: {
//               test: /[\\/]node_modules[\\/]@mui[\\/]/,
//               name: 'vendor-mui',
//               chunks: 'all',
//             },
//             // Outros vendors
//             vendors: {
//               test: /[\\/]node_modules[\\/](!@mui)[\\/]/,
//               name(module) {
//                 const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
//                 return `vendor.${packageName.replace('@', '')}`;
//               },
//               chunks: 'async',
//             },
//           },
//         };

//         // Desabilitar minimização para debugging se necessário
//         webpackConfig.optimization.minimize = true;

//         // Reduzir o paralelismo para economizar memória
//         webpackConfig.parallelism = 1;
//       }

//       // Desabilitar source maps em produção
//       webpackConfig.devtool = false;

//       return webpackConfig;
//     },
//   },
// };
