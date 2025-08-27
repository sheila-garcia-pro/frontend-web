import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useDispatch } from 'react-redux';
import { checkAuthRequest } from '@store/slices/authSlice';

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
import RecipeDetailsPage from '@pages/Recipes/RecipeDetails';
import SuppliersPage from '@pages/Suppliers';
import ProfilePage from '@pages/Profile';
import MenuPage from '@pages/Menu';
import MenuDetailsPage from '@pages/Menu/MenuDetails';

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
  const { isAuthenticated, loading } = useAuth();

  // Se está carregando, não fazer nada (o loading global está sendo mostrado)
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
  const { isAuthenticated, loading } = useAuth();

  // Se está carregando, não fazer nada (o loading global está sendo mostrado)
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
  const dispatch = useDispatch();
  const { loading } = useAuth();

  // Verificar autenticação apenas uma vez na inicialização
  useEffect(() => {
    dispatch(checkAuthRequest());
  }, [dispatch]);

  // Mostrar loading enquanto verifica autenticação inicial
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          backgroundColor: '#f5f5f5',
        }}
      >
        Verificando autenticação...
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas de autenticação - acessíveis apenas quando NÃO autenticado */}
      <Route element={<AuthRoute element={<AuthLayout />} />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
      {/* Rotas protegidas - requerem autenticação */}
      <Route path="/" element={<PrivateRoute element={<MainLayout />} />}>
        {' '}
        <Route index element={<HomePage />} />
        <Route path="ingredients" element={<IngredientsPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="recipes/:id" element={<RecipeDetailsPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="menu/:id" element={<MenuDetailsPage />} />
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
