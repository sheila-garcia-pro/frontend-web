@echo off
echo Verificando e instalando dependencias ausentes...

echo Instalando dependencias principais...
call yarn add @mui/material @mui/icons-material @emotion/react @emotion/styled react-router-dom @reduxjs/toolkit redux-saga react-redux axios

echo Instalando dependencias de desenvolvimento...
call yarn add -D @craco/craco eslint-config-prettier eslint-plugin-prettier prettier husky lint-staged

echo Configurando CRACO...
echo const path = require('path'); > craco.config.js
echo. >> craco.config.js
echo module.exports = { >> craco.config.js
echo   webpack: { >> craco.config.js
echo     alias: { >> craco.config.js
echo       '@': path.resolve(__dirname, 'src'), >> craco.config.js
echo       '@components': path.resolve(__dirname, 'src/components'), >> craco.config.js
echo       '@pages': path.resolve(__dirname, 'src/pages'), >> craco.config.js
echo       '@routes': path.resolve(__dirname, 'src/routes'), >> craco.config.js
echo       '@services': path.resolve(__dirname, 'src/services'), >> craco.config.js
echo       '@store': path.resolve(__dirname, 'src/store'), >> craco.config.js
echo       '@assets': path.resolve(__dirname, 'src/assets'), >> craco.config.js
echo       '@hooks': path.resolve(__dirname, 'src/hooks'), >> craco.config.js
echo       '@utils': path.resolve(__dirname, 'src/utils'), >> craco.config.js
echo       '@themes': path.resolve(__dirname, 'src/themes'), >> craco.config.js
echo       '@config': path.resolve(__dirname, 'src/config') >> craco.config.js
echo     } >> craco.config.js
echo   } >> craco.config.js
echo }; >> craco.config.js

echo Atualizando scripts no package.json...
call powershell -Command "(Get-Content package.json) -replace '\"start\": \"react-scripts start\"', '\"start\": \"craco start\"' | Set-Content package.json"
call powershell -Command "(Get-Content package.json) -replace '\"build\": \"react-scripts build\"', '\"build\": \"craco build\"' | Set-Content package.json"
call powershell -Command "(Get-Content package.json) -replace '\"test\": \"react-scripts test\"', '\"test\": \"craco test\"' | Set-Content package.json"

echo Configurando Husky...
call yarn husky install

echo Todas as dependencias foram instaladas e configuradas!
echo Para iniciar o projeto, execute: yarn start 