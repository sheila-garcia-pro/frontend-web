import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  useTheme,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  BRAND_COLORS,
  GREEN_PALETTE,
  PINK_PALETTE,
  YELLOW_PALETTE,
  BEIGE_PALETTE,
} from '../../themes/colors';

/**
 * Componente de demonstração da nova identidade visual
 * Mostra como aplicar as cores da marca em diferentes contextos
 */
export const VisualIdentityShowcase: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom color="primary">
          Nova Identidade Visual
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Demonstração das cores PANTONE implementadas no sistema de design
        </Typography>
      </Box>

      {/* Seção de Cores Principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            🎨 Cores Principais (PANTONES)
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: BRAND_COLORS.PRIMARY_GREEN,
              color: 'white',
              textAlign: 'center',
            }}
          >
            <CardContent>
              <Typography variant="h6">Verde Principal</Typography>
              <Typography variant="body2">PANTONE 7494C</Typography>
              <Typography variant="caption">{BRAND_COLORS.PRIMARY_GREEN}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: BRAND_COLORS.SECONDARY_PINK,
              color: 'white',
              textAlign: 'center',
            }}
          >
            <CardContent>
              <Typography variant="h6">Rosa Salmão</Typography>
              <Typography variant="body2">PANTONE 493C</Typography>
              <Typography variant="caption">{BRAND_COLORS.SECONDARY_PINK}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: BRAND_COLORS.ACCENT_YELLOW,
              color: theme.palette.text.primary,
              textAlign: 'center',
            }}
          >
            <CardContent>
              <Typography variant="h6">Amarelo Suave</Typography>
              <Typography variant="body2">Pantone P7-3U</Typography>
              <Typography variant="caption">{BRAND_COLORS.ACCENT_YELLOW}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: BRAND_COLORS.NEUTRAL_BEIGE,
              color: theme.palette.text.primary,
              textAlign: 'center',
            }}
          >
            <CardContent>
              <Typography variant="h6">Bege Neutro</Typography>
              <Typography variant="body2">Pantone 705C</Typography>
              <Typography variant="caption">{BRAND_COLORS.NEUTRAL_BEIGE}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seção de Componentes */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            🧩 Componentes com Nova Identidade
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Botões
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Button variant="contained" color="primary">
                Primário
              </Button>
              <Button variant="contained" color="secondary">
                Secundário
              </Button>
              <Button variant="outlined" color="primary">
                Outline
              </Button>
              <Button variant="text" color="primary">
                Texto
              </Button>
            </Box>

            <Typography variant="h6" gutterBottom>
              Chips
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Verde Principal" color="primary" />
              <Chip label="Rosa Secundário" color="secondary" />
              <Chip label="Sucesso" color="success" />
              <Chip label="Aviso" color="warning" />
              <Chip label="Informação" color="info" />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Formulários
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Campo de Texto" placeholder="Digite algo..." variant="outlined" />
              <TextField
                label="Campo Focado"
                defaultValue="Exemplo de texto"
                variant="outlined"
                focused
              />
              <TextField
                label="Campo com Erro"
                error
                helperText="Este campo é obrigatório"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Seção de Paletas Expandidas */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            🌈 Paletas Expandidas (50-900)
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Verde
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {Object.entries(GREEN_PALETTE).map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    backgroundColor: value,
                    color: parseInt(key) > 400 ? 'white' : 'black',
                    p: 1,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{key}</span>
                  <span>{value}</span>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              Rosa
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {Object.entries(PINK_PALETTE).map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    backgroundColor: value,
                    color: parseInt(key) > 300 ? 'white' : 'black',
                    p: 1,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{key}</span>
                  <span>{value}</span>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="warning">
              Amarelo
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {Object.entries(YELLOW_PALETTE).map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    backgroundColor: value,
                    color: parseInt(key) > 600 ? 'white' : 'black',
                    p: 1,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{key}</span>
                  <span>{value}</span>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bege
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {Object.entries(BEIGE_PALETTE).map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    backgroundColor: value,
                    color: parseInt(key) > 600 ? 'white' : 'black',
                    p: 1,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{key}</span>
                  <span>{value}</span>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer com informações */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          ✨ Nova identidade visual implementada com sucesso!
          <br />
          Todas as cores seguem os padrões PANTONE fornecidos e são otimizadas para acessibilidade.
        </Typography>
      </Box>
    </Box>
  );
};

export default VisualIdentityShowcase;
