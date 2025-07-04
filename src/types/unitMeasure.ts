// Interface para unidades de medida vindas da API
export interface UnitMeasure {
  _id: string;
  name: string;
  acronym: string;
}

// Interface para resposta da API de unidades de medida
export type UnitMeasuresResponse = UnitMeasure[];

// Interface para criar/atualizar unidade de medida
export interface CreateUnitMeasureParams {
  name: string;
  acronym: string;
}

// Interface para parâmetros de busca de unidades
export interface UnitMeasureSearchParams {
  page?: number;
  itemPerPage?: number;
  search?: string;
}
