import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import { NutritionalLabelData } from '../../../services/nutritionalCalculations';

interface NutritionLabelProps {
  data: NutritionalLabelData;
  loading?: boolean;
  onDownload?: () => void;
}

const NutritionLabel: React.FC<NutritionLabelProps> = ({ data, loading = false, onDownload }) => {
  const labelRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!labelRef.current) return;

    try {
      // Configurações para alta qualidade
      const canvas = await html2canvas(labelRef.current, {
        scale: 3, // Aumenta a resolução
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        width: 400,
        height: 600,
        scrollX: 0,
        scrollY: 0,
      });

      // Criar link para download
      const link = document.createElement('a');
      link.download = `rotulo-nutricional-${data.productName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Calculando informações nutricionais...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      {/* Botão de download */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadImage}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Baixar como Imagem
        </Button>
      </Box>

      {/* Rótulo Nutricional */}
      <Paper
        ref={labelRef}
        elevation={0}
        sx={{
          border: '3px solid #000',
          borderRadius: 0,
          backgroundColor: '#ffffff',
          color: '#000',
          fontFamily: 'Arial, sans-serif',
          width: 400,
          mx: 'auto',
        }}
      >
        {/* Cabeçalho */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              fontSize: '22px',
              textAlign: 'center',
              mb: 1,
              letterSpacing: '0.5px',
              color: '#000',
            }}
          >
            INFORMAÇÃO NUTRICIONAL
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '18px',
              textAlign: 'center',
              mb: 1,
              color: '#000',
            }}
          >
            {data.productName}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <Typography sx={{ fontWeight: 600, color: '#000' }}>
              Porção: {data.portionSize}g
            </Typography>
            <Typography sx={{ fontWeight: 600, color: '#000' }}>
              Rendimento: {data.servingsPerContainer} porções
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#000', borderWidth: 2 }} />

        {/* Calorias */}
        <Box sx={{ p: 2, py: 1.5, backgroundColor: '#f8f8f8' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#000' }}>
              Valor Energético
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '20px', color: '#000' }}>
              {data.nutrients.calories} kcal
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#000', borderWidth: 1 }} />

        {/* Cabeçalho da tabela */}
        <Box sx={{ px: 2, py: 1, backgroundColor: '#e8e8e8' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '12px', color: '#000' }}>
              NUTRIENTE
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '12px', color: '#000' }}>% VD*</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#000', borderWidth: 1 }} />

        {/* Tabela de nutrientes */}
        <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 0.5, px: 2 } }}>
          <TableBody>
            {/* Gorduras totais */}
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                Gorduras totais {data.nutrients.totalFat}g
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                {data.dailyValues.totalFat}%
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            {/* Gorduras saturadas */}
            <TableRow>
              <TableCell sx={{ pl: 3, fontSize: '12px', color: '#000' }}>
                Gorduras saturadas {data.nutrients.saturatedFat}g
              </TableCell>
              <TableCell align="right" sx={{ fontSize: '12px', color: '#000' }}>
                {data.dailyValues.saturatedFat}%
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            {/* Gorduras trans */}
            <TableRow>
              <TableCell sx={{ pl: 3, fontSize: '12px', color: '#000' }}>
                Gorduras trans {data.nutrients.transFat}g
              </TableCell>
              <TableCell align="right" sx={{ fontSize: '12px', color: '#000' }}>
                **
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            {/* Colesterol */}
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                Colesterol {data.nutrients.cholesterol}mg
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                {data.dailyValues.cholesterol}%
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            {/* Sódio */}
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                Sódio {data.nutrients.sodium}mg
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                {data.dailyValues.sodium}%
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            {/* Carboidratos */}
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                Carboidrato total {data.nutrients.totalCarbohydrate}g
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                {data.dailyValues.totalCarbohydrate}%
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            {/* Fibra alimentar */}
            <TableRow>
              <TableCell sx={{ pl: 3, fontSize: '12px', color: '#000' }}>
                Fibra alimentar {data.nutrients.dietaryFiber}g
              </TableCell>
              <TableCell align="right" sx={{ fontSize: '12px', color: '#000' }}>
                {data.dailyValues.dietaryFiber}%
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            {/* Açúcares totais */}
            <TableRow>
              <TableCell sx={{ pl: 3, fontSize: '12px', color: '#000' }}>
                Açúcares totais {data.nutrients.totalSugars}g
              </TableCell>
              <TableCell align="right" sx={{ fontSize: '12px', color: '#000' }}>
                **
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            {/* Açúcares adicionados */}
            <TableRow>
              <TableCell sx={{ pl: 4, fontSize: '11px', color: '#000' }}>
                Açúcares adicionados {data.nutrients.addedSugars}g
              </TableCell>
              <TableCell align="right" sx={{ fontSize: '11px', color: '#000' }}>
                **
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            {/* Proteínas */}
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                Proteínas {data.nutrients.protein}g
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                **
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#000', borderWidth: 2 }} />

            {/* Vitaminas e Minerais */}
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                Cálcio {data.nutrients.calcium}mg
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                {data.dailyValues.calcium}%
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                Ferro {data.nutrients.iron}mg
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                {data.dailyValues.iron}%
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                Potássio {data.nutrients.potassium}mg
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                {data.dailyValues.potassium}%
              </TableCell>
            </TableRow>

            <Divider sx={{ borderColor: '#ccc' }} />

            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                Vitamina C {data.nutrients.vitaminC}mg
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>
                {data.dailyValues.vitaminC}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Divider sx={{ borderColor: '#000', borderWidth: 2 }} />

        {/* Rodapé */}
        <Box sx={{ p: 1.5, fontSize: '10px', lineHeight: 1.3 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 600, mb: 0.5, color: '#000' }}>
            * % Valores Diários com base em uma dieta de 2.000 kcal ou 8.400 kJ.
          </Typography>
          <Typography sx={{ fontSize: '10px', color: '#000' }}>
            Seus valores diários podem ser maiores ou menores dependendo de suas necessidades
            energéticas.
          </Typography>
          <Typography sx={{ fontSize: '10px', fontWeight: 600, mt: 0.5, color: '#000' }}>
            ** VD não estabelecido.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default NutritionLabel;
