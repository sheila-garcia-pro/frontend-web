# Instruções para Solucionar os Erros

Para resolver os erros encontrados no projeto, siga estas etapas na ordem recomendada:

## 1. Instalar Dependências Essenciais

Execute o script para instalar as dependências principais:

```
install-deps.bat
```

Este script instalará:
- react-redux
- @reduxjs/toolkit
- redux-saga
- react-router-dom
- @mui/material e dependências
- @mui/icons-material

## 2. Configurar CRACO para Path Aliases

Execute o script para instalar e configurar o CRACO:

```
install-craco.bat
```

Este script configurará o projeto para reconhecer os path aliases (como @components, @store, etc.)

## 3. Iniciar o Projeto

Depois de instalar as dependências e configurar o CRACO, inicie o projeto:

```
yarn start
```

## Resolução de Problemas Específicos

Se ainda encontrar erros após estas etapas, verifique:

1. **Erros de importação no Material UI**:
   - `useTheme` e `styled` devem ser importados de `@mui/material/styles`
   - Adicione tipagem correta para os temas: `Theme` do `@mui/material/styles`

2. **Erros de Path Aliases**:
   - Verifique se o CRACO está configurado corretamente
   - Reinicie o servidor de desenvolvimento após configuração

3. **Componentes ausentes**:
   - Verifique se todos os arquivos mencionados nas importações existem 