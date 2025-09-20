export interface MenuPDFData {
  name: string;
  description: string;
  yield: string;
  date: string;
  items: MenuPDFItem[];
  totalCost: number;
  sellingPrice: number;
  profit: number;
  profitPercentage: number;
  cmv: number;
  cmvPercentage: number;
  directCosts: number;
  directCostsPercentage: number;
  indirectCosts: number;
  indirectCostsPercentage: number;
  unitCost: number;
  unitSellingPrice: number;
  unitProfit: number;
  unitProfitPercentage: number;
}

export interface MenuPDFItem {
  name: string;
  quantity: string;
  cost: number;
  selling: number;
  profit: number;
}
