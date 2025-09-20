import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import React from 'react';
import { MenuPDF } from '../components/pdf/MenuPDF';
import { MenuPDFData } from '../components/pdf/menuTypes';
import { MenuListItem, Menu, MenuDetails } from '../types/menu';
import { Recipe } from '../types/recipes';
import { getRecipes } from '../services/api/recipes';
import { getMenuById } from '../services/api/menu';

interface UseMenuPDFReturn {
  isGenerating: boolean;
  generatePDF: (menuData: MenuPDFData) => Promise<Blob>;
  downloadPDF: (menuData: MenuPDFData, filename?: string) => Promise<void>;
  previewPDF: (menuData: MenuPDFData) => Promise<string>;
  convertMenuToPDFData: (menu: MenuListItem | MenuDetails) => Promise<MenuPDFData>;
}

/**
 * Hook customizado para gerar, baixar e visualizar PDFs de cardápios
 */
export const useMenuPDF = (): UseMenuPDFReturn => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async (menuData: MenuPDFData): Promise<Blob> => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<MenuPDF data={menuData} />).toBlob();
      return blob;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadPDF = useCallback(
    async (menuData: MenuPDFData, filename?: string): Promise<void> => {
      try {
        const blob = await generatePDF(menuData);
        const fileName =
          filename ||
          `cardapio-${menuData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
        saveAs(blob, fileName);
      } catch (error) {
        console.error('Erro ao baixar PDF:', error);
        throw new Error('Falha ao gerar o PDF. Tente novamente.');
      }
    },
    [generatePDF],
  );

  const previewPDF = useCallback(
    async (menuData: MenuPDFData): Promise<string> => {
      try {
        const blob = await generatePDF(menuData);
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Erro ao visualizar PDF:', error);
        throw new Error('Falha ao gerar a visualização do PDF. Tente novamente.');
      }
    },
    [generatePDF],
  );

  // Função para converter dados do cardápio com resolução de nomes
  const convertMenuToPDFData = useCallback(
    async (menu: MenuListItem | MenuDetails): Promise<MenuPDFData> => {
      try {
        // Se for MenuListItem, buscar os detalhes completos do menu
        let menuDetails: MenuDetails;
        if ('menuItems' in menu) {
          menuDetails = menu as MenuDetails;
        } else {
          // Buscar detalhes completos do menu
          menuDetails = await getMenuById(menu._id);
        }

        // Buscar todas as receitas para resolver os nomes dos itens
        const recipesData = await getRecipes({ page: 1, itemPerPage: 1000 });
        const recipes = recipesData.data;

        // Função auxiliar para obter dados da receita
        const getRecipeData = (recipeId: string): Recipe | undefined => {
          return recipes.find((r) => r._id === recipeId);
        };

        // Simulando cálculos financeiros - você deve adaptar conforme sua lógica de negócio
        const totalCost = Math.random() * 100 + 20; // Simular custo total
        const sellingPrice = totalCost * (Math.random() * 2 + 1.5); // Markup entre 150% e 350%
        const profit = sellingPrice - totalCost;
        const profitPercentage = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

        // Resolver itens do cardápio com nomes reais
        const items: any[] = [];

        // Agora sempre temos menuDetails com menuItems
        if (menuDetails.menuItems && menuDetails.menuItems.length > 0) {
          menuDetails.menuItems.forEach((menuItem, index) => {
            const recipe = getRecipeData(menuItem.idItem);
            const itemName = recipe ? recipe.name : `Item não encontrado (ID: ${menuItem.idItem})`;
            const itemCost =
              (totalCost / menuDetails.menuItems.length) * (0.8 + Math.random() * 0.4);

            // Formatar quantidade de forma mais realista
            const quantity = parseFloat(menuItem.quantityUsed) || 1;
            const unit = menuItem.unitMesaure || 'g';
            const formattedQuantity = Number.isInteger(quantity)
              ? `${quantity} ${unit}`
              : `${quantity.toFixed(1)} ${unit}`;

            items.push({
              name: itemName,
              quantity: formattedQuantity,
              cost: itemCost,
              selling: 0, // Geralmente itens individuais não têm preço de venda separado
              profit: -itemCost,
            });
          });
        } else {
          // Menu básico - simular itens (caso não tenha items)
          const numberOfItems = menu.totalItems || 3;
          for (let i = 0; i < numberOfItems; i++) {
            const itemCost = (totalCost / numberOfItems) * (0.8 + Math.random() * 0.4);
            items.push({
              name: `Item do Cardápio ${i + 1}`,
              quantity: `${Math.floor(Math.random() * 5 + 1)} porção${Math.floor(Math.random() * 5 + 1) > 1 ? 'ões' : ''}`,
              cost: itemCost,
              selling: 0,
              profit: -itemCost,
            });
          }
        }

        const portionsText =
          'totalPortions' in menu && menu.totalPortions
            ? `${menu.totalPortions} porções`
            : `${menu.totalItems || 1} itens`;

        const totalPortions =
          'totalPortions' in menu && menu.totalPortions ? menu.totalPortions : menu.totalItems || 1;

        return {
          name: menuDetails.name,
          description: menuDetails.description || 'Cardápio completo com itens selecionados',
          yield: portionsText,
          date: new Date().toLocaleDateString('pt-BR'),
          items,
          totalCost,
          sellingPrice,
          profit,
          profitPercentage,
          cmv: totalCost,
          cmvPercentage: sellingPrice > 0 ? (totalCost / sellingPrice) * 100 : 0,
          directCosts: 0,
          directCostsPercentage: 0,
          indirectCosts: 0,
          indirectCostsPercentage: 0,
          unitCost: totalCost / totalPortions,
          unitSellingPrice: sellingPrice / totalPortions,
          unitProfit: profit / totalPortions,
          unitProfitPercentage: profitPercentage,
        };
      } catch (error) {
        console.error('Erro ao converter dados do cardápio:', error);
        throw new Error('Falha ao processar dados do cardápio para PDF.');
      }
    },
    [],
  );

  return {
    isGenerating,
    generatePDF,
    downloadPDF,
    previewPDF,
    convertMenuToPDFData,
  };
};
