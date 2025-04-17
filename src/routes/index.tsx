import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

// Layouts
import MainLayout from '@components/layouts/MainLayout';
import AuthLayout from '@components/layouts/AuthLayout';

// Pages
import HomePage from '@pages/Home';
import LoginPage from '@pages/Auth/Login';
import RegisterPage from '@pages/Auth/Register';
import ForgotPasswordPage from '@pages/Auth/ForgotPassword';
import DashboardPage from '@pages/Dashboard';
import NotFoundPage from '@pages/NotFound';
import IngredientsPage from '@pages/Ingredients';
import RecipesPage from '@pages/Recipes';

// Interface para definir propriedades do componente PrivateRoute
interface PrivateRouteProps {
  element: React.ReactElement;
}

// Componente para proteger rotas
const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  
  // Verificar autenticação quando o componente montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
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

// Componente principal de rotas
const AppRoutes: React.FC = () => {
  const { checkAuth } = useAuth();
  
  // Verificar autenticação quando a aplicação iniciar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="ingredients" element={<IngredientsPage />} />
          <Route path="recipes" element={<RecipesPage />} />
        </Route>

        {/* Rotas de autenticação */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Rotas protegidas */}
        <Route path="/dashboard" element={<PrivateRoute element={<MainLayout />} />}>
          <Route index element={<DashboardPage />} />
          {/* Adicione mais rotas protegidas aqui */}
        </Route>

        {/* Rota 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
