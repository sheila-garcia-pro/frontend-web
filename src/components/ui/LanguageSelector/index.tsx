import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Select, MenuItem, SelectChangeEvent, useTheme } from '@mui/material';

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
];

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <Select
        value={i18n.language?.substring(0, 2) || 'en'}
        onChange={handleLanguageChange}
        size="small"
        label={t('language')}
        sx={{
          color: theme.palette.text.primary,
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
          },
          '& .MuiSelect-icon': {
            color: theme.palette.text.primary,
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {lang.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default LanguageSelector;
