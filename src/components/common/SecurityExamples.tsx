import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { maskEmail, maskCardNumber, maskPhone, maskDocument } from '@utils/security';
import { log } from '@utils/logger';

/**
 * Este componente serve como um exemplo de uso dos utilitários de segurança
 * para mascarar dados sensíveis no frontend
 */
const SecurityExamples: React.FC = () => {
  // Exemplos de dados sensíveis (simulados)
  const userData = {
    name: 'João da Silva',
    email: 'joao.silva@exemplo.com',
    cpf: '123.456.789-10',
    phone: '(11) 98765-4321',
    cardNumber: '4111 1111 1111 1111',
    cardExpiry: '12/25',
    cardCVV: '123'
  };

  // Exemplo de uso do logger seguro
  React.useEffect(() => {
    // O logger sanitiza automaticamente dados sensíveis
    log.info('Dados do usuário carregados', userData);
    
    // O cartão de crédito e outros dados sensíveis serão mascarados automaticamente no log
  }, []);

  return (
    <Paper sx={{ p: 3, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Exemplos de Mascaramento de Dados Sensíveis
      </Typography>
      
      <Typography variant="body2" paragraph>
        Abaixo estão exemplos de como os dados sensíveis são mascarados para exibição 
        ao usuário, protegendo informações confidenciais.
      </Typography>
      
      <List>
        <ListItem>
          <ListItemText 
            primary="Email" 
            secondary={`Original: ${userData.email} | Mascarado: ${maskEmail(userData.email)}`} 
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="CPF" 
            secondary={`Original: ${userData.cpf} | Mascarado: ${maskDocument(userData.cpf)}`} 
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Telefone" 
            secondary={`Original: ${userData.phone} | Mascarado: ${maskPhone(userData.phone)}`} 
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Cartão de Crédito" 
            secondary={`Original: ${userData.cardNumber} | Mascarado: ${maskCardNumber(userData.cardNumber)}`} 
          />
        </ListItem>
      </List>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Nota: Este componente é apenas para demonstração. 
          Em um ambiente real, os dados originais nunca devem ser 
          exibidos ou armazenados sem a devida proteção.
        </Typography>
      </Box>
    </Paper>
  );
};

export default SecurityExamples; 