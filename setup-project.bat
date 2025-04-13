@echo off
echo Configurando o Sheila Garcia Pro
echo ======================================================
echo Configurando o Projeto React Template
echo ======================================================
echo.

echo 1. Instalando dependencias principais...
call yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material
call yarn add react-router-dom@6 @reduxjs/toolkit redux-saga axios

echo.
echo 2. Instalando dependencias de desenvolvimento...
call yarn add -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser husky lint-staged
call yarn add -D @craco/craco craco-alias

echo.
echo 3. Criando configuracao do craco para path aliases...
echo.

echo ^> Criando arquivo craco.config.js
echo const CracoAlias = require('craco-alias'); > craco.config.js
echo module.exports = { >> craco.config.js
echo   plugins: [ >> craco.config.js
echo     { >> craco.config.js
echo       plugin: CracoAlias, >> craco.config.js
echo       options: { >> craco.config.js
echo         source: 'tsconfig', >> craco.config.js
echo         baseUrl: './src', >> craco.config.js
echo         tsConfigPath: './tsconfig.json' >> craco.config.js
echo       } >> craco.config.js
echo     } >> craco.config.js
echo   ] >> craco.config.js
echo }; >> craco.config.js

echo.
echo 4. Atualizando scripts no package.json...

echo ^> Substituindo scripts de React por scripts Craco...
call powershell -Command "(Get-Content package.json) -replace '\"start\": \"react-scripts start\"', '\"start\": \"craco start\"' | Set-Content package.json"
call powershell -Command "(Get-Content package.json) -replace '\"build\": \"react-scripts build\"', '\"build\": \"craco build\"' | Set-Content package.json"
call powershell -Command "(Get-Content package.json) -replace '\"test\": \"react-scripts test\"', '\"test\": \"craco test\"' | Set-Content package.json"

echo.
echo 5. Configurando husky...
call yarn husky install

echo.
echo ======================================================
echo Projeto configurado com sucesso!
echo.
echo Recomendacoes:
echo - Execute 'yarn start' para iniciar o servidor de desenvolvimento
echo - Verifique se todas as rotas estao funcionando corretamente
echo - Teste o login e o sistema de autenticacao
echo ====================================================== 