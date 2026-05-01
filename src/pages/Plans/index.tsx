import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { CheckCircle, Star } from '@mui/icons-material';
import { useNotification } from '@hooks/useNotification';

type PlanId = 'free' | 'pro';

interface PlanOption {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

const PlansPage: React.FC = () => {
  const theme = useTheme();
  const notification = useNotification();

  const currentPlan: PlanId = 'free';

  const plans: PlanOption[] = [
    {
      id: 'free',
      name: 'Gratis',
      price: 'R$ 0',
      period: 'por mes',
      description: 'Para comecar a organizar receitas e cardapios.',
      features: [
        'Acesso a receitas e ingredientes',
        'Cardapios basicos',
        'Exportacao simples de PDF',
        'Suporte padrao',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 39',
      period: 'por mes',
      description: 'Para quem precisa de controle e analise avancada.',
      features: [
        'Tudo do plano Gratis',
        'Analise financeira completa',
        'Modelos de cardapio avancados',
        'Suporte prioritario',
      ],
      recommended: true,
    },
  ];

  const handleChoosePlan = (planId: PlanId) => {
    if (planId === currentPlan) {
      return;
    }

    notification.showInfo('Funcionalidade de planos em desenvolvimento.');
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Planos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Escolha o plano ideal para o seu negocio.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: { xs: 3, sm: 4 } }}>
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isRecommended = plan.recommended;

          return (
            <Grid key={plan.id} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: isRecommended ? 'primary.main' : 'divider',
                  boxShadow: isRecommended ? theme.shadows[4] : theme.shadows[1],
                  backgroundColor: isRecommended
                    ? alpha(theme.palette.primary.main, 0.04)
                    : 'background.paper',
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {plan.name}
                    </Typography>
                    {isRecommended && (
                      <Chip
                        icon={<Star fontSize="small" />}
                        label="Recomendado"
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {plan.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.period}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List dense sx={{ mb: 2 }}>
                    {plan.features.map((feature) => (
                      <ListItem key={feature} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    variant={isCurrent ? 'outlined' : 'contained'}
                    color={isCurrent ? 'inherit' : 'primary'}
                    onClick={() => handleChoosePlan(plan.id)}
                    disabled={isCurrent}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {isCurrent ? 'Plano atual' : `Escolher ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: theme.shadows[1],
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Beneficios principais
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Compare os recursos e escolha o plano que melhor atende seu fluxo.
          </Typography>
          <Grid container spacing={2}>
            {[
              'Controle financeiro e custos detalhados',
              'Cardapios organizados por receitas',
              'Exportacao de PDF para clientes',
              'Suporte com respostas rapidas',
            ].map((benefit) => (
              <Grid key={benefit} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                  <Typography variant="body2">{benefit}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PlansPage;
