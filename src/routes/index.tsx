import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useDispatch } from 'react-redux';
import { checkAuthRequest } from '@store/slices/authSlice';

// RBAC Guards
import { ProtectedRoute, PermissionRoute } from '@/security/guards';

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
import NotAuthorizedPage from '@pages/NotAuthorized';
import IngredientsPage from '@pages/Ingredients';
import RecipesPage from '@pages/Recipes';
import RecipeDetailsPage from '@pages/Recipes/RecipeDetails';
import SuppliersPage from '@pages/Suppliers';
import ProfilePage from '@pages/Profile';
import MenuPage from '@pages/Menu';
import MenuDetailsPage from '@pages/Menu/MenuDetails';

// Componente para rotas de autenticação - acessíveis quando não autenticado
const AuthRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
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
    // Adicionar um pequeno delay para evitar conflito com login
    const timer = setTimeout(() => {
      dispatch(checkAuthRequest());
    }, 1000); // Aumentei para 1 segundo

    return () => clearTimeout(timer);
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

      {/* Página 403 - Acessível para usuários autenticados */}
      <Route
        path="/403"
        element={
          <ProtectedRoute>
            <NotAuthorizedPage />
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - requerem autenticação */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Home - acesso básico */}
        <Route index element={<HomePage />} />

        {/* Dashboard - acesso básico */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Perfil - acesso básico */}
        <Route path="profile" element={<ProfilePage />} />

        <Route
          path="ingredients"
          element={
            <PermissionRoute required={['get_ingredient', 'get_user_ingredient']} any={true}>
              <IngredientsPage />
            </PermissionRoute>
          }
        />

        <Route
          path="recipes"
          element={
            <PermissionRoute required={['get_recipe', 'get_user_recipe']} any={true}>
              <RecipesPage />
            </PermissionRoute>
          }
        />
        <Route
          path="recipes/:id"
          element={
            <PermissionRoute required={['get_recipe', 'get_user_recipe']} any={true}>
              <RecipeDetailsPage />
            </PermissionRoute>
          }
        />

        <Route
          path="menu"
          element={
            <PermissionRoute required={['get_menu', 'get_user_menu']} any={true}>
              <MenuPage />
            </PermissionRoute>
          }
        />
        <Route
          path="menu/:id"
          element={
            <PermissionRoute required={['get_menu', 'get_user_menu']} any={true}>
              <MenuDetailsPage />
            </PermissionRoute>
          }
        />

        {/* Fornecedores - com permissões específicas */}
        <Route
          path="suppliers"
          element={
            <PermissionRoute required={['get_suppliers']}>
              <SuppliersPage />
            </PermissionRoute>
          }
        />
      </Route>

      {/* Rota 404 - Protegida por padrão */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <NotFoundPage />
          </ProtectedRoute>
        }
      />
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
