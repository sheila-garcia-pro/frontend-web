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
} from '@mui/material';
import { RootState } from '@store/index';
import { forgotPasswordRequest, forgotPasswordSuccess } from '@store/slices/authSlice';
import { addNotification } from '@store/slices/uiSlice';

// Componente da página de recuperação de senha
const ForgotPasswordPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Estado do formulário
  const [email, setEmail] = useState('');

  // Manipulador de mudança no campo de email
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Validação do email
  const validateEmail = () => {
    if (!email.trim()) {
      dispatch(addNotification({
        message: 'O campo de e-mail é obrigatório.',
        type: 'error',
      }));
      return false;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      dispatch(addNotification({
        message: 'Digite um e-mail válido.',
        type: 'error',
      }));
      return false;
    }

    return true;
  };

  // Envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateEmail()) {
      try {
        // Enviando solicitação para o Redux (para compatibilidade futura com API)
        dispatch(forgotPasswordRequest({ email }));

        // Simulando um tempo de processamento
        setTimeout(() => {
          // Verificando se o email é o mesmo do mock
          if (email === 'teste@teste.com') {
            // Simulando sucesso
            dispatch(forgotPasswordSuccess());
            
            // Exibindo mensagem de sucesso
            dispatch(addNotification({
              message: 'Instruções de redefinição enviadas para seu e-mail!',
              type: 'success',
            }));
            
            // Redirecionando para a página de login
            navigate('/login');
          } else {
            // Simulando erro para outros emails
            dispatch(addNotification({
              message: 'Erro ao enviar instruções de redefinição. Tente novamente.',
              type: 'error',
            }));
          }
        }, 1000);
      } catch (error) {
        // Tratamento de erros inesperados
        console.error('Erro ao solicitar redefinição de senha:', error);
        dispatch(addNotification({
          message: 'Erro ao enviar instruções de redefinição. Tente novamente.',
          type: 'error',
        }));
      }
    }
  };

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
        disabled={loading}
      />

      {/* Botão de submit */}
      <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2 }}>
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