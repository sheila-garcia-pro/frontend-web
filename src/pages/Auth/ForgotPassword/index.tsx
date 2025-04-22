import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { RootState } from '@store/index';
import { forgotPasswordRequest, logout } from '@store/slices/authSlice';
import { addNotification } from '@store/slices/uiSlice';

// Componente da página de recuperação de senha
const ForgotPasswordPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Limpar token e fazer logout quando acessar esta página
  useEffect(() => {
    // Limpar o token do localStorage
    const tokenKey = process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token';
    localStorage.removeItem(tokenKey);
    
    // Despachar ação de logout para garantir que o estado de autenticação seja limpo
    dispatch(logout());
  }, [dispatch]);

  // Estado do formulário
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Manipulador de mudança no campo de email
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  // Validação do email
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError('O campo de e-mail é obrigatório');
      setIsEmailValid(false);
      return false;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Digite um e-mail válido');
      setIsEmailValid(false);
      return false;
    }

    setEmailError('');
    setIsEmailValid(true);
    return true;
  };

  // Envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateEmail(email)) {
      // Usando o Redux para enviar a solicitação para a API
      dispatch(forgotPasswordRequest({ email }));
    }
  };

  // Se sucesso (controlado pelo saga) - o redirecionamento para login será feito automaticamente

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Esqueci minha senha
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
        Digite seu e-mail abaixo para receber instruções de redefinição de senha.
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
        value={email}
        onChange={handleChange}
        onBlur={() => validateEmail(email)}
        disabled={loading}
        error={!!emailError}
        helperText={emailError}
        InputProps={{
          endAdornment: email ? (
            <InputAdornment position="end">
              {isEmailValid ? (
                <CheckCircleIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Botão de submit */}
      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        disabled={loading || !isEmailValid} 
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar instruções de redefinição'}
      </Button>

      {/* Link para voltar ao login */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2">
          Lembrou sua senha? Faça login
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage; 