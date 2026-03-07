// Interfaces para Cupons

// Dados do fornecedor vinculado ao cupom
export interface CouponSupplier {
  name: string;
  address: string;
  category: string;
  phone: string;
  _id?: string; // ID opcional do fornecedor
}

// Interface principal do Cupom
export interface Coupon {
  _id: string;
  name: string;
  description: string;
  supplier: CouponSupplier | Record<string, never>; // Objeto supplier ou vazio {}
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
  __v?: number; // MongoDB version
}

// Interface para criação de cupom
export interface CreateCouponParams {
  name: string;
  description: string;
  supplierId?: string; // ID do fornecedor (opcional)
}

// Interface para atualização de cupom
export interface UpdateCouponParams extends Partial<CreateCouponParams> {
  active?: boolean;
}

// Interface para parâmetros de busca/filtro
export interface CouponSearchParams {
  page: number;
  itemPerPage: number;
  name?: string; // Filtro por nome
  supplierId?: string; // Filtro por fornecedor
  active?: boolean; // Filtro por status
  sort?: string; // Ordenação
}

// Interface para resposta da API de cupons
export interface CouponsResponse {
  data: Coupon[];
  total: number;
  currentPage: number; // API usa currentPage, não page
  totalPages: number;
}
