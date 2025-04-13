#!/bin/bash

echo "Verificando e instalando dependências ausentes..."

# Lista de dependências necessárias
DEPENDENCIES=(
  "@mui/material"
  "@mui/icons-material"
  "@emotion/react"
  "@emotion/styled"
  "react-router-dom"
  "@reduxjs/toolkit"
  "redux-saga"
  "react-redux"
  "axios"
)

# Verifica cada dependência
for dep in "${DEPENDENCIES[@]}"; do
  if ! grep -q "\"$dep\":" package.json; then
    echo "Instalando $dep..."
    yarn add "$dep"
  else
    echo "$dep já está instalado."
  fi
done

# Dependências de desenvolvimento
DEV_DEPENDENCIES=(
  "@craco/craco"
  "eslint-config-prettier"
  "eslint-plugin-prettier"
  "prettier"
  "husky"
  "lint-staged"
)

# Verifica cada dependência de desenvolvimento
for dep in "${DEV_DEPENDENCIES[@]}"; do
  if ! grep -q "\"$dep\":" package.json; then
    echo "Instalando $dep (dev)..."
    yarn add -D "$dep"
  else
    echo "$dep já está instalado."
  fi
done

echo "Configurando CRACO..."
if [ ! -f craco.config.js ]; then
  echo "Criando craco.config.js..."
  cat > craco.config.js << EOF
const path = require('path');

module.exports = {
  webpack: {
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
      '@config': path.resolve(__dirname, 'src/config')
    }
  }
};
EOF
fi

echo "Atualizando scripts no package.json..."
# Esta parte precisa ser adaptada para seu ambiente. O exemplo usa sed que é comum em Linux/Mac
# sed -i '' 's/"start": "react-scripts start"/"start": "craco start"/' package.json
# sed -i '' 's/"build": "react-scripts build"/"build": "craco build"/' package.json
# sed -i '' 's/"test": "react-scripts test"/"test": "craco test"/' package.json

echo "Verificando configurações do Husky..."
yarn husky install || echo "Falha ao instalar husky, tente manualmente: yarn husky install"

echo "Todas as dependências foram verificadas e instaladas!" 