import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { RootState } from '@store/index';
import { resetPasswordRequest, logout } from '@store/slices/authSlice';
import { addNotification } from '@store/slices/uiSlice';

// Componente para mostrar a força da senha
const PasswordStrengthIndicator: React.FC<{ strength: 'weak' | 'medium' | 'strong' }> = ({ strength }) => {
  const getColor = () => {
    switch (strength) {
      case 'weak': return 'error.main';
      case 'medium': return 'warning.main';
      case 'strong': return 'success.main';
      default: return 'error.main';
    }
  };
  
  const getLabel = () => {
    switch (strength) {
      case 'weak': return 'Fraca';
      case 'medium': return 'Média';
      case 'strong': return 'Forte';
      default: return 'Fraca';
    }
  };
  
  const getValue = () => {
    switch (strength) {
      case 'weak': return 33;
      case 'medium': return 66;
      case 'strong': return 100;
      default: return 0;
    }
  };
  
  return (
    <Box sx={{ mt: 1, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color={getColor()}>
          Força da senha: {getLabel()}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={getValue()} 
        color={
          strength === 'weak' ? 'error' : 
          strength === 'medium' ? 'warning' : 'success'
        }
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

// Componente da página de redefinição de senha
const ResetPasswordPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Limpar token e fazer logout quando acessar esta página
  useEffect(() => {
    // Limpar o token do localStorage para evitar login automático
    const tokenKey = process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token';
    localStorage.removeItem(tokenKey);
    
    // Despachar ação de logout para garantir que o estado de autenticação seja limpo
    dispatch(logout());
  }, [dispatch]);

  // Obter token da URL
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Extrair o token da query string ou da URL
    const queryParams = new URLSearchParams(location.search);
    const tokenFromQuery = queryParams.get('token');
    
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    } else {
      // Se não houver token, não fazer nada - a UI já mostrará uma mensagem
      // Removemos a notificação para evitar duplicação de mensagens
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez na montagem do componente

  // Estado do formulário
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Estado para erros de validação
  const [formErrors, setFormErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Estado para a força da senha
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  
  // Estado para validação do formulário completo
  const [isFormValid, setIsFormValid] = useState(false);

  // Estado para mostrar/esconder a senha
  const [showPassword, setShowPassword] = useState(false);

  // Função para avaliar a força da senha
  const evaluatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (!password) return 'weak';
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length >= 8 && hasLowerCase && hasUpperCase && hasNumbers && hasSymbols) {
      return 'strong';
    } else if (password.length >= 8 && (hasLowerCase || hasUpperCase) && hasNumbers) {
      return 'medium';
    } else {
      return 'weak';
    }
  };

  // Validar campo individual
  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'newPassword':
        if (!value) {
          error = 'Nova senha é obrigatória';
        } else {
          const strength = evaluatePasswordStrength(value);
          setPasswordStrength(strength);
          
          if (strength !== 'strong') {
            error = 'Use letras maiúsculas, minúsculas, números e símbolos';
          }
          
          // Validar novamente a confirmação de senha se já preenchida
          if (formData.confirmPassword && value !== formData.confirmPassword) {
            setFormErrors(prev => ({
              ...prev,
              confirmPassword: 'As senhas não coincidem'
            }));
          } else if (formData.confirmPassword) {
            setFormErrors(prev => ({
              ...prev,
              confirmPassword: ''
            }));
          }
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Confirme sua senha';
        } else if (value !== formData.newPassword) {
          error = 'As senhas não coincidem';
        }
        break;
        
      default:
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [name]: error }));
    
    // Validar formulário completo com delay para garantir atualização
    setTimeout(() => {
      const newErrors = { ...formErrors, [name]: error };
      const allFieldsValid = !newErrors.newPassword && !newErrors.confirmPassword;
      const allFieldsFilled = formData.newPassword !== '' && formData.confirmPassword !== '';
      const isPasswordStrongEnough = passwordStrength === 'strong';
      
      setIsFormValid(allFieldsValid && allFieldsFilled && isPasswordStrongEnough);
    }, 100);
  };

  // Manipulador de mudança nos campos com validação em tempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    validateField(name, value);
  };

  // Toggle visibilidade da senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Validar formulário completo
  const validateForm = () => {
    // Validar todos os campos
    Object.entries(formData).forEach(([name, value]) => {
      validateField(name, value as string);
    });
    
    // Verificar todas as condições
    const noErrors = !formErrors.newPassword && !formErrors.confirmPassword;
    const allFilled = formData.newPassword !== '' && formData.confirmPassword !== '';
    const strongPassword = passwordStrength === 'strong';
    
    return noErrors && allFilled && strongPassword;
  };

  // Envio do formulário com validação completa
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      dispatch(addNotification({
        message: 'Por favor, tente novamente.',
        type: 'error',
      }));
      navigate('/login');
      return;
    }

    // Verificação adicional para garantir que o token seja válido
    if (token.trim().length < 10) {
      dispatch(addNotification({
        message: 'Por favor, tente novamente.',
        type: 'error',
      }));
      navigate('/login');
      return;
    }

    // Validar formulário antes de enviar
    if (!validateForm()) {
      dispatch(addNotification({
        message: 'Preencha todos os campos corretamente antes de continuar',
        type: 'error',
      }));
      return;
    }

    // Enviar solicitação de redefinição de senha
    dispatch(resetPasswordRequest({
      token,
      newPassword: formData.newPassword,
    }));
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
        Redefinir Senha
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
        Digite sua nova senha abaixo para redefinir seu acesso.
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
          Erro de autenticação. Não foi possível redefinir a senha.
        </Typography>
      )}

      {!token && (
        <Box sx={{ mb: 3, p: 2, borderRadius: 1 }}>
          <Typography color="error.dark" align="center" sx={{ mb: 1, fontWeight: 'medium' }}>
            Erro de Autenticação
          </Typography>
          <Typography color="error.dark" variant="body2">
            Ocorreu um erro durante o processo de autenticação. Por favor, retorne à
            <Link component={RouterLink} to="/login" sx={{ mx: 1 }}>
              página de login
            </Link>
            e tente novamente.
          </Typography>
        </Box>
      )}

      {/* Campo de nova senha */}
      <TextField
        margin="normal"
        fullWidth
        name="newPassword"
        label="Nova Senha"
        type={showPassword ? 'text' : 'password'}
        id="newPassword"
        autoComplete="new-password"
        value={formData.newPassword}
        onChange={handleChange}
        onBlur={(e) => validateField('newPassword', e.target.value)}
        disabled={loading || !token}
        required
        error={!!formErrors.newPassword}
        helperText={formErrors.newPassword}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {formData.newPassword && passwordStrength === 'strong' && (
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              )}
              {formData.newPassword && passwordStrength !== 'strong' && (
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
      
      {/* Indicador de força da senha */}
      {formData.newPassword && (
        <PasswordStrengthIndicator strength={passwordStrength} />
      )}

      {/* Campo de confirmação de senha */}
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
        onBlur={(e) => validateField('confirmPassword', e.target.value)}
        disabled={loading || !token}
        required
        error={!!formErrors.confirmPassword}
        helperText={formErrors.confirmPassword}
        InputProps={{
          endAdornment: formData.confirmPassword ? (
            <InputAdornment position="end">
              {!formErrors.confirmPassword ? (
                <CheckCircleIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Botão de redefiniação com validação */}
      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        sx={{ mt: 3, mb: 2 }} 
        disabled={loading || !isFormValid || !token}
      >
        {loading ? <CircularProgress size={24} /> : 'Redefinir Senha'}
      </Button>

      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2">
          Lembrou sua senha? Faça login
        </Link>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage; 