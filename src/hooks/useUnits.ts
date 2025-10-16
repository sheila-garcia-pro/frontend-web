import { useState, useEffect, useCallback, useRef } from 'react';
import { getCachedUnitsAmountUse } from '../services/api/unitAmountUse';
import { getCachedUnitMeasures } from '../services/api/unitMeasure';
import { UnitAmountUse } from '../types/unitAmountUse';
import { UnitMeasure } from '../types/unitMeasure';

// 🔥 SINGLETON: Controle global para evitar múltiplos carregamentos
let globalUnitsPromise: Promise<{
  normalizedUnits: NormalizedUnit[];
  baseUnits: UnitMeasure[];
  amountUseUnits: UnitAmountUse[];
}> | null = null;

let globalUnitsCache: {
  normalizedUnits: NormalizedUnit[];
  baseUnits: UnitMeasure[];
  amountUseUnits: UnitAmountUse[];
} | null = null;

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

// 🔥 FUNÇÃO SINGLETON para carregar unidades
const loadUnitsGlobal = async (): Promise<{
  normalizedUnits: NormalizedUnit[];
  baseUnits: UnitMeasure[];
  amountUseUnits: UnitAmountUse[];
}> => {
  // Se já tem cache, retorna imediatamente
  if (globalUnitsCache) {
    console.log('[useUnits] Retornando cache global');
    return globalUnitsCache;
  }

  // Se já está carregando, retorna a promise existente
  if (globalUnitsPromise) {
    console.log('[useUnits] Aguardando promise global existente');
    return globalUnitsPromise;
  }

  console.log('[useUnits] Iniciando carregamento global das unidades');

  // Criar nova promise de carregamento
  globalUnitsPromise = (async () => {
    try {
      const [amountUseResponse, baseUnitsData] = await Promise.all([
        getCachedUnitsAmountUse(),
        getCachedUnitMeasures(),
      ]);

      const amountUseData = amountUseResponse.unitsAmountUse || [];

      // Criar um mapa de unidades base por nome para lookup
      const baseUnitsMap = new Map<string, UnitMeasure>();
      baseUnitsData.forEach((unit) => {
        baseUnitsMap.set(unit.name, unit);
        baseUnitsMap.set(unit.name.toLowerCase(), unit);
      });

      // Normalizar unidades de amount-use
      const normalizedAmountUse: NormalizedUnit[] = amountUseData.map((unit) => {
        let baseUnit = baseUnitsMap.get(unit.unitMeasure);

        if (!baseUnit) {
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

      // Adicionar unidades base
      const normalizedBase: NormalizedUnit[] = baseUnitsData.map((unit) => ({
        id: unit._id,
        name: unit.name,
        acronym: unit.acronym,
        type: 'base-unit' as const,
      }));

      const result = {
        normalizedUnits: [...normalizedAmountUse, ...normalizedBase],
        baseUnits: baseUnitsData,
        amountUseUnits: amountUseData,
      };

      // Armazenar no cache global
      globalUnitsCache = result;
      console.log('[useUnits] Carregamento global concluído');

      return result;
    } catch (error) {
      globalUnitsPromise = null; // Reset para permitir nova tentativa
      throw error;
    }
  })();

  return globalUnitsPromise;
};

/**
 * Hook para gerenciar unidades de medida de forma robusta
 * Carrega tanto units-amount-use quanto unit-measures e faz o mapeamento correto
 */
export const useUnits = (): UseUnitsResult => {
  console.log('[useUnits] Hook instanciado');

  const [normalizedUnits, setNormalizedUnits] = useState<NormalizedUnit[]>([]);
  const [baseUnits, setBaseUnits] = useState<UnitMeasure[]>([]);
  const [amountUseUnits, setAmountUseUnits] = useState<UnitAmountUse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 CARREGAMENTO SIMPLIFICADO usando singleton
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // Se já tem dados, não carrega novamente
      if (normalizedUnits.length > 0) {
        console.log('[useUnits] Dados já existem, pulando carregamento');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await loadUnitsGlobal();

        if (mounted) {
          setNormalizedUnits(data.normalizedUnits);
          setBaseUnits(data.baseUnits);
          setAmountUseUnits(data.amountUseUnits);
        }
      } catch (err) {
        if (mounted) {
          setError(
            `Erro ao carregar unidades de medida: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []); // 🔥 DEPENDÊNCIAS VAZIAS - executa apenas uma vez por instância

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
