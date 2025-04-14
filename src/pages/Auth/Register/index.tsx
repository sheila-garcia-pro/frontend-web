import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { RootState } from '@store/index';
import { registerRequest, registerSuccess } from '@store/slices/authSlice';
import { addNotification } from '@store/slices/uiSlice';

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    // Validação de campos vazios
    if (!formData.name.trim()) {
      dispatch(addNotification({
        message: 'Nome é obrigatório',
        type: 'error',
      }));
      return false;
    }

    if (!formData.email.trim()) {
      dispatch(addNotification({
        message: 'Email é obrigatório',
        type: 'error',
      }));
      return false;
    } 
    
    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      dispatch(addNotification({
        message: 'Email inválido',
        type: 'error',
      }));
      return false;
    }

    if (!formData.password) {
      dispatch(addNotification({
        message: 'Senha é obrigatória',
        type: 'error',
      }));
      return false;
    } 
    
    if (formData.password.length < 6) {
      dispatch(addNotification({
        message: 'A senha deve ter pelo menos 6 caracteres',
        type: 'error',
      }));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      dispatch(addNotification({
        message: 'As senhas não coincidem',
        type: 'error',
      }));
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Simulação de registro bem-sucedido
        const mockUser = {
          id: '2',
          name: formData.name,
          email: formData.email,
          role: 'user',
        };
        
        // Disparar ação do Redux (não fará nada real, só para manter compatibilidade)
        dispatch(
          registerRequest({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          })
        );
        
        // Simular sucesso após um pequeno delay
        setTimeout(() => {
          // Gerar resposta de sucesso
          dispatch(registerSuccess({
            user: mockUser,
            token: 'mock-register-token'
          }));
          
          // Exibir notificação de sucesso
          dispatch(addNotification({
            message: 'Cadastro realizado com sucesso!',
            type: 'success',
          }));
          
          // Redirecionar para tela de login
          navigate('/login');
        }, 1000);
        
      } catch (error) {
        // Exibir erro caso ocorra algum problema
        console.error('Erro no registro:', error);
        dispatch(addNotification({
          message: 'Erro ao realizar cadastro. Tente novamente.',
          type: 'error',
        }));
      }
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        px: 2,
        py: 3,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Criar Conta
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      <TextField
        margin="normal"
        fullWidth
        id="name"
        label="Nome completo"
        name="name"
        autoComplete="name"
        autoFocus
        value={formData.name}
        onChange={handleChange}
        disabled={loading}
        required
      />

      <TextField
        margin="normal"
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
        required
      />

      <TextField
        margin="normal"
        fullWidth
        name="password"
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        required
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

      <TextField
        margin="normal"
        fullWidth
        name="confirmPassword"
        label="Confirmar Senha"
        type={showPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        required
      />

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
      </Button>

      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2">
          Já tem uma conta? Faça login
        </Link>
      </Box>
    </Box>
  );
};

export default RegisterPage;
