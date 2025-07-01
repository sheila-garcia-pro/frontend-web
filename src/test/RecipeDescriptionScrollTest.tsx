import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

// Teste para verificar se a rolagem da descrição está funcionando corretamente
const RecipeDescriptionScrollTest: React.FC = () => {
  const longDescription = `Esta é uma receita tradicionalmente brasileira que tem suas raízes na culinária colonial. 
  Preparada com ingredientes frescos e técnicas ancestrais, esta receita é um verdadeiro patrimônio cultural.
  
  O processo de preparo é meticuloso e requer atenção aos detalhes. Primeiro, é necessário selecionar os melhores ingredientes,
  preferencialmente orgânicos e de origem local. A qualidade dos ingredientes é fundamental para o sucesso da receita.
  
  Durante o preparo, é importante manter a temperatura adequada e seguir rigorosamente os tempos indicados. Cada etapa tem sua
  importância e não deve ser negligenciada. O tempero deve ser ajustado gradualmente, provando constantemente para garantir
  o equilíbrio perfeito de sabores.
  
  A apresentação final é tão importante quanto o sabor. O prato deve ser servido na temperatura ideal, com guarnições frescas
  e uma apresentação que valorize todos os elementos que compõem esta magnífica receita.
  
  Esta receita pode ser adaptada para diferentes ocasiões, desde um almoço familiar até um jantar especial. É versátil e
  sempre agrada a todos os paladares, sendo uma excelente opção para quem deseja impressionar seus convidados.
  
  Dicas importantes: utilize sempre utensílios limpos, mantenha a organização durante o preparo e não tenha pressa. 
  Uma boa receita requer tempo e dedicação para que todos os sabores se desenvolvam adequadamente.
  
  O resultado final será um prato que combina tradição, sabor e apresentação, criando uma experiência gastronômica
  inesquecível para todos que tiverem o prazer de degustá-lo.`;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Teste de Rolagem na Descrição
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Descrição da Receita
          </Typography>

          {/* Container com rolagem - igual ao da tela principal */}
          <Box
            sx={{
              maxHeight: { xs: 150, md: 200 }, // altura máxima antes de aplicar scroll
              overflow: 'auto', // rolagem quando necessário
              pr: 1, // padding para a barra de scroll
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              bgcolor: 'background.paper',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(0,0,0,0.5)',
                },
              },
            }}
          >
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                textAlign: 'justify',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
              }}
            >
              {longDescription}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            💡 Se o texto for longo o suficiente, uma barra de rolagem aparecerá automaticamente.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RecipeDescriptionScrollTest;
