# Módulo de Fornecedores

## Visão Geral

Módulo completo para gerenciamento de fornecedores com funcionalidades CRUD (Create, Read, Update, Delete).

## Estrutura de Arquivos Criados

### 1. Types (`src/types/suppliers.ts`)

- **Supplier**: Interface principal do fornecedor
- **CreateSupplierParams**: Parâmetros para criação
- **UpdateSupplierParams**: Parâmetros para atualização
- **SupplierGroup**: Tipos de grupos (açougue, hortifruti, mercado, etc.)
- **SUPPLIER_GROUP_LABELS**: Labels amigáveis para exibição

### 2. Hook Customizado (`src/hooks/useSuppliers.ts`)

Hook que gerencia todo o estado e operações CRUD com dados mockados:

- `createSupplier()`: Criar novo fornecedor
- `updateSupplier()`: Atualizar fornecedor existente
- `deleteSupplier()`: Excluir fornecedor
- `getSupplierById()`: Buscar fornecedor específico
- `searchSuppliers()`: Buscar com filtros e paginação
- `availableGroups`: Lista de grupos disponíveis

### 3. Componentes

#### SupplierModal (`src/components/ui/SupplierModal.tsx`)

Modal para criação e edição de fornecedores com:

- Validação de campos obrigatórios
- Campos: Nome, Grupo, Endereço, Telefone, Comentários
- Feedback visual de erros

#### SupplierDetailsModal (`src/components/ui/SupplierDetailsModal.tsx`)

Modal para visualização detalhada com:

- Exibição formatada de todos os dados
- Informações de data de criação/atualização
- Layout organizado com ícones

### 4. Página Principal (`src/pages/Suppliers/index.tsx`)

Página completa com:

- **Busca**: Buscar por nome
- **Filtros**: Por grupo e ordenação
- **Tabela**: Listagem com paginação
- **Ações**: Ver detalhes, Editar, Excluir
- **Paginação**: 10 itens por página
- **Contador**: Total de resultados

## Grupos Disponíveis

- Açougue
- Hortifruti
- Mercado
- Adega
- Padaria
- Laticínios
- Pescado
- Outros

## Campos do Fornecedor

- **Nome** (obrigatório)
- **Grupo** (obrigatório)
- **Endereço** (obrigatório)
- **Telefone** (obrigatório)
- **Comentários** (opcional)

## Funcionalidades Implementadas

### ✅ Create (Criar)

- Botão "Novo Fornecedor"
- Modal com formulário validado
- Todos os campos com validação

### ✅ Read (Ler)

- Listagem em tabela
- Busca por nome
- Filtro por grupo
- Ordenação (nome/grupo, A-Z/Z-A)
- Paginação
- Visualização de detalhes

### ✅ Update (Atualizar)

- Botão de editar em cada linha
- Modal pré-preenchido com dados
- Mesma validação da criação

### ✅ Delete (Excluir)

- Botão de excluir em cada linha
- Dialog de confirmação
- Ajuste automático de página após exclusão

## Dados Mockados

O hook `useSuppliers` vem com 7 fornecedores de exemplo:

1. Açougue Central
2. Hortifruti Verdão
3. Mercado São José
4. Adega Premium
5. Padaria Pão Quente
6. Laticínios Vale Verde
7. Pescados do Mar

## Preparação para API

O código está estruturado para facilitar a migração para API:

- Hook isolado com todas as operações
- Interfaces TypeScript bem definidas
- Separação clara de responsabilidades
- Simula delay de API (500ms)

## Próximos Passos (Futuro)

1. Conectar com API backend
2. Adicionar notificações de sucesso/erro
3. Implementar loading states mais elaborados
4. Adicionar upload de logo do fornecedor
5. Melhorar responsividade mobile
6. Adicionar filtros avançados
7. Exportar lista para PDF/Excel
