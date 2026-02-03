// Interfaces para Fornecedores

// Tipo para grupos/categorias de fornecedores
export type SupplierGroup =
  | 'açougue'
  | 'hortifruti'
  | 'mercado'
  | 'adega'
  | 'padaria'
  | 'laticínios'
  | 'pescado'
  | 'outros';

// Interface principal do Fornecedor
export interface Supplier {
  _id: string;
  name: string;
  group: SupplierGroup;
  address: string;
  phone: string;
  comments?: string;
  ingredients?: string[]; // IDs dos ingredientes vinculados
  createdAt?: string;
  updatedAt?: string;
}

// Interface para criação de fornecedor
export interface CreateSupplierParams {
  name: string;
  group: SupplierGroup;
  address: string;
  phone: string;
  comments?: string;
}

// Interface para atualização de fornecedor
export interface UpdateSupplierParams extends Partial<CreateSupplierParams> {
  _id: string;
}

// Interface para parâmetros de busca/filtro
export interface SupplierSearchParams {
  page: number;
  itemPerPage: number;
  group?: SupplierGroup | 'all';
  name?: string;
  sort?: string;
}

// Interface para resposta da "API" de fornecedores
export interface SuppliersResponse {
  data: Supplier[];
  total: number;
  page: number;
  itemPerPage: number;
}

// Labels amigáveis para os grupos
export const SUPPLIER_GROUP_LABELS: Record<SupplierGroup, string> = {
  açougue: 'Açougue',
  hortifruti: 'Hortifruti',
  mercado: 'Mercado',
  adega: 'Adega',
  padaria: 'Padaria',
  laticínios: 'Laticínios',
  pescado: 'Pescado',
  outros: 'Outros',
};
