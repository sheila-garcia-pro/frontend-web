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
import { RootState } from '@store/index';
import { updateUser, uploadUserImage } from '@services/api/auth';
import useNotification from '@hooks/useNotification';
import { useTheme } from '../../contexts/ThemeContext';
import { updateUserRequest } from '@store/slices/authSlice';

const ProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const notification = useNotification();
  const dispatch = useDispatch();
  const { mode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
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
          error = 'Nome é obrigatório';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email inválido';
        }
        break;

      case 'phone':
        if (value && !/^\(\d{2}\) \d{5}-\d{4}$/.test(value)) {
          error = 'Telefone deve estar no formato (99) 99999-9999';
        }
        break;

      case 'password':
        if (isChangingPassword && !value) {
          error = 'Senha atual é obrigatória';
        }
        break;

      case 'newPassword':
        if (isChangingPassword) {
          if (!value) {
            error = 'Nova senha é obrigatória';
          } else if (value.length < 6) {
            error = 'A senha deve ter pelo menos 6 caracteres';
          }
        }
        break;

      case 'confirmPassword':
        if (isChangingPassword) {
          if (!value) {
            error = 'Confirmação de senha é obrigatória';
          } else if (value !== passwordData.newPassword) {
            error = 'As senhas não coincidem';
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
        notification.showError('Por favor, corrija os erros no formulário');
        return;
      }

      if (isChangingPassword) {
        const isPasswordValid = ['password', 'newPassword', 'confirmPassword'].every((field) =>
          validateField(field, passwordData[field as keyof typeof passwordData]),
        );

        if (!isPasswordValid) {
          notification.showError('Por favor, corrija os erros no formulário de senha');
          return;
        }
      }
      const updateData: Record<string, string> = {};

      // Dados básicos (enviar sempre que estivermos editando)
      if (isEditing) {
        updateData.name = formData.name;
        updateData.email = formData.email;
        updateData.phone = formData.phone || '';
        updateData.image = formData.image; // Sempre envia o estado atual da imagem
      } // Tratamento específico para imagem
      // Sempre inclui o campo image se estivermos editando,
      // para garantir que ele será enviado como string vazia quando removermos a imagem
      if (formData.image !== user.image || formData.image === '') {
        updateData.image = formData.image;
      }

      // Dados de senha
      if (isChangingPassword) {
        updateData.password = passwordData.password;
        updateData.newPassword = passwordData.newPassword;
      }

      dispatch(updateUserRequest(updateData));

      // Mostrar mensagem de sucesso
      if (formData.image !== user.image) {
        notification.showSuccess(
          formData.image ? 'Imagem atualizada com sucesso!' : 'Imagem removida com sucesso!',
        );
      }

      setIsEditing(false);
      setIsChangingPassword(false);
      setPasswordData({ password: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      notification.showError('Erro ao atualizar perfil. Tente novamente.');
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
      notification.showError('Erro ao fazer upload da imagem. Tente novamente.');
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
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Detalhes Pessoais
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
                    <Tooltip title="Remover foto">
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
                  <Tooltip title="Alterar foto">
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
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              Plano: Grátis
            </Typography>
          </Box>

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />

            <TextField
              fullWidth
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              placeholder="(99) 99999-9999"
            />

            {isEditing && isChangingPassword ? (
              <>
                <TextField
                  fullWidth
                  label="Senha Atual"
                  name="password"
                  type="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />

                <TextField
                  fullWidth
                  label="Nova Senha"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={!!formErrors.newPassword}
                  helperText={formErrors.newPassword}
                />

                <TextField
                  fullWidth
                  label="Confirmar Nova Senha"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                />
              </>
            ) : null}

            {!isEditing ? (
              <Button variant="contained" onClick={() => setIsEditing(true)} sx={{ mt: 2 }}>
                Editar Perfil
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
                      phone: user?.phone || '',
                      image: user?.image === undefined ? '' : user.image,
                    });
                  }}
                  sx={{ flex: 1 }}
                >
                  Cancelar
                </Button>
                {!isChangingPassword && (
                  <Button
                    variant="outlined"
                    onClick={() => setIsChangingPassword(true)}
                    sx={{ flex: 1 }}
                  >
                    Alterar Senha
                  </Button>
                )}
                <Button variant="contained" onClick={handleSave} sx={{ flex: 1 }}>
                  Salvar Alterações
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
