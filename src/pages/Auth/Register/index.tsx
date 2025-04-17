import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
import { addNotification } from '@store/slices/uiSlice';
import { useAuth } from '@hooks/useAuth';

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, loading, error, isAuthenticated } = useAuth();

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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

    if (!formData.phone.trim()) {
      dispatch(addNotification({
        message: 'Telefone é obrigatório',
        type: 'error',
      }));
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Enviar dados para registro usando o hook
      register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
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
        id="phone"
        label="Telefone"
        name="phone"
        autoComplete="tel"
        value={formData.phone}
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
