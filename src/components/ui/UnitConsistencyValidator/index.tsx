import React from 'react';
import { Alert, AlertTitle, Box, Typography, Chip } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { NormalizedUnit } from '../../../hooks/useUnits';

interface UnitConsistencyValidatorProps {
  units: NormalizedUnit[];
  onInconsistencyFound?: (inconsistencies: UnitInconsistency[]) => void;
}

interface UnitInconsistency {
  unit: NormalizedUnit;
  issue: string;
  severity: 'warning' | 'error';
  suggestion?: string;
}

/**
 * Componente para validar e exibir inconsistências nas unidades de medida
 */
export const UnitConsistencyValidator: React.FC<UnitConsistencyValidatorProps> = ({
  units,
  onInconsistencyFound,
}) => {
  const [hasChecked, setHasChecked] = React.useState(false);
  const onInconsistencyFoundRef = React.useRef(onInconsistencyFound);

  // Atualizar a ref sempre que a prop mudar
  React.useEffect(() => {
    onInconsistencyFoundRef.current = onInconsistencyFound;
  }, [onInconsistencyFound]);

  // Memoizar as inconsistências para evitar recálculos desnecessários
  const inconsistencies = React.useMemo(() => {
    const issues: UnitInconsistency[] = [];

    units.forEach((unit) => {
      if (unit.type === 'amount-use') {
        // Verificar se a descrição bate com a unidade base
        const nameL = unit.name.toLowerCase();
        const baseUnitL = unit.baseUnitName?.toLowerCase() || '';

        // Casos específicos de inconsistência
        if (nameL.includes('gr') && !baseUnitL.includes('gram')) {
          issues.push({
            unit,
            issue: `Unidade "${unit.name}" sugere gramas mas está mapeada para "${unit.baseUnitName}"`,
            severity: 'warning',
            suggestion: 'Deveria estar mapeada para "Gramas"',
          });
        }

        if (
          nameL.includes('kg') &&
          !baseUnitL.includes('kilograma') &&
          !baseUnitL.includes('quilograma')
        ) {
          issues.push({
            unit,
            issue: `Unidade "${unit.name}" sugere quilogramas mas está mapeada para "${unit.baseUnitName}"`,
            severity: 'warning',
            suggestion: 'Deveria estar mapeada para "Quilogramas"',
          });
        }

        if (nameL.includes('ml') && !baseUnitL.includes('mililitro')) {
          issues.push({
            unit,
            issue: `Unidade "${unit.name}" sugere mililitros mas está mapeada para "${unit.baseUnitName}"`,
            severity: 'warning',
            suggestion: 'Deveria estar mapeada para "Mililitros"',
          });
        }

        if (nameL.includes('litro') && !baseUnitL.includes('litro')) {
          issues.push({
            unit,
            issue: `Unidade "${unit.name}" sugere litros mas está mapeada para "${unit.baseUnitName}"`,
            severity: 'warning',
            suggestion: 'Deveria estar mapeada para "Litros"',
          });
        }
      }
    });

    return issues;
  }, [units]);

  React.useEffect(() => {
    // Só chamar onInconsistencyFound se houver inconsistências e ainda não foi verificado
    if (inconsistencies.length > 0 && !hasChecked) {
      if (
        onInconsistencyFoundRef.current &&
        typeof onInconsistencyFoundRef.current === 'function'
      ) {
        onInconsistencyFoundRef.current(inconsistencies);
      }
      setHasChecked(true);
    }
  }, [inconsistencies, hasChecked]); // Removido callback das dependências

  if (inconsistencies.length === 0) {
    return null;
  }

  return (
    <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
      <AlertTitle>⚠️ Inconsistências nas Unidades de Medida Detectadas</AlertTitle>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Foram encontradas inconsistências no mapeamento entre unidades de quantidade de uso e
        unidades base:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {inconsistencies.map((inconsistency, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={inconsistency.unit.name} size="small" color="warning" variant="outlined" />
            <Typography variant="caption" color="text.secondary">
              {inconsistency.issue}
            </Typography>
            {inconsistency.suggestion && (
              <Chip
                label={inconsistency.suggestion}
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        ))}
      </Box>

      <Typography variant="caption" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
        💡 Recomendação: Verifique o backend para corrigir o mapeamento correto entre unitMeasure e
        as unidades base.
      </Typography>
    </Alert>
  );
};
