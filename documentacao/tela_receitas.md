# Documentação da Tela de Receitas

## 1. Visão Geral

A tela de Receitas é uma interface moderna e interativa que exibe uma coleção de receitas disponíveis no sistema. Foi desenvolvida com foco em usabilidade, apresentando um layout responsivo e diversas funcionalidades para filtragem e navegação. A tela se integra perfeitamente ao estilo visual das telas Home e Ingredientes, mantendo consistência na experiência do usuário.

## 2. Funcionalidades Implementadas

### 2.1 Carregamento Simulado de Dados

- **Simulação de API**: Utiliza o serviço `fetchReceitas()` para simular uma requisição assíncrona ao servidor.
- **Tempo de carregamento**: Adiciona um atraso aleatório entre 1 e 2,5 segundos para simular a latência da rede.
- **Tratamento de erros**: Implementa uma probabilidade aleatória de erro (5%) para testar e demonstrar o fluxo de falha.

### 2.2 Feedback Visual

- **Estado de carregamento**: Exibe skeleton loaders durante o carregamento dos dados para melhor experiência do usuário.
- **Notificações**: Mostra notificações de sucesso ou erro após o carregamento, utilizando o Redux.
- **Mensagem de resultados vazios**: Apresenta uma mensagem informativa quando nenhuma receita é encontrada após a aplicação dos filtros.

### 2.3 Filtragem e Organização

- **Busca avançada**: Campo de pesquisa que filtra receitas pelo nome ou pelo tipo de prato.
- **Filtro por tipo de prato**: Seletor dropdown com os tipos disponíveis (ex: Entrada, Sobremesa, Prato Principal).
- **Ordenação**: Permite ordenar as receitas por nome ou número de porções, em ordem crescente ou decrescente.
- **Paginação**: Divide os resultados em páginas para melhor performance e usabilidade.
- **Filtros ativos**: Exibe chips removíveis com os filtros ativos, permitindo que o usuário veja e remova facilmente os filtros aplicados.

### 2.4 Layout Responsivo

- **Design adaptável**: Interface que se ajusta automaticamente a diferentes tamanhos de tela (mobile, tablet, desktop).
- **Grid responsivo**: Organiza os cards em colunas que se adaptam ao espaço disponível.
- **Componentes visuais**: Utiliza cards com design moderno, cantos arredondados e efeito de hover para melhor interatividade.

### 2.5 Navegação

- **Detalhes da receita**: Cada card possui um botão "Ver Detalhes" que permite navegar para a página de detalhes da receita específica.
- **Navegação entre páginas**: Sistema de paginação com botões para navegar entre as páginas de resultados.

## 3. Aspectos Técnicos

### 3.1 Componentes Utilizados

- `RecipesPage`: Componente principal da página.
- `RecipeCard`: Card para exibição de cada receita.
- `RecipeSkeleton`: Placeholder visual durante o carregamento.
- Material UI: Framework para componentes de interface.

### 3.2 Gerenciamento de Estado

- **Estado local**: Utiliza React Hooks (useState, useEffect) para gerenciar o estado interno.
- **Estado global**: Usa Redux para gerenciar notificações.
- **Filtros dinâmicos**: Extrai automaticamente os tipos de pratos disponíveis dos dados para criar filtros contextuais.

### 3.3 Requisitos de Acessibilidade

- **Textos alternativos**: Inclui atributos alt nas imagens para suporte a leitores de tela.
- **Estrutura semântica**: Utiliza elementos HTML apropriados para garantir acessibilidade.
- **Contraste e legibilidade**: Implementa cores e tamanhos de fonte adequados para boa legibilidade.

## 4. Fluxo do Usuário

1. Ao acessar a página, o usuário vê skeleton loaders enquanto os dados são carregados.
2. Após o carregamento, as receitas são exibidas em um grid responsivo.
3. O usuário pode:
   - Buscar receitas por nome ou tipo de prato usando o campo de pesquisa
   - Filtrar receitas por tipo de prato usando o dropdown
   - Ordenar receitas por diferentes critérios
   - Navegar entre páginas usando a paginação
4. Ao clicar em "Ver Detalhes" em um card, o usuário é direcionado para a página de detalhes da receita.

## 5. Preparação para Futuras Integrações

- **Abstração de serviços**: O carregamento de dados foi implementado de forma a facilitar a futura integração com APIs reais.
- **Estrutura escalável**: A organização de código permite adicionar facilmente novas funcionalidades como CRUD.
- **Navegação preparada**: Rotas para detalhes das receitas já configuradas.
- **Filtros dinâmicos**: O sistema extrai automaticamente os tipos de pratos disponíveis, adaptando-se ao conteúdo da API.

## 6. Screenshots

(Espaço reservado para adicionar capturas de tela da interface em diferentes estados)

## 7. Próximos Passos

- Implementação da tela de detalhes da receita.
- Adição de funcionalidades de criação, edição e exclusão.
- Implementação de filtros avançados por ingredientes, tempo de preparo, ou dificuldade.
- Integração com o backend real quando disponível.
- Adição de recursos de favoritos e compartilhamento de receitas.

---

*Documentação gerada em Abril de 2024* 