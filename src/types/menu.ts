// Interface para itens do cardápio
export interface MenuItem {
  idItem: string;
  quantityUsed: string;
  unitMesaure: string; // Mantendo o nome da API (com erro de grafia)
}

// Interface para criar/atualizar cardápio
export interface CreateMenuParams {
  _id?: string;
  name: string;
  description: string;
  yield?: number; // Rendimento do cardápio
  yieldUnit?: string; // Unidade do rendimento (porções, pessoas, etc.)
  menuItems: MenuItem[];
}

// Interface para cardápio completo
export interface Menu {
  _id: string;
  name: string;
  description?: string;
  yield?: number;
  yieldUnit?: string;
  menuItems: MenuItem[];
  totalItems?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para resposta da lista de cardápios
export interface MenusResponse {
  data: MenuListItem[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Interface para item na lista de cardápios
export interface MenuListItem {
  _id: string;
  name: string;
  totalItems: number;
  totalPortions?: number;
  description?: string;
}

// Interface para parâmetros de busca
export interface MenuSearchParams {
  page?: number;
  itemPerPage?: number;
  search?: string;
}

// Interface para detalhes do cardápio
export interface MenuDetails extends Menu {
  totalCost?: number;
  unitCost?: number;
  sellPrice?: number;
  profitMargin?: number;
  directCosts?: Array<{
    id: string;
    name: string;
    value: number;
    isPercentage?: boolean;
  }>;
  indirectCosts?: Array<{
    id: string;
    name: string;
    value: number;
    monthlyRevenue?: number;
  }>;
}
