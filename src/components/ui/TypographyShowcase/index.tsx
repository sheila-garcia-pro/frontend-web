import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TypographyVariant {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption' | 'overline' | 'button';
  label: string;
  weight: string;
  usage: string;
}

const TypographyShowcase: React.FC = () => {
  const theme = useTheme();

  const typographyVariants: TypographyVariant[] = [
    { variant: 'h1', label: 'H1 - Gotham Black', weight: '900', usage: 'Títulos principais' },
    { variant: 'h2', label: 'H2 - Gotham Bold', weight: '700', usage: 'Subtítulos importantes' },
    { variant: 'h3', label: 'H3 - Gotham Medium', weight: '500', usage: 'Seções' },
    { variant: 'h4', label: 'H4 - Gotham Medium', weight: '500', usage: 'Subseções' },
    { variant: 'h5', label: 'H5 - Gotham Medium', weight: '500', usage: 'Pequenos títulos' },
    { variant: 'h6', label: 'H6 - Gotham Medium', weight: '500', usage: 'Cabeçalhos menores' },
    { variant: 'body1', label: 'Body 1 - Gotham Book', weight: '400', usage: 'Texto principal' },
    { variant: 'body2', label: 'Body 2 - Gotham Book', weight: '400', usage: 'Texto secundário' },
    { variant: 'subtitle1', label: 'Subtitle 1 - Gotham Medium', weight: '500', usage: 'Subtítulos destacados' },
    { variant: 'subtitle2', label: 'Subtitle 2 - Gotham Medium', weight: '500', usage: 'Subtítulos menores' },
    { variant: 'caption', label: 'Caption - Gotham Book', weight: '400', usage: 'Legendas' },
    { variant: 'overline', label: 'Overline - Gotham Medium', weight: '500', usage: 'Texto sobrescrito' },
    { variant: 'button', label: 'Button - Gotham Medium', weight: '500', usage: 'Botões e CTAs' },
  ];

  const fontWeights = [
    { weight: 100, name: 'Gotham Thin', usage: 'Textos delicados' },
    { weight: 300, name: 'Gotham Light', usage: 'Textos suaves' },
    { weight: 400, name: 'Gotham Book', usage: 'Texto principal' },
    { weight: 500, name: 'Gotham Medium', usage: 'Destaques moderados' },
    { weight: 700, name: 'Gotham Bold', usage: 'Títulos importantes' },
    { weight: 900, name: 'Gotham Black', usage: 'Máximo destaque' },
    { weight: 950, name: 'Gotham Ultra', usage: 'Elementos especiais' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Paper sx={{ p: 4, mb: 4, textAlign: 'center', backgroundColor: theme.palette.primary.main }}>
        <Typography variant="h2" sx={{ color: 'white', mb: 2 }}>
          🎨 Sistema Tipográfico Gotham
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9 }}>
          Nova identidade visual implementada conforme especificações
        </Typography>
      </Paper>

      {/* Hierarquia Tipográfica */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            📝 Hierarquia Tipográfica
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {typographyVariants.map((item, index) => (
              <Box 
                key={index}
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                  <Typography variant="caption" sx={{ 
                    minWidth: 200,
                    fontWeight: 500,
                    color: 'primary.main'
                  }}>
                    {item.label}
                  </Typography>
                  <Chip size="small" label={`Peso ${item.weight}`} variant="outlined" />
                  <Chip size="small" label={item.usage} color="secondary" variant="outlined" />
                </Box>
                
                <Typography variant={item.variant}>
                  O futuro pertence àqueles que acreditam na beleza dos seus sonhos
                </Typography>
              </Box>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Pesos Disponíveis */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            ⚖️ Pesos de Fonte Disponíveis
          </Typography>
          
          <Grid container spacing={2}>
            {fontWeights.map((font, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  textAlign: 'center',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: font.weight,
                      mb: 1
                    }}
                  >
                    Gotham
                  </Typography>
                  <Typography variant="caption" color="primary" display="block">
                    {font.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Peso: {font.weight}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {font.usage}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Exemplo de Aplicação */}
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            🎯 Exemplo de Aplicação
          </Typography>
          
          <Box sx={{ p: 3, backgroundColor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h2" gutterBottom>
              Sheila Garcia
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              DO FOGO AO AÇÚCAR
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              A nova tipografia Gotham foi implementada seguindo as especificações da identidade visual. 
              Esta fonte moderna e elegante oferece excelente legibilidade em todos os dispositivos.
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Sistema tipográfico completo com 7 pesos diferentes, garantindo flexibilidade 
              e consistência visual em toda a aplicação.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TypographyShowcase;
