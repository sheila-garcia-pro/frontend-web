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
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { addNotification } from '@store/slices/uiSlice';
import { useAuth } from '@hooks/useAuth';

// Componente para mostrar a força da senha
const PasswordStrengthIndicator: React.FC<{ strength: 'weak' | 'medium' | 'strong' }> = ({
  strength,
}) => {
  const getColor = () => {
    switch (strength) {
      case 'weak':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'strong':
        return 'success.main';
      default:
        return 'error.main';
    }
  };

  const getLabel = () => {
    switch (strength) {
      case 'weak':
        return 'Fraca';
      case 'medium':
        return 'Média';
      case 'strong':
        return 'Forte';
      default:
        return 'Fraca';
    }
  };

  const getValue = () => {
    switch (strength) {
      case 'weak':
        return 33;
      case 'medium':
        return 66;
      case 'strong':
        return 100;
      default:
        return 0;
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
        color={strength === 'weak' ? 'error' : strength === 'medium' ? 'warning' : 'success'}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

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
    dateOfBirth: '',
  });

  // Estado para erros de validação
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });

  // Estado para a força da senha
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Estado para validação do formulário completo
  const [isFormValid, setIsFormValid] = useState(false);

  // Estado para mostrar/esconder a senha
  const [showPassword, setShowPassword] = useState(false);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
      case 'name':
        if (!value.trim()) {
          error = 'Nome é obrigatório';
        } else if (value.trim().length < 3) {
          error = 'O nome deve ter pelo menos 3 caracteres';
        } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) {
          error = 'O nome deve conter apenas letras e espaços';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email é obrigatório';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'Email inválido';
          }
        }
        break;

      case 'phone':
        if (!value.trim()) {
          error = 'Telefone é obrigatório';
        } else {
          const numericValue = value.replace(/\D/g, '');
          if (!/^\d+$/.test(numericValue)) {
            error = 'O telefone deve conter apenas números';
          } else if (numericValue.length < 10 || numericValue.length > 11) {
            error = 'O telefone deve ter entre 10 e 11 dígitos com DDD';
          }
        }
        break;

      case 'dateOfBirth':
        if (!value.trim()) {
          error = 'Data de nascimento é obrigatória';
        } else {
          // Validar formato DD/MM/YYYY
          const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
          const match = value.match(dateRegex);

          if (!match) {
            error = 'Use o formato DD/MM/YYYY';
          } else {
            const [, day, month, year] = match;
            const dayNum = parseInt(day, 10);
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(year, 10);
            const currentYear = new Date().getFullYear();

            // Validar valores válidos
            if (monthNum < 1 || monthNum > 12) {
              error = 'Mês inválido';
            } else if (dayNum < 1 || dayNum > 31) {
              error = 'Dia inválido';
            } else if (yearNum < 1900 || yearNum > currentYear) {
              error = `Ano deve estar entre 1900 e ${currentYear}`;
            } else {
              // Validar data específica
              const date = new Date(yearNum, monthNum - 1, dayNum);
              if (
                date.getDate() !== dayNum ||
                date.getMonth() !== monthNum - 1 ||
                date.getFullYear() !== yearNum
              ) {
                error = 'Data inválida';
              } else {
                // Verificar se é maior de idade (18 anos)
                const today = new Date();
                const birthDate = new Date(yearNum, monthNum - 1, dayNum);
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (
                  age < 18 ||
                  (age === 18 && monthDiff < 0) ||
                  (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())
                ) {
                  error = 'Você deve ter pelo menos 18 anos';
                }
              }
            }
          }
        }
        break;

      case 'password':
        if (!value) {
          error = 'Senha é obrigatória';
        } else {
          const strength = evaluatePasswordStrength(value);
          setPasswordStrength(strength);

          if (strength !== 'strong') {
            error = 'Use letras maiúsculas, minúsculas, números e símbolos';
          }

          // Validar novamente a confirmação de senha se já preenchida
          if (formData.confirmPassword && value !== formData.confirmPassword) {
            setFormErrors((prev) => ({
              ...prev,
              confirmPassword: 'As senhas não coincidem',
            }));
          } else if (formData.confirmPassword) {
            setFormErrors((prev) => ({
              ...prev,
              confirmPassword: '',
            }));
          }
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Confirme sua senha';
        } else if (value !== formData.password) {
          error = 'As senhas não coincidem';
        }
        break;

      default:
        break;
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));

    // Validar formulário completo com delay para garantir atualização
    setTimeout(() => {
      const newErrors = { ...formErrors, [name]: error };
      const allFieldsValid = Object.values(newErrors).every((err) => !err);
      const allFieldsFilled =
        formData.name.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.phone.trim() !== '' &&
        formData.password !== '' &&
        formData.confirmPassword !== '' &&
        formData.dateOfBirth.trim() !== '';
      const isPasswordStrongEnough = passwordStrength === 'strong';

      setIsFormValid(allFieldsValid && allFieldsFilled && isPasswordStrongEnough);
    }, 100);
  };

  // Função para formatar a data de nascimento
  const formatDateOfBirth = (value: string): string => {
    // Remove tudo que não é número
    const numeric = value.replace(/\D/g, '');

    // Aplica a máscara DD/MM/YYYY
    if (numeric.length <= 2) {
      return numeric;
    } else if (numeric.length <= 4) {
      return numeric.replace(/(\d{2})(\d+)/, '$1/$2');
    } else {
      return numeric.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3').slice(0, 10);
    }
  };

  // Manipulador de mudança nos campos com validação em tempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;

    // Aplicar formatação específica para data de nascimento
    if (name === 'dateOfBirth') {
      formattedValue = formatDateOfBirth(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    validateField(name, formattedValue);
  };

  // Toggle visibilidade da senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Validar formulário completo
  const validateForm = () => {
    // Validar todos os campos
    Object.entries(formData).forEach(([name, value]) => {
      validateField(name, value as string);
    });

    // Verificar todas as condições
    const noErrors = Object.values(formErrors).every((err) => !err);
    const allFilled =
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.password !== '' &&
      formData.confirmPassword !== '' &&
      formData.dateOfBirth.trim() !== '';
    const strongPassword = passwordStrength === 'strong';

    return noErrors && allFilled && strongPassword;
  };

  // Envio do formulário com validação completa
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário novamente antes de enviar
    if (!validateForm()) {
      dispatch(
        addNotification({
          message: 'Preencha todos os campos corretamente!',
          type: 'error',
        }),
      );
      return;
    }

    // Enviar credenciais para registro usando o hook useAuth
    register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Criar Conta
      </Typography>

      {/* Mensagem de erro do Redux */}
      {error && (
        <Typography color="error" align="center" sx={{ mt: 2, mb: 2 }}>
          Por favor, verifique seus dados e tente novamente.
        </Typography>
      )}

      {/* Campo de nome */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Nome Completo"
        name="name"
        autoComplete="name"
        autoFocus
        value={formData.name}
        onChange={handleChange}
        onBlur={(e) => validateField('name', e.target.value)}
        disabled={loading}
        error={!!formErrors.name}
        helperText={formErrors.name}
        InputProps={{
          endAdornment: formData.name ? (
            <InputAdornment position="end">
              {!formErrors.name ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Campo de email */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
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

      {/* Campo de telefone */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="phone"
        label="Telefone com DDD"
        name="phone"
        autoComplete="tel"
        value={formData.phone}
        onChange={handleChange}
        onBlur={(e) => validateField('phone', e.target.value)}
        disabled={loading}
        error={!!formErrors.phone}
        helperText={formErrors.phone}
        InputProps={{
          endAdornment: formData.phone ? (
            <InputAdornment position="end">
              {!formErrors.phone ? (
                <CheckCircleIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Campo de data de nascimento */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="dateOfBirth"
        label="Data de Nascimento (DD/MM/YYYY)"
        name="dateOfBirth"
        placeholder="DD/MM/YYYY"
        value={formData.dateOfBirth}
        onChange={handleChange}
        onBlur={(e) => validateField('dateOfBirth', e.target.value)}
        disabled={loading}
        error={!!formErrors.dateOfBirth}
        helperText={formErrors.dateOfBirth}
        InputProps={{
          endAdornment: formData.dateOfBirth ? (
            <InputAdornment position="end">
              {!formErrors.dateOfBirth ? (
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
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        onBlur={(e) => validateField('password', e.target.value)}
        disabled={loading}
        error={!!formErrors.password}
        helperText={formErrors.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {formData.password && passwordStrength === 'strong' && (
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              )}
              {formData.password && passwordStrength !== 'strong' && (
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
      {formData.password && <PasswordStrengthIndicator strength={passwordStrength} />}

      {/* Campo de confirmação de senha */}
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirmar Senha"
        type={showPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={(e) => validateField('confirmPassword', e.target.value)}
        disabled={loading}
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

      {/* Botão de submit com validação */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading || !isFormValid}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar'}
      </Button>

      {/* Link para login */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link component={RouterLink} to="/login" variant="body2">
          Já tem uma conta? Faça login
        </Link>
      </Box>
    </Box>
  );
};

export default RegisterPage;
