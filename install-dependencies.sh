#!/bin/bash

# Instalar dependências de produção
echo "Instalando dependências de produção..."
yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom@6 @reduxjs/toolkit redux-saga axios

# Instalar dependências de desenvolvimento
echo "Instalando dependências de desenvolvimento..."
yarn add -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser husky lint-staged

# Configurar husky
echo "Configurando husky..."
yarn husky install

echo "Todas as dependências foram instaladas com sucesso!" 