@echo off
echo Instalando dependencias de producao...
call yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom@6 @reduxjs/toolkit redux-saga axios

echo Instalando dependencias de desenvolvimento...
call yarn add -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser husky lint-staged

echo Configurando husky...
call yarn husky install

echo Todas as dependencias foram instaladas com sucesso! 