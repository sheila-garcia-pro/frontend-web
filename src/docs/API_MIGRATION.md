# Guia de Migração para a API de Ingredientes

Este documento descreve o processo de migração dos dados mockados para a API real de ingredientes e categorias.

## Visão Geral da Migração

A migração foi implementada de forma gradual para permitir a coexistência temporária entre o formato antigo (mockado) e o novo formato (API). O objetivo é permitir que partes do sistema sejam atualizadas independentemente, sem quebrar funcionalidades existentes.

## O que foi Implementado

1. Novas interfaces para definir os tipos de dados da API em `src/types/ingredients.ts`
2. Serviços de API para ingredientes e categorias em:
   - `src/services/api/ingredients.ts`
   - `src/services/api/categories.ts`
3. Slices do Redux para gerenciar o estado:
   - `src/store/slices/ingredientsSlice.ts`
   - `src/store/slices/categoriesSlice.ts`
4. Sagas para gerenciar operações assíncronas:
   - `src/store/sagas/ingredientsSagas.ts`
   - `src/store/sagas/categoriesSagas.ts`
5. Componentes para criar novos ingredientes e categorias:
   - `src/components/ui/IngredientModal/index.tsx`
   - `src/components/ui/CategoryModal/index.tsx`
6. Adaptação do componente `IngredientCard` para suportar ambos os formatos

## Camada de Compatibilidade

Para garantir a compatibilidade durante a transição, implementamos as seguintes estratégias:

1. **Componente IngredientCard com suporte a dois formatos**:
   - Formato antigo: recebe propriedades separadas (`id`, `name`, `image`, etc.)
   - Formato novo: recebe um objeto `ingredient` completo

2. **Serviço dataService com adaptação de formatos**:
   - A função `convertIngredientsToLegacyFormat` converte dados da API para o formato esperado pelos componentes legados
   - Implementamos fallback para os mocks em caso de erro na API

## Passos para Completar a Migração

Para completar a migração e usar exclusivamente o novo formato da API, siga estes passos:

1. **Atualizar a página Home**:
   ```jsx
   // De
   <IngredientCard
     key={ingredient.id}
     id={ingredient.id}
     name={ingredient.name}
     image={ingredient.image}
     price={ingredient.price}
     recipesCount={ingredient.recipesCount}
   />
   
   // Para
   <IngredientCard
     key={ingredient._id}
     ingredient={ingredient}
     recipesCount={ingredient.recipesCount || 0}
   />
   ```

2. **Atualizar a função fetchHomeData**:
   - Remover a função `convertIngredientsToLegacyFormat`
   - Atualizar o serviço para retornar diretamente os dados da API

3. **Limpar o componente IngredientCard**:
   - Remover o suporte ao formato legado
   - Simplificar a lógica de extração de dados

4. **Atualizar interfaces e tipos**:
   - Padronizar o uso da interface `Ingredient` em todo o código
   - Remover tipos e interfaces temporárias de compatibilidade

## Exemplo de Componente IngredientCard Após a Migração

```tsx
interface IngredientCardProps {
  ingredient: Ingredient;
  recipesCount?: number;
}

const IngredientCard: React.FC<IngredientCardProps> = ({ 
  ingredient,
  recipesCount = 0
}) => {
  const { _id, name, image } = ingredient;
  
  // Resto do componente...
}
```

## Testes e Validação

Antes de remover a camada de compatibilidade, certifique-se de:

1. Testar todas as páginas que usam o componente IngredientCard
2. Verificar se todas as chamadas à API estão funcionando corretamente
3. Garantir que todos os componentes estão recebendo os dados no formato correto

## Conclusão

Esta migração permite uma transição suave do uso de dados mockados para a API real, mantendo a compatibilidade com o código existente enquanto novas funcionalidades são desenvolvidas usando o novo formato de dados. 