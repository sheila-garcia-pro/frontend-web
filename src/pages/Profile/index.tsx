import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Card,
  CardContent,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Camera, Delete, InfoOutlined } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '@store/index';
import useNotification from '@hooks/useNotification';
import { useTheme, alpha } from '@mui/material/styles';
import { updateUserRequest } from '@store/slices/authSlice';
import imageUploadService from '@services/imageUploadService';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const notification = useNotification();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para aplicar máscara de telefone
  const applyPhoneMask = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');

    // Aplica a máscara baseada no comprimento
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 7) {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
    } else if (numericValue.length <= 11) {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7)}`;
    } else {
      // Limita a 11 dígitos
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
    }
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

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone ? applyPhoneMask(user.phone) : '',
    image: user?.image && user.image.trim() !== '' ? user.image : '',
    dateOfBirth: user?.dateOfBirth || '',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Aplica máscara de telefone automaticamente
    if (name === 'phone') {
      processedValue = applyPhoneMask(value);
    }

    // Aplica formatação de data de nascimento automaticamente
    if (name === 'dateOfBirth') {
      processedValue = formatDateOfBirth(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    validateField(name, processedValue);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };
  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = t('profile.validation.nameRequired');
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = t('profile.validation.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = t('profile.validation.emailInvalid');
        }
        break;

      case 'phone':
        if (value) {
          // Remove caracteres não numéricos para validação
          const numericPhone = value.replace(/\D/g, '');
          if (numericPhone.length < 10 || numericPhone.length > 11) {
            error = t('profile.validation.phoneInvalid');
          }
        }
        break;

      case 'dateOfBirth':
        if (value) {
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
              }
            }
          }
        }
        break;
      case 'password':
        if (isChangingPassword && !value) {
          error = t('profile.validation.currentPasswordRequired');
        }
        break;

      case 'newPassword':
        if (isChangingPassword) {
          if (!value) {
            error = t('profile.validation.newPasswordRequired');
          } else if (value.length < 6) {
            error = t('profile.validation.passwordMinLength');
          }
        }
        break;

      case 'confirmPassword':
        if (isChangingPassword) {
          if (!value) {
            error = t('profile.validation.confirmPasswordRequired');
          } else if (value !== passwordData.newPassword) {
            error = t('profile.validation.passwordsNotMatch');
          }
        }
        break;

      default:
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;

      const isValid = ['name', 'email', 'phone', 'dateOfBirth'].every((field) =>
        validateField(field, formData[field as keyof typeof formData]),
      );
      if (!isValid) {
        notification.showError(t('profile.validation.fixFormErrors'));
        return;
      }

      if (isChangingPassword) {
        const isPasswordValid = ['password', 'newPassword', 'confirmPassword'].every((field) =>
          validateField(field, passwordData[field as keyof typeof passwordData]),
        );

        if (!isPasswordValid) {
          notification.showError(t('profile.validation.fixPasswordErrors'));
          return;
        }
      }
      const updateData: Record<string, string | null> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : '', // Remove formatação antes de enviar
        dateOfBirth: formData.dateOfBirth,
      };

      // Lógica para imagem:
      // - Se tem imagem: envia a URL da imagem
      // - Se não tem imagem (string vazia) e o usuário tinha imagem antes: envia null para deletar
      // - Se não tem imagem e nunca teve: omite o campo
      if (formData.image && formData.image.trim() !== '') {
        updateData.image = formData.image;
      } else if (user?.image && user.image.trim() !== '') {
        // Se o usuário tinha imagem e agora está vazia, enviar null para deletar
        updateData.image = null;
      }

      // Adiciona campos de senha se estiver alterando
      if (isChangingPassword) {
        updateData.password = passwordData.password;
        updateData.newPassword = passwordData.newPassword;
      }
      await dispatch(updateUserRequest(updateData));

      // Feedback específico para mudanças de imagem
      const hadImage = user.image && user.image.trim() !== '';
      const hasImage = formData.image && formData.image.trim() !== '';

      if (hadImage && !hasImage) {
        notification.showSuccess('Perfil atualizado! Foto removida com sucesso.');
      } else if (!hadImage && hasImage) {
        notification.showSuccess('Perfil atualizado! Foto adicionada com sucesso.');
      } else if (hadImage && hasImage && formData.image !== user.image) {
        notification.showSuccess('Perfil atualizado! Foto alterada com sucesso.');
      } else {
        notification.showSuccess('Perfil atualizado com sucesso!');
      }
      setIsChangingPassword(false);
      setPasswordData({ password: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      notification.showError(t('profile.messages.updateError'));
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.image || formData.image.trim() === '') {
      return;
    }

    try {
      setRemovingImage(true);

      // Usar API DELETE para remover a imagem do servidor imediatamente
      const result = await imageUploadService.deleteImage(formData.image);

      if (result.success) {
        // Marcar imagem como removida localmente
        setFormData((prev) => ({
          ...prev,
          image: '', // Define explicitamente como string vazia para remover
        }));

        notification.showSuccess('Foto removida com sucesso!');
      } else {
        // Mesmo se der erro no servidor, permitir remoção local
        setFormData((prev) => ({
          ...prev,
          image: '',
        }));
        notification.showWarning(
          `Foto removida localmente. ${result.message || 'Erro ao remover do servidor'}`,
        );
      }
    } catch (error: any) {
      // Mesmo com erro, permitir remoção local para não travar UX
      setFormData((prev) => ({
        ...prev,
        image: '',
      }));
      notification.showWarning('Foto removida localmente. Erro ao comunicar com servidor.');
    } finally {
      setRemovingImage(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Usar o método uploadImage com a URL da imagem atual
      const result = await imageUploadService.uploadImage(file, 'users', formData.image || null);

      if (result.success) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        notification.showSuccess(result.message || 'Foto atualizada com sucesso!');
      } else {
        throw new Error(result.message || 'Erro no upload');
      }
    } catch (error: any) {
      notification.showError(error.message || t('profile.messages.imageUploadError'));
    } finally {
      setUploading(false);
      // Limpar o input para permitir seleção do mesmo arquivo novamente se necessário
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  function getInitials(name: string) {
    const nameParts = name.split(' ').filter((part) => part.length > 0);
    if (nameParts.length === 0) return '';
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }

  const stats = [
    { label: 'Ingredientes', value: 0 },
    { label: 'Receitas', value: 0 },
    { label: 'Cardapios', value: 0 },
  ];

  const planLabel = 'Plano: Gratis';

  const handleChoosePlan = () => {
    notification.showInfo('Funcionalidade de planos em desenvolvimento.');
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2.5, md: 3 },
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 320px) minmax(0, 1fr)' },
        }}
      >
        <Card
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={formData.image}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.dark,
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
              >
                {!formData.image && user?.name ? getInitials(user.name) : '?'}
              </Avatar>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
              <Box sx={{ position: 'absolute', right: -8, bottom: 12, display: 'flex', gap: 1 }}>
                {formData.image && (
                  <Tooltip title={t('profile.actions.removePhoto')}>
                    <IconButton
                      sx={{
                        bgcolor: theme.palette.error.main,
                        color: theme.palette.common.white,
                        boxShadow: 1,
                        '&:hover': { bgcolor: theme.palette.error.dark },
                      }}
                      onClick={handleRemoveImage}
                      disabled={uploading || removingImage}
                    >
                      {removingImage ? <CircularProgress size={20} /> : <Delete />}
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={t('profile.actions.changePhoto')}>
                  <IconButton
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      boxShadow: 1,
                      '&:hover': {
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      },
                    }}
                    onClick={handleImageClick}
                    disabled={uploading || removingImage}
                  >
                    {uploading ? <CircularProgress size={20} /> : <Camera />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.name || t('profile.fields.fullName')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || t('profile.fields.email')}
              </Typography>
            </Box>

            <Chip
              label={planLabel}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            />

            <Divider flexItem sx={{ my: 1 }} />

            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {stat.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          }}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">Detalhes Pessoais</Typography>
              <Tooltip title="Informacoes do seu perfil">
                <InfoOutlined fontSize="small" color="action" />
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label={t('profile.fields.fullName')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              <TextField
                fullWidth
                size="small"
                label={t('profile.fields.email')}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              <TextField
                fullWidth
                size="small"
                label={t('profile.fields.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                placeholder={t('profile.fields.phonePlaceholder')}
                inputProps={{
                  maxLength: 15,
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Data de Nascimento"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                error={!!formErrors.dateOfBirth}
                helperText={formErrors.dateOfBirth}
                placeholder="DD/MM/YYYY"
                inputProps={{
                  maxLength: 10,
                }}
              />
            </Box>

            {isChangingPassword ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('profile.fields.currentPassword')}
                  name="password"
                  type="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={t('profile.fields.newPassword')}
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={!!formErrors.newPassword}
                  helperText={formErrors.newPassword}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={t('profile.fields.confirmPassword')}
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                />
              </Box>
            ) : (
              <Button
                variant="text"
                size="small"
                onClick={() => setIsChangingPassword(true)}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('profile.actions.changePassword')}
              </Button>
            )}

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
              }}
            >
              <Button variant="contained" onClick={handleSave} fullWidth>
                Salvar Alteracoes
              </Button>
              <Button variant="outlined" onClick={handleChoosePlan} fullWidth>
                Escolher plano
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ProfilePage;
