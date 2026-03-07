// Interfaces para Fornecedores

// Categoria de fornecedor (API dinâmica)
export interface SupplierCategory {
  id: string;
  name: string;
  description?: string;
}

// Interface principal do Fornecedor
export interface Supplier {
  _id: string;
  name: string;
  category: string; // Nome da categoria (string livre, vindo da API)
  address: string;
  phone: string;
  active: boolean; // Status ativo/inativo
  ingredients?: string[]; // IDs dos ingredientes vinculados (gerenciado localmente)
  coupons?: string[]; // IDs dos cupons vinculados
  createdAt?: string;
  updatedAt?: string;
  __v?: number; // MongoDB version
}

// Interface para criação de fornecedor
export interface CreateSupplierParams {
  name: string;
  category: string;
  address: string;
  phone: string;
  active?: boolean; // Padrão: true
}

// Interface para atualização de fornecedor
export interface UpdateSupplierParams extends Partial<CreateSupplierParams> {
  _id: string;
}

// Interface para parâmetros de busca/filtro
export interface SupplierSearchParams {
  page: number;
  itemPerPage: number;
  category?: string;
  name?: string;
  sort?: string;
  active?: boolean; // Filtro por status
}

// Interface para resposta da API de fornecedores
export interface SuppliersResponse {
  data: Supplier[];
  total: number;
  currentPage: number; // API usa currentPage, não page
  totalPages: number; // API retorna totalPages
}

// Interface para criação de categoria
export interface CreateSupplierCategoryParams {
  name: string;
  description?: string;
}

// Interface para atualização de categoria
export interface UpdateSupplierCategoryParams {
  name?: string;
  description?: string;
}
