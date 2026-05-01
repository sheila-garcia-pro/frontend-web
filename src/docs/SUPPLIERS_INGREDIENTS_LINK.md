# Vinculação entre Fornecedores e Ingredientes

## Visão Geral

Sistema completo de vinculação bidirecional entre Fornecedores e Ingredientes, permitindo gerenciar quais fornecedores fornecem cada ingrediente.

## Arquivos Modificados

### 1. Tipos TypeScript

#### `src/types/ingredients.ts`

- ✅ Adicionado campo `suppliers?: string[]` à interface `Ingredient`
- ✅ Adicionado campo `suppliers?: string[]` à interface `CreateIngredientParams`

#### `src/types/suppliers.ts`

- ✅ Adicionado campo `ingredients?: string[]` à interface `Supplier`

### 2. Hook de Fornecedores

#### `src/hooks/useSuppliers.ts`

**Novas funções exportadas:**

- `linkIngredientToSupplier(supplierId, ingredientId)` - Vincula um ingrediente a um fornecedor
- `unlinkIngredientFromSupplier(supplierId, ingredientId)` - Remove vinculação
- `getSuppliersByIngredient(ingredientId)` - Retorna todos os fornecedores de um ingrediente

**Características:**

- Evita duplicatas automaticamente
- Simula delay de API (500ms)
- Atualiza `updatedAt` ao modificar vínculos

### 3. Novos Componentes

#### `src/components/ui/IngredientSuppliersModal.tsx`

Modal completo para gerenciar fornecedores de um ingrediente específico.

**Funcionalidades:**

- ✅ Adicionar fornecedor a um ingrediente
- ✅ Remover fornecedor de um ingrediente
- ✅ Listar todos os fornecedores vinculados
- ✅ Select com fornecedores disponíveis (não vinculados)
- ✅ Exibição de detalhes: nome, grupo, telefone, endereço
- ✅ Estados de loading durante operações
- ✅ Alertas quando não há fornecedores disponíveis

### 4. Página de Ingredientes Atualizada

#### `src/pages/Ingredients/index.tsx`

**Desktop/Tablet (Tabela):**

- ✅ Nova coluna "Ações" com botão de fornecedores
- ✅ Ícone de loja (Store) para gerenciar fornecedores
- ✅ Tooltip explicativo
- ✅ Click não interfere com visualização de detalhes

**Mobile (Cards):**

- ✅ Botão "Fornecedores" nos cards de ingredientes
- ✅ Ícone de loja (Store)
- ✅ Layout responsivo

**Funcionalidades:**

- Modal abre ao clicar no botão/ícone
- Gerenciamento completo de fornecedores sem sair da tela

### 5. Página de Fornecedores Atualizada

#### `src/components/ui/SupplierDetailsModal.tsx`

**Novas seções:**

- ✅ "Ingredientes Vinculados" com contador
- ✅ Lista de ingredientes com nome e categoria
- ✅ Ícone de cozinha (Kitchen)
- ✅ Mensagem quando não há ingredientes vinculados
- ✅ Integração com Redux para buscar dados de ingredientes

## Fluxo de Uso

### Vincular Fornecedor a Ingrediente

1. Acesse a página de **Ingredientes** (`/ingredients`)
2. Localize o ingrediente desejado
3. Clique no ícone de **loja** (Store) na coluna Ações ou no botão "Fornecedores" (mobile)
4. No modal que abre:
   - Selecione um fornecedor no dropdown
   - Clique em "Adicionar"
5. O fornecedor aparece na lista de vinculados
6. Repita para adicionar múltiplos fornecedores

### Remover Vinculação

1. No mesmo modal de fornecedores do ingrediente
2. Clique no ícone de **lixeira** ao lado do fornecedor
3. A vinculação é removida imediatamente

### Visualizar Ingredientes de um Fornecedor

1. Acesse a página de **Fornecedores** (`/suppliers`)
2. Localize o fornecedor desejado
3. Clique no ícone de **olho** (Visualizar)
4. No modal de detalhes, veja a seção "Ingredientes Vinculados"
5. Lista mostra todos os ingredientes com nome e categoria

## Estrutura de Dados

### Ingrediente com Fornecedores

```typescript
{
  _id: "123",
  name: "Tomate",
  category: "Hortifruti",
  image: "...",
  suppliers: ["fornecedor-1", "fornecedor-2"], // IDs dos fornecedores
  price: { ... }
}
```

### Fornecedor com Ingredientes

```typescript
{
  _id: "fornecedor-1",
  name: "Hortifruti Verdão",
  group: "hortifruti",
  ingredients: ["123", "456", "789"], // IDs dos ingredientes
  address: "...",
  phone: "...",
  comments: "..."
}
```

## Sincronização Bidirecional

O sistema mantém a sincronização entre as duas entidades:

- Ao vincular um ingrediente ao fornecedor → o ID do ingrediente é adicionado ao array `ingredients` do fornecedor
- Ao desvincular → o ID é removido do array
- A busca funciona nos dois sentidos:
  - `getSuppliersByIngredient()` retorna fornecedores de um ingrediente
  - Modal de detalhes do fornecedor mostra ingredientes vinculados

## Estado de Loading

Todas as operações de vinculação/desvinculação:

- ✅ Exibem indicador de loading
- ✅ Desabilitam botões durante a operação
- ✅ Simulam delay de API (500ms)
- ✅ Atualizam a interface automaticamente após conclusão

## Validações

- ✅ Não permite duplicatas (vinculação já existente é ignorada)
- ✅ Select só mostra fornecedores não vinculados
- ✅ Alert quando todos os fornecedores já estão vinculados
- ✅ Contador atualizado em tempo real

## Preparação para API Real

A estrutura está pronta para conectar com backend:

1. As funções `linkIngredientToSupplier` e `unlinkIngredientFromSupplier` podem ser substituídas por chamadas HTTP
2. Os tipos TypeScript estão definidos
3. A interface simula comportamento assíncrono
4. Estados de loading já implementados

## Próximos Passos (Futuro)

1. Conectar com endpoints de API:
   - `POST /v1/suppliers/:id/ingredients/:ingredientId`
   - `DELETE /v1/suppliers/:id/ingredients/:ingredientId`
2. Adicionar notificações de sucesso/erro
3. Implementar sync com servidor
4. Adicionar filtro de ingredientes por fornecedor
5. Exportar relatórios de vinculações
6. Histórico de mudanças
