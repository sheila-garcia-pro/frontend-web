// Interface para unidades de medida de uso
export interface UnitAmountUse {
  name: string;
  quantity: string;
  unitMeasure: string;
  id: string;
}

// Interface para resposta da API de unidades de medida
export interface UnitsAmountUseResponse {
  unitsAmountUse: UnitAmountUse[];
}

// Interface para criar/atualizar unidade de medida
export interface CreateUnitAmountUseParams {
  name: string;
  quantity: string;
  unitMeasure: string;
}

// Interface para parâmetros de busca de unidades
export interface UnitAmountUseSearchParams {
  page?: number;
  itemPerPage?: number;
  search?: string;
}
