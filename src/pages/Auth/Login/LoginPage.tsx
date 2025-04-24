import React, { useState, useEffect } from 'react';
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
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { addNotification } from '@store/slices/uiSlice';
import { useAuth } from '@hooks/useAuth';
import useNotification from '@hooks/useNotification';
import { RootState } from '@store/index';

// Componente da página de login
const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error } = useAuth();
  const { isAuthenticated: reduxIsAuthenticated } = useSelector((state: RootState) => state.auth);
  const notification = useNotification();

  // Estado do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Estado para erros de validação
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  // Estado para validação do formulário completo
  const [isFormValid, setIsFormValid] = useState(false);

  // Estado para mostrar/esconder a senha
  const [showPassword, setShowPassword] = useState(false);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    // Só redireciona se estiver autenticado, sem erro e não estiver em carregamento
    if (isAuthenticated && !error && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, error, loading]);

  // Validar campo individual
  const validateField = (name: string, value: string) => {
    let error = '';
    
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email é obrigatório';
      } else if (value.length < 3) {
        error = 'Digite pelo menos 3 caracteres';
      } else {
        // Verificar se é um email ou nome de usuário
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value.includes('@') && !emailRegex.test(value)) {
          error = 'Digite um email válido';
        }
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Senha é obrigatória';
      } else if (value.length < 6) {
        error = 'A senha deve ter pelo menos 6 caracteres';
      }
    }
    
    setFormErrors(prev => ({ ...prev, [name]: error }));
    
    // Atualizar estado de validação do formulário
    setTimeout(() => {
      const newErrors = { ...formErrors, [name]: error };
      const isValid = !newErrors.email && 
                      !newErrors.password && 
                      formData.email.trim() !== '' && 
                      formData.password.trim() !== '';
      setIsFormValid(isValid);
    }, 100);
  };

  // Manipulador de mudança nos campos com validação em tempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar campo em tempo real
    validateField(name, value);
  };

  // Toggles visibilidade da senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Função que valida o formulário completo
  const validateForm = () => {
    // Validar todos os campos
    validateField('email', formData.email);
    validateField('password', formData.password);
    
    // Verificar se há erros
    return !formErrors.email && 
           !formErrors.password && 
           formData.email.trim() !== '' && 
           formData.password.trim() !== '';
  };

  // Envio do formulário com validação completa
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário novamente antes de enviar
    if (!validateForm()) {
      notification.showError('Preencha todos os campos corretamente!');
      return;
    }
    
    // Enviar credenciais para login usando o hook useAuth
    login({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Entrar
      </Typography>

      {/* Mensagem de erro do Redux */}
      {error && (
        <Typography color="error" align="center" sx={{ mt: 2, mb: 2 }}>
Por favor, verifique seu email ou senha e Tente novamente        </Typography>
      )}

      {/* Campo de email/usuário */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email ou Nome de Usuário"
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={handleChange}
        onBlur={(e) => validateField('email', e.target.value)}
        disabled={loading}
        error={!!formErrors.email}
        helperText={formErrors.email}
        InputProps={{
          endAdornment: formData.email ? (
            <InputAdornment position="end">
              {!formErrors.email ? (
                <CheckCircleIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </InputAdornment>
          ) : null,
        }}
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
        onBlur={(e) => validateField('password', e.target.value)}
        disabled={loading}
        error={!!formErrors.password}
        helperText={formErrors.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {formData.password && !formErrors.password && (
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              )}
              {formData.password && formErrors.password && (
                <ErrorIcon color="error" sx={{ mr: 1 }} />
              )}
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

      {/* Botão de submit com validação */}
      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        disabled={loading || !isFormValid} 
        sx={{ mt: 3, mb: 2 }}
      >
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