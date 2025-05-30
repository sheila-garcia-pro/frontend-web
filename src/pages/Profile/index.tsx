import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { updateUser } from '@services/api/auth';
import useNotification from '@hooks/useNotification';
import { useTheme } from '../../contexts/ThemeContext';

const ProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const notification = useNotification();
  const { mode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (user?.id) {
        await updateUser({
          id: user.id,
          ...formData,
        });
        notification.showSuccess('Perfil atualizado com sucesso!');
        setIsEditing(false);
      }
    } catch (error) {
      notification.showError('Erro ao atualizar perfil. Tente novamente.');
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
            <Avatar
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
              {user?.name ? getInitials(user.name) : '?'}
            </Avatar>
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
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
            />

            <TextField
              fullWidth
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
            />

            {!isEditing ? (
              <Button variant="contained" onClick={() => setIsEditing(true)} sx={{ mt: 2 }}>
                Editar Perfil
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => setIsEditing(false)} sx={{ flex: 1 }}>
                  Cancelar
                </Button>
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
