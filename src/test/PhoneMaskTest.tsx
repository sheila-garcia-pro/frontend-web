import React, { useState } from 'react';
import { TextField, Box, Typography } from '@mui/material';

const PhoneMaskTest: React.FC = () => {
  const [phone, setPhone] = useState('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyPhoneMask(e.target.value);
    setPhone(maskedValue);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Teste de Máscara de Telefone
      </Typography>

      <TextField
        fullWidth
        label="Telefone"
        value={phone}
        onChange={handleChange}
        placeholder="Digite seu telefone"
        inputProps={{
          maxLength: 15,
        }}
        sx={{ mb: 2 }}
      />

      <Typography variant="body2" color="textSecondary">
        Valor sem formatação: {phone.replace(/\D/g, '')}
      </Typography>

      <Typography variant="body2" color="textSecondary">
        Exemplos de formatação:
      </Typography>
      <ul>
        <li>11 → 11</li>
        <li>11977 → (11) 977</li>
        <li>1197703639 → (11) 97703-6393</li>
        <li>11977036393 → (11) 97703-6393</li>
      </ul>
    </Box>
  );
};

export default PhoneMaskTest;
