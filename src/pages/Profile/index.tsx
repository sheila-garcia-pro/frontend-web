import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Camera, Delete } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '@store/index';
import { uploadUserImage } from '@services/api/auth';
import useNotification from '@hooks/useNotification';
import { useTheme } from '../../contexts/ThemeContext';
import { updateUserRequest } from '@store/slices/authSlice';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const notification = useNotification();
  const dispatch = useDispatch();
  const { mode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone ? applyPhoneMask(user.phone) : '',
    image: user?.image === undefined ? '' : user.image,
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
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Aplica máscara de telefone automaticamente
    if (name === 'phone') {
      processedValue = applyPhoneMask(value);
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

      const isValid = ['name', 'email', 'phone'].every((field) =>
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
      await dispatch(updateUserRequest(updateData)); // Verifica se houve mudança na imagem para mostrar notificação apropriada
      const hadImage = user.image && user.image.trim() !== '';
      const hasImage = formData.image && formData.image.trim() !== '';

      if (hadImage && !hasImage) {
        notification.showSuccess(t('profile.messages.imageRemoved'));
      } else if (!hadImage && hasImage) {
        notification.showSuccess(t('profile.messages.imageAdded'));
      } else if (hadImage && hasImage && formData.image !== user.image) {
        notification.showSuccess(t('profile.messages.imageUpdated'));
      }

      setIsEditing(false);
      setIsChangingPassword(false);
      setPasswordData({ password: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      notification.showError(t('profile.messages.updateError'));
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
      const result = await uploadUserImage(file);

      if (result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
      }
    } catch (error) {
      notification.showError(t('profile.messages.imageUploadError'));
    } finally {
      setUploading(false);
    }
  };

  function getInitials(name: string) {
    const nameParts = name.split(' ').filter((part) => part.length > 0);
    if (nameParts.length === 0) return '';
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        {' '}
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          {t('profile.title')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={formData.image}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: mode === 'light' ? '#3A4534' : '#E8EDAA',
                  color: mode === 'light' ? '#F5F3E7' : '#23291C',
                  fontSize: '2rem',
                  fontWeight: 'bold',
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
              />{' '}
              {isEditing && (
                <Box sx={{ position: 'absolute', right: -8, bottom: 16, display: 'flex', gap: 1 }}>
                  {formData.image && (
                    <Tooltip title={t('profile.actions.removePhoto')}>
                      <IconButton
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          boxShadow: 1,
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image: '', // Define explicitamente como string vazia para remover
                          }));
                        }}
                        disabled={uploading}
                      >
                        {uploading ? <CircularProgress size={24} /> : <Delete />}
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t('profile.actions.changePhoto')}>
                    <IconButton
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'primary.main', color: 'white' },
                      }}
                      onClick={handleImageClick}
                      disabled={uploading}
                    >
                      {uploading ? <CircularProgress size={24} /> : <Camera />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>{' '}
            <Typography variant="subtitle1" gutterBottom>
              {t('profile.plan', { plan: t('profile.planFree') })}
            </Typography>
          </Box>

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {' '}
            <TextField
              fullWidth
              label={t('profile.fields.fullName')}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />{' '}
            <TextField
              fullWidth
              label={t('profile.fields.email')}
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              fullWidth
              label={t('profile.fields.phone')}
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              placeholder={t('profile.fields.phonePlaceholder')}
              inputProps={{
                maxLength: 15, // Máximo para formato (99) 99999-9999
              }}
            />
            {isEditing && isChangingPassword ? (
              <>
                {' '}
                <TextField
                  fullWidth
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
                  label={t('profile.fields.confirmPassword')}
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                />
              </>
            ) : null}{' '}
            {!isEditing ? (
              <Button variant="contained" onClick={() => setIsEditing(true)} sx={{ mt: 2 }}>
                {t('profile.actions.edit')}
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setIsChangingPassword(false);
                    setPasswordData({ password: '', newPassword: '', confirmPassword: '' });
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone ? applyPhoneMask(user.phone) : '',
                      image: user?.image === undefined ? '' : user.image,
                    });
                  }}
                  sx={{ flex: 1 }}
                >
                  {t('profile.actions.cancel')}
                </Button>{' '}
                {!isChangingPassword && (
                  <Button
                    variant="outlined"
                    onClick={() => setIsChangingPassword(true)}
                    sx={{ flex: 1 }}
                  >
                    {t('profile.actions.changePassword')}
                  </Button>
                )}
                <Button variant="contained" onClick={handleSave} sx={{ flex: 1 }}>
                  {t('profile.actions.save')}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
