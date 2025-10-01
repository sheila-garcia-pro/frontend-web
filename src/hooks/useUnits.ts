import { useState, useEffect, useCallback } from 'react';
import { getCachedUnitsAmountUse } from '../services/api/unitAmountUse';
import { getCachedUnitMeasures } from '../services/api/unitMeasure';
import { UnitAmountUse } from '../types/unitAmountUse';
import { UnitMeasure } from '../types/unitMeasure';

// Interface para unidade de medida normalizada
export interface NormalizedUnit {
  id: string;
  name: string;
  acronym?: string;
  quantity?: string;
  baseUnitId?: string;
  baseUnitName?: string;
  type: 'amount-use' | 'base-unit';
}

export interface UseUnitsResult {
  normalizedUnits: NormalizedUnit[];
  baseUnits: UnitMeasure[];
  amountUseUnits: UnitAmountUse[];
  loading: boolean;
  error: string | null;
  findUnitByName: (name: string) => NormalizedUnit | undefined;
  findUnitById: (id: string) => NormalizedUnit | undefined;
  validateUnitConsistency: (unitName: string, expectedUnit: string) => boolean;
}

/**
 * Hook para gerenciar unidades de medida de forma robusta
 * Carrega tanto units-amount-use quanto unit-measures e faz o mapeamento correto
 */
export const useUnits = (): UseUnitsResult => {
  const [normalizedUnits, setNormalizedUnits] = useState<NormalizedUnit[]>([]);
  const [baseUnits, setBaseUnits] = useState<UnitMeasure[]>([]);
  const [amountUseUnits, setAmountUseUnits] = useState<UnitAmountUse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUnits = useCallback(async () => {
    // Evitar múltiplas chamadas se já estiver carregando
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // Carregar ambas as APIs
      const [amountUseResponse, baseUnitsData] = await Promise.all([
        getCachedUnitsAmountUse(),
        getCachedUnitMeasures(),
      ]);

      const amountUseData = amountUseResponse.unitsAmountUse || [];
      // baseUnitsData já é o array diretamente (UnitMeasuresResponse = UnitMeasure[])

      setBaseUnits(baseUnitsData);
      setAmountUseUnits(amountUseData);

      // Criar um mapa de unidades base por nome para lookup
      const baseUnitsMap = new Map<string, UnitMeasure>();
      baseUnitsData.forEach((unit) => {
        baseUnitsMap.set(unit.name, unit);
        baseUnitsMap.set(unit.name.toLowerCase(), unit);
      });

      // Normalizar unidades de amount-use
      const normalizedAmountUse: NormalizedUnit[] = amountUseData.map((unit) => {
        // Tentar encontrar a unidade base correspondente
        let baseUnit = baseUnitsMap.get(unit.unitMeasure);

        // Se não encontrar, tentar por variações
        if (!baseUnit) {
          // Tentar encontrar por nome parcial (ex: "Gramas" em "200gr")
          const baseUnitEntries = Array.from(baseUnitsMap.entries());
          for (let i = 0; i < baseUnitEntries.length; i++) {
            const [key, value] = baseUnitEntries[i];
            if (
              unit.name.toLowerCase().includes(key.toLowerCase()) ||
              key.toLowerCase().includes(unit.name.toLowerCase())
            ) {
              baseUnit = value;
              break;
            }
          }
        }

        return {
          id: unit.id,
          name: unit.name,
          quantity: unit.quantity,
          baseUnitId: baseUnit?._id,
          baseUnitName: baseUnit?.name || unit.unitMeasure,
          acronym: baseUnit?.acronym,
          type: 'amount-use' as const,
        };
      });

      // Adicionar unidades base como opções também
      const normalizedBase: NormalizedUnit[] = baseUnitsData.map((unit) => ({
        id: unit._id,
        name: unit.name,
        acronym: unit.acronym,
        type: 'base-unit' as const,
      }));

      const allNormalized = [...normalizedAmountUse, ...normalizedBase];
      setNormalizedUnits(allNormalized);
    } catch (err) {
      // Definir apenas o erro sem log desnecessário
      setError(
        `Erro ao carregar unidades de medida: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
      );
    } finally {
      setLoading(false);
    }
  }, [loading]); // Adicionar loading como dependência

  useEffect(() => {
    // Só carregar se ainda não tem dados
    if (normalizedUnits.length === 0) {
      loadUnits();
    }
  }, [loadUnits, normalizedUnits.length]);

  const findUnitByName = useCallback(
    (name: string): NormalizedUnit | undefined => {
      // Cache dos nomes em lowercase para evitar chamadas repetidas
      return normalizedUnits.find((unit) => {
        return unit.name === name || unit.name.toLowerCase() === name.toLowerCase();
      });
    },
    [normalizedUnits],
  );

  const findUnitById = useCallback(
    (id: string): NormalizedUnit | undefined => {
      return normalizedUnits.find((unit) => unit.id === id);
    },
    [normalizedUnits],
  );

  // Memoizar para evitar recriações
  const validateUnitConsistency = useCallback(
    (unitName: string, expectedUnit: string): boolean => {
      const unit = findUnitByName(unitName);
      if (!unit) return false;

      // Verificar se a unidade base corresponde ao esperado
      return unit.baseUnitName === expectedUnit || unit.name === expectedUnit;
    },
    [findUnitByName],
  );

  return {
    normalizedUnits,
    baseUnits,
    amountUseUnits,
    loading,
    error,
    findUnitByName,
    findUnitById,
    validateUnitConsistency,
  };
};
