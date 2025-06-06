import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { useAuth } from '@hooks/useAuth';

// Layouts
import MainLayout from '@components/layouts/MainLayout';
import AuthLayout from '@components/layouts/AuthLayout';

// Pages
import HomePage from '@pages/Home';
import LoginPage from '@pages/Auth/Login/LoginPage';
import RegisterPage from '@pages/Auth/Register/RegisterPage';
import ForgotPasswordPage from '@pages/Auth/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '@pages/Auth/ResetPassword/ResetPasswordPage';
import DashboardPage from '@pages/Dashboard';
import NotFoundPage from '@pages/NotFound';
import IngredientsPage from '@pages/Ingredients';
import RecipesPage from '@pages/Recipes';
import SuppliersPage from '@pages/Suppliers';
import ProfilePage from '@pages/Profile';

// Interface para definir propriedades do componente PrivateRoute
interface PrivateRouteProps {
  element: React.ReactElement;
}

// Interface para rotas de autenticação
interface AuthRouteProps {
  element: React.ReactElement;
}

// Componente para proteger rotas - redireciona para login quando não autenticado
const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const tokenKey = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';

  // Verificar autenticação quando o componente montar
  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      // Se não houver token, não precisa fazer a verificação
      return;
    }
    checkAuth();
  }, [checkAuth, tokenKey]);

  // Mostrar nada enquanto verifica autenticação
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    // Redireciona para a página de login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }

  // Renderiza o elemento se estiver autenticado
  return element;
};

// Componente para rotas de autenticação - acessíveis quando não autenticado
const AuthRoute: React.FC<AuthRouteProps> = ({ element }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();

  // Verificar autenticação quando o componente montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Mostrar nada enquanto verifica autenticação
  if (loading) {
    return null;
  }

  // Se estiver autenticado, redireciona para a página principal
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Renderiza o elemento se não estiver autenticado
  return element;
};

// Componente que contém as rotas - este componente está DENTRO do contexto Router
const AppRoutesContent: React.FC = () => {
  const { checkAuth } = useAuth();

  // Verificar autenticação quando a aplicação iniciar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Rotas de autenticação - acessíveis apenas quando NÃO autenticado */}
      <Route element={<AuthRoute element={<AuthLayout />} />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
      {/* Rotas protegidas - requerem autenticação */}{' '}
      <Route path="/" element={<PrivateRoute element={<MainLayout />} />}>
        <Route index element={<HomePage />} />
        <Route path="ingredients" element={<IngredientsPage />} />
        <Route path="recipes" element={<RecipesPage />} />{' '}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      {/* Rota 404 - Protegida por padrão, redireciona para login se não autenticado */}
      <Route path="*" element={<PrivateRoute element={<NotFoundPage />} />} />
    </Routes>
  );
};

// Componente principal que cria o Router
const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutesContent />
    </BrowserRouter>
  );
};

export default AppRoutes;
