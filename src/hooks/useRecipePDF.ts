import { useCallback, useState } from 'react';
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { buildRecipePDFDocument, RecipePDFData } from '../components/pdf/RecipePDF';
import { getFreshRecipeById } from '../services/api/recipes';
import { Recipe } from '../types/recipes';

interface UseRecipePDFReturn {
  isGenerating: boolean;
  downloadPDF: (recipeId: string, filename?: string) => Promise<void>;
}

const buildRecipePDFData = (recipe: Recipe): RecipePDFData => {
  const yieldText = `${recipe.yieldRecipe || ''} ${recipe.typeYield || ''}`.trim();
  const weightText = `${recipe.weightRecipe || ''} ${recipe.typeWeightRecipe || ''}`.trim();

  return {
    name: recipe.name || 'Receita',
    category: recipe.category || '-',
    description: recipe.descripition || '-',
    preparationTime: recipe.preparationTime || '-',
    yieldText: yieldText || '-',
    weightText: weightText || '-',
  };
};

const buildFilename = (recipeName: string, filename?: string) => {
  if (filename) return filename;

  const safeName = recipeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const date = new Date().toISOString().split('T')[0];
  return `receita-${safeName || 'documento'}-${date}.pdf`;
};

export const useRecipePDF = (): UseRecipePDFReturn => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = useCallback(async (recipeId: string, filename?: string) => {
    if (!recipeId) {
      throw new Error('ID da receita invalido');
    }

    setIsGenerating(true);
    try {
      const recipe = await getFreshRecipeById(recipeId);
      const pdfData = buildRecipePDFData(recipe);
      const blob = await pdf(buildRecipePDFDocument(pdfData)).toBlob();
      saveAs(blob, buildFilename(recipe.name, filename));
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    downloadPDF,
  };
};
