import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { RootState } from '@store/index';
import { loginRequest, loginSuccess } from '@store/slices/authSlice';
import { addNotification } from '@store/slices/uiSlice';

// Componente da página de login
const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Estado do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Estado para mostrar/esconder a senha
  const [showPassword, setShowPassword] = useState(false);

  // Manipulador de mudança nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggles visibilidade da senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos vazios
    if (!formData.email || !formData.password) {
      dispatch(addNotification({
        message: 'Preencha todos os campos!',
        type: 'error',
      }));
      return;
    }
    
    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      dispatch(addNotification({
        message: 'Digite um e-mail válido.',
        type: 'error',
      }));
      return;
    }
    
    // Autenticação mockada
    try {
      // Credenciais mockadas
      if (formData.email === 'teste@teste.com' && formData.password === 'Abc1234') {
        // Login bem-sucedido
        const mockUser = {
          id: '1',
          name: 'Usuário Teste',
          email: 'teste@teste.com',
          role: 'user',
        };
        
        // Despachar ação de sucesso com usuário e token
        dispatch(loginSuccess({ 
          user: mockUser, 
          token: 'mock-jwt-token'
        }));
        
        // Exibir mensagem de sucesso
        dispatch(addNotification({
          message: 'Login realizado com sucesso!',
          type: 'success',
        }));
        
        // Redirecionar para o dashboard
        navigate('/dashboard');
      } else {
        // Credenciais inválidas
        dispatch(addNotification({
          message: 'E-mail ou senha incorretos!',
          type: 'error',
        }));
      }
    } catch (error) {
      // Erro inesperado
      console.error('Erro de login:', error);
      dispatch(addNotification({
        message: 'Erro ao tentar realizar o login. Tente novamente.',
        type: 'error',
      }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Entrar
      </Typography>

      {/* Mensagem de erro do Redux */}
      {error && (
        <Typography color="error" align="center" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Campo de email */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
      />

      {/* Campo de senha */}
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Botão de submit */}
      <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2 }}>
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
      </Button>

      {/* Links de navegação */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Link component={RouterLink} to="/forgot-password" variant="body2">
          Esqueceu a senha?
        </Link>
        <Link component={RouterLink} to="/register" variant="body2">
          Não tem uma conta? Cadastre-se
        </Link>
      </Box>
    </Box>
  );
};

export default LoginPage;
