# Documentação do Processo de Criação do Template

Este documento descreve o processo completo de criação do template React com TypeScript, Material UI, Redux Toolkit + Redux Saga, e outras tecnologias modernas. Todo o desenvolvimento foi feito seguindo as melhores práticas e padrões da indústria.

## Visão Geral do Processo

O desenvolvimento deste template seguiu os seguintes passos:

1. Criação do projeto base com Create React App + TypeScript
2. Instalação e configuração das dependências principais
3. Definição da estrutura de pastas para organização do código
4. Configuração das ferramentas de qualidade de código (ESLint, Prettier, Husky)
5. Implementação de sistemas fundamentais (temas, autenticação, rotas, Redux)
6. Criação de componentes de UI e páginas de exemplo

## 1. Inicialização do Projeto

O projeto foi iniciado usando o Create React App com o template TypeScript:

```bash
npx create-react-app projeto-react-template --template typescript
# ou
yarn create react-app projeto-react-template --template typescript
```

## 2. Instalação de Dependências

As seguintes dependências foram adicionadas ao projeto:

### Dependências de Produção

```bash
yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom @reduxjs/toolkit redux-saga axios
```

### Dependências de Desenvolvimento

```bash
yarn add -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser husky lint-staged
```

## 3. Estrutura de Pastas

Foi criada uma estrutura de pastas organizada para facilitar o desenvolvimento e manutenção:

```bash
mkdir -p src/{components,pages,routes,services,store,assets,hooks,utils,themes,config}
mkdir -p src/store/{slices,sagas,middlewares}
mkdir -p src/services/{api,interceptors}
mkdir -p src/components/{layouts,ui,common}
mkdir -p src/pages/{Home,Dashboard,Auth}
```

## 4. Configuração do TypeScript com Path Aliases

O arquivo `tsconfig.json` foi configurado para utilizar aliases de importação, facilitando as referências a arquivos em diferentes partes do projeto:

```json
{
  "compilerOptions": {
    // Configurações existentes...
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@pages/*": ["pages/*"],
      "@routes/*": ["routes/*"],
      "@services/*": ["services/*"],
      "@store/*": ["store/*"],
      "@assets/*": ["assets/*"],
      "@hooks/*": ["hooks/*"],
      "@utils/*": ["utils/*"],
      "@themes/*": ["themes/*"],
      "@config/*": ["config/*"]
    }
  }
}
```

## 5. Configuração de Linting e Formatação

### ESLint

Criamos um arquivo `.eslintrc` com as configurações para React e TypeScript:

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "prettier/prettier": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { "argsIgnorePattern": "^_" }
    ]
  },
  "settings": {
    "import/resolver": {
      "typescript": {}
    },
    "react": {
      "version": "detect"
    }
  }
}
```

### Prettier

Criamos um arquivo `.prettierrc` para padronização da formatação:

```json
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "jsxSingleQuote": false,
  "bracketSpacing": true,
  "endOfLine": "auto"
}
```

### Husky e Lint-staged

Adicionamos configurações ao `package.json` para executar linting e formatação antes de cada commit:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "src/**/*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

## 6. Implementação do Sistema de Temas

Foi criado um sistema de temas light/dark usando Material UI:

### Configuração dos Temas

No arquivo `src/themes/index.ts`, definimos temas claros e escuros:

```typescript
import { createTheme, Theme, ThemeOptions, PaletteMode } from '@mui/material';

// Configuração de paletas de cores, tipografia, etc.
const getDesignTokens = (mode: PaletteMode) => { /* ... */ };

export const lightTheme: Theme = createTheme(getDesignTokens('light'));
export const darkTheme: Theme = createTheme(getDesignTokens('dark'));
export const getTheme = (mode: PaletteMode): Theme => 
  mode === 'light' ? lightTheme : darkTheme;
```

### Hook para Gerenciamento do Tema

Criamos um hook customizado em `src/hooks/useThemeMode.ts` para alternar entre temas e persistir a escolha:

```typescript
import { useState, useEffect, useMemo } from 'react';
import { PaletteMode } from '@mui/material';
import { getTheme } from '@themes/index';

export const useThemeMode = () => {
  // Carrega o tema salvo ou detecta o tema do sistema
  const [mode, setMode] = useState<'light' | 'dark'>(() => { /* ... */ });

  // Persiste a escolha do tema
  useEffect(() => { /* ... */ }, [mode]);

  // Função para alternar o tema
  const toggleTheme = () => { /* ... */ };

  // Memoriza o tema atual para evitar recriações desnecessárias
  const theme = useMemo(() => getTheme(mode as PaletteMode), [mode]);

  return { theme, mode, toggleTheme, isLight: mode === 'light', isDark: mode === 'dark' };
};
```

## 7. Configuração do Redux Toolkit e Redux Saga

### Store Principal

Em `src/store/index.ts`, configuramos o store com Redux Toolkit e Redux Saga:

```typescript
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';

// Importação de reducers e sagas
// ...

const sagaMiddleware = createSagaMiddleware();
const rootReducer = combineReducers({ auth: authReducer, ui: uiReducer });

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ /* ... */ }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

function* rootSaga() {
  yield all([...authSagas, ...uiSagas]);
}

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Slices para Gerenciamento de Estado

Criamos slices para diferentes partes da aplicação:

#### Auth Slice (`src/store/slices/authSlice.ts`)

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User { /* ... */ }
export interface AuthState { /* ... */ }

const initialState: AuthState = { /* ... */ };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Ações para login, logout, registro, verificação de token, etc.
    loginRequest: (state, action) => { /* ... */ },
    loginSuccess: (state, action) => { /* ... */ },
    // ...
  },
});

export const { loginRequest, loginSuccess, /* ... */ } = authSlice.actions;
export default authSlice.reducer;
```

#### UI Slice (`src/store/slices/uiSlice.ts`)

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState { /* ... */ }
const initialState: UIState = { /* ... */ };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Ações para controle de loading, notificações, tema, sidebar, etc.
    setLoading: (state, action) => { /* ... */ },
    addNotification: (state, action) => { /* ... */ },
    // ...
  },
});

export const { setLoading, addNotification, /* ... */ } = uiSlice.actions;
export default uiSlice.reducer;
```

### Sagas para Operações Assíncronas

Implementamos sagas para lidar com operações assíncronas:

#### Auth Sagas (`src/store/sagas/authSagas.ts`)

```typescript
import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loginRequest, loginSuccess, loginFailure, /* ... */ } from '@store/slices/authSlice';
import * as authService from '@services/api/auth';

function* loginSaga(action: PayloadAction<{ email: string; password: string }>) {
  try {
    // Chama serviço de API e despacha ações apropriadas
    // ...
  } catch (error) {
    // Trata erros
    // ...
  }
}

// Outras sagas para registro, verificação de token, etc.
// ...

const authSagas = [
  takeLatest(loginRequest.type, loginSaga),
  // ... outras sagas
];

export default authSagas;
```

## 8. Configuração do Axios e Interceptors

### Configuração Principal do Axios (`src/services/api/index.ts`)

```typescript
import axios from 'axios';
import { setupInterceptors } from '@services/interceptors';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  headers: { /* ... */ },
});

setupInterceptors(api);

export default api;
```

### Interceptors para Requisições (`src/services/interceptors/index.ts`)

```typescript
import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const setupInterceptors = (api: AxiosInstance): void => {
  // Interceptor de requisição para adicionar token de autenticação
  api.interceptors.request.use((config) => {
    // Adiciona token ao header Authorization
    // ...
    return config;
  }, (error) => Promise.reject(error));

  // Interceptor de resposta para tratamento global de erros
  api.interceptors.response.use((response) => {
    return response;
  }, (error) => {
    // Tratamento de erros de autenticação e outros
    // ...
    return Promise.reject(error);
  });
};
```

### Serviços de API Organizados (`src/services/api/auth.ts`)

```typescript
import api from '@services/api';
import { User } from '@store/slices/authSlice';

// Interfaces para requisições/respostas
interface LoginCredentials { /* ... */ }
interface AuthResponse { /* ... */ }

// Funções de API para autenticação
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Implementação da chamada de API
  // ...
};

// Outras funções de API para registro, verificação de token, etc.
// ...
```

## 9. Configuração de Rotas e Proteção

Em `src/routes/index.tsx`, configuramos rotas com proteção para autenticação:

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';

// Componentes e layouts
// ...

// Componente para proteger rotas
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* Rotas de autenticação */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Rotas protegidas */}
        <Route path="/dashboard" element={<PrivateRoute element={<MainLayout />} />}>
          <Route index element={<DashboardPage />} />
        </Route>

        {/* Rota 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

## 10. Implementação de Layouts

### Layout Principal (`src/components/layouts/MainLayout.tsx`)

Layout principal com sidebar, navbar e suporte a tema:

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Container, Toolbar, ThemeProvider /* ... */ } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/index';
import { toggleSidebar } from '@store/slices/uiSlice';
import useThemeMode from '@hooks/useThemeMode';

// Componentes
import Navbar from '@components/ui/Navbar';
import Sidebar from '@components/ui/Sidebar';
// ...

const MainLayout: React.FC = () => {
  const { theme } = useThemeMode();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  
  // Lógica do layout
  // ...
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <Navbar /* ... */ />
        <Sidebar /* ... */ />
        <Main /* ... */>
          <Toolbar />
          <Container>
            <Outlet />
          </Container>
          <Footer />
        </Main>
        <GlobalLoader />
        <NotificationsManager />
      </Box>
    </ThemeProvider>
  );
};
```

### Layout de Autenticação (`src/components/layouts/AuthLayout.tsx`)

Layout específico para páginas de autenticação:

```typescript
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, Paper, Typography /* ... */ } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import useThemeMode from '@hooks/useThemeMode';

const AuthLayout: React.FC = () => {
  const { theme } = useThemeMode();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Redireciona para dashboard se já autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box /* ... */>
        <Container maxWidth="sm">
          <Paper /* ... */>
            <Typography /* ... */>Projeto React Template</Typography>
            <Outlet />
          </Paper>
        </Container>
        <GlobalLoader />
        <NotificationsManager />
      </Box>
    </ThemeProvider>
  );
};
```

## 11. Componentes de UI

### Navbar (`src/components/ui/Navbar.tsx`)

```typescript
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppBar, Toolbar, IconButton /* ... */ } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon /* ... */ } from '@mui/icons-material';
import { RootState } from '@store/index';
import { logout } from '@store/slices/authSlice';
import { toggleTheme } from '@store/slices/uiSlice';
import useThemeMode from '@hooks/useThemeMode';

const Navbar: React.FC<{ /* ... */ }> = ({ /* ... */ }) => {
  // Lógica do componente
  // ...
  
  return (
    <AppBar /* ... */>
      <Toolbar>
        <IconButton /* ... */><MenuIcon /></IconButton>
        <Typography /* ... */>Projeto React Template</Typography>
        <Box /* ... */>
          {/* Botões e menus */}
          {/* ... */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
```

### Componentes Utilitários

Componentes para feedback ao usuário:

#### GlobalLoader (`src/components/common/GlobalLoader.tsx`)

```typescript
import React from 'react';
import { useSelector } from 'react-redux';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';
import { RootState } from '@store/index';

const GlobalLoader: React.FC = () => {
  const { loading } = useSelector((state: RootState) => state.ui);
  
  return (
    <Backdrop /* ... */ open={loading.global}>
      <CircularProgress /* ... */ />
      <Box /* ... */>
        <Typography /* ... */>Carregando...</Typography>
      </Box>
    </Backdrop>
  );
};
```

#### NotificationsManager (`src/components/common/NotificationsManager.tsx`)

```typescript
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, Typography } from '@mui/material';
import { RootState } from '@store/index';
import { removeNotification } from '@store/slices/uiSlice';

const NotificationsManager: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.ui);
  
  // Lógica do componente
  // ...
  
  return (
    <>
      {notifications.map((notification) => (
        <Snackbar /* ... */>
          <Alert /* ... */>
            <Typography /* ... */>{notification.message}</Typography>
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};
```

## 12. Páginas de Exemplo

### HomePage (`src/pages/Home/index.tsx`)

Página inicial com visão geral do projeto:

```typescript
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card /* ... */ } from '@mui/material';
import { Dashboard as DashboardIcon /* ... */ } from '@mui/icons-material';

const HomePage: React.FC = () => {
  return (
    <Box /* ... */>
      {/* Hero section */}
      <Box /* ... */>
        <Typography /* ... */>Bem-vindo ao Projeto React Template</Typography>
        <Typography /* ... */>Um template completo para aplicações React...</Typography>
        <Box /* ... */>
          <Button /* ... */>Dashboard</Button>
          <Button /* ... */>Login</Button>
        </Box>
      </Box>

      {/* Features */}
      <Typography /* ... */>Principais Recursos</Typography>
      <Grid container spacing={4}>
        {/* Cards de features */}
        {/* ... */}
      </Grid>
    </Box>
  );
};
```

### DashboardPage (`src/pages/Dashboard/index.tsx`)

Página protegida com exemplos de widgets:

```typescript
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Grid, Paper, Card /* ... */ } from '@mui/material';
import { Person as PersonIcon /* ... */ } from '@mui/icons-material';
import { RootState } from '@store/index';
import { addNotification } from '@store/slices/uiSlice';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Lógica do componente
  // ...
  
  return (
    <Box>
      {/* Cabeçalho */}
      <Box /* ... */><Typography /* ... */>Dashboard</Typography></Box>
      
      {/* Cards informativos */}
      <Grid container spacing={3}>
        {/* ... */}
      </Grid>
      
      {/* Conteúdo principal */}
      <Grid container spacing={3}>
        {/* Informações do usuário, atividades, notificações */}
        {/* ... */}
      </Grid>
    </Box>
  );
};
```

### LoginPage (`src/pages/Auth/Login/index.tsx`)

Página de login com formulário:

```typescript
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, Button, Typography, Link /* ... */ } from '@mui/material';
import { Visibility as VisibilityIcon /* ... */ } from '@mui/icons-material';
import { RootState } from '@store/index';
import { loginRequest } from '@store/slices/authSlice';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  // Estado do formulário
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  // Lógica do componente
  // ...
  
  return (
    <Box component="form" onSubmit={handleSubmit} /* ... */>
      <Typography /* ... */>Entrar</Typography>
      
      {/* Mensagem de erro */}
      {error && <Typography color="error" /* ... */>{error}</Typography>}
      
      {/* Campos do formulário */}
      <TextField /* ... */ />
      <TextField /* ... */ />
      
      {/* Botão de submit */}
      <Button type="submit" /* ... */>
        {loading ? <CircularProgress /* ... */ /> : 'Entrar'}
      </Button>
      
      {/* Links de navegação */}
      <Box /* ... */>
        <Link /* ... */>Esqueceu a senha?</Link>
        <Link /* ... */>Não tem uma conta? Cadastre-se</Link>
      </Box>
    </Box>
  );
};
```

## Conclusão

Este template foi desenvolvido para fornecer uma base sólida para aplicações React modernas, incorporando boas práticas de desenvolvimento, organização de código, e padrões de design. A estrutura e o código foram pensados para facilitar a escalabilidade e manutenção, permitindo que desenvolvedores possam iniciar rapidamente novos projetos com uma base consistente e robusta.

Os principais benefícios deste template incluem:

1. Estrutura de pastas organizada e escalável
2. Configuração completa para TypeScript com aliases de importação
3. Sistema de gerenciamento de estado com Redux Toolkit e Redux Saga
4. Sistema de autenticação com proteção de rotas
5. Integração com Material UI e suporte para temas light/dark
6. Sistema de feedback ao usuário com notificações e loaders
7. Configuração avançada para qualidade de código (ESLint, Prettier, Husky)
8. Exemplos de componentes e páginas prontos para uso

Esta documentação serve como um guia para entender o processo de desenvolvimento e a estrutura do template, facilitando a customização e extensão para necessidades específicas de cada projeto. 