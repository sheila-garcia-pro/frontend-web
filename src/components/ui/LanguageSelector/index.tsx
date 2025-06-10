import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Select, MenuItem, SelectChangeEvent } from '@mui/material';

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

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      {' '}
      <Select
        value={i18n.language?.substring(0, 2) || 'en'}
        onChange={handleLanguageChange}
        size="small"
        label={t('language')}
        sx={{
          color: 'inherit',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'inherit' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'inherit' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'inherit' },
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
