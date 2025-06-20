import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button } from '@mui/material';

const TranslationTest: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Teste de Tradução - Página de Perfil
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => changeLanguage('pt')}
          color={i18n.language === 'pt' ? 'primary' : 'secondary'}
        >
          Português
        </Button>
        <Button
          variant="contained"
          onClick={() => changeLanguage('en')}
          color={i18n.language === 'en' ? 'primary' : 'secondary'}
        >
          English
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography>
          <strong>Título:</strong> {t('profile.title')}
        </Typography>
        <Typography>
          <strong>Nome Completo:</strong> {t('profile.fields.fullName')}
        </Typography>
        <Typography>
          <strong>Email:</strong> {t('profile.fields.email')}
        </Typography>
        <Typography>
          <strong>Telefone:</strong> {t('profile.fields.phone')}
        </Typography>
        <Typography>
          <strong>Placeholder Telefone:</strong> {t('profile.fields.phonePlaceholder')}
        </Typography>
        <Typography>
          <strong>Senha Atual:</strong> {t('profile.fields.currentPassword')}
        </Typography>
        <Typography>
          <strong>Nova Senha:</strong> {t('profile.fields.newPassword')}
        </Typography>
        <Typography>
          <strong>Confirmar Senha:</strong> {t('profile.fields.confirmPassword')}
        </Typography>
        <Typography>
          <strong>Editar Perfil:</strong> {t('profile.actions.edit')}
        </Typography>
        <Typography>
          <strong>Cancelar:</strong> {t('profile.actions.cancel')}
        </Typography>
        <Typography>
          <strong>Salvar:</strong> {t('profile.actions.save')}
        </Typography>
        <Typography>
          <strong>Alterar Senha:</strong> {t('profile.actions.changePassword')}
        </Typography>
        <Typography>
          <strong>Remover Foto:</strong> {t('profile.actions.removePhoto')}
        </Typography>
        <Typography>
          <strong>Alterar Foto:</strong> {t('profile.actions.changePhoto')}
        </Typography>
        <Typography>
          <strong>Plano:</strong> {t('profile.plan', { plan: t('profile.planFree') })}
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Mensagens de Validação:
        </Typography>
        <Typography>
          <strong>Nome obrigatório:</strong> {t('profile.validation.nameRequired')}
        </Typography>
        <Typography>
          <strong>Email inválido:</strong> {t('profile.validation.emailInvalid')}
        </Typography>
        <Typography>
          <strong>Telefone inválido:</strong> {t('profile.validation.phoneInvalid')}
        </Typography>
        <Typography>
          <strong>Senhas não coincidem:</strong> {t('profile.validation.passwordsNotMatch')}
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Mensagens de Sucesso/Erro:
        </Typography>
        <Typography>
          <strong>Imagem adicionada:</strong> {t('profile.messages.imageAdded')}
        </Typography>
        <Typography>
          <strong>Imagem removida:</strong> {t('profile.messages.imageRemoved')}
        </Typography>
        <Typography>
          <strong>Erro de upload:</strong> {t('profile.messages.imageUploadError')}
        </Typography>
      </Box>
    </Box>
  );
};

export default TranslationTest;
