# Documentação da Tela de Ingredientes

## 1. Visão Geral

A tela de Ingredientes é uma interface responsiva e interativa que exibe uma lista de ingredientes disponíveis no sistema. Ela foi desenvolvida com foco na experiência do usuário, oferecendo funcionalidades de busca, filtragem, ordenação e paginação.

## 2. Funcionalidades Implementadas

### 2.1 Carregamento Simulado de Dados

- **Simulação de API**: Utiliza o serviço `fetchIngredientes()` para simular uma requisição assíncrona ao servidor.
- **Tempo de carregamento**: Adiciona um atraso aleatório entre 1 e 2,5 segundos para simular a latência da rede.
- **Tratamento de erros**: Implementa uma probabilidade aleatória de erro (5%) para testar o fluxo de falha.

### 2.2 Feedback Visual

- **Estado de carregamento**: Exibe skeleton loaders durante o carregamento dos dados.
- **Notificações**: Mostra notificações de sucesso ou erro após o carregamento, utilizando o Redux.
- **Mensagem de resultados vazios**: Apresenta uma mensagem amigável quando nenhum ingrediente é encontrado.

### 2.3 Filtragem e Organização

- **Busca por nome**: Campo de busca que filtra ingredientes pelo nome em tempo real.
- **Categorização por tabs**: Agrupa os ingredientes em categorias (Todos, Premium, Populares).
- **Ordenação**: Permite ordenar os ingredientes por nome, preço ou número de receitas, em ordem crescente ou decrescente.
- **Paginação**: Divide os resultados em páginas para melhor performance e usabilidade.

### 2.4 Layout Responsivo

- **Design adaptável**: Interface que se ajusta automaticamente a diferentes tamanhos de tela (mobile, tablet, desktop).
- **Grid responsivo**: Organiza os cards em colunas que se adaptam ao espaço disponível.
- **Componentes visuais**: Utiliza cards com design moderno, cantos arredondados e efeito de hover.

### 2.5 Navegação

- **Detalhes do ingrediente**: Cada card possui um botão "Ver Detalhes" que permite navegar para a página de detalhes do ingrediente específico.
- **Navegação entre páginas**: Sistema de paginação com botões para navegar entre as páginas de resultados.

## 3. Aspectos Técnicos

### 3.1 Componentes Utilizados

- `IngredientsPage`: Componente principal da página.
- `IngredientCard`: Card para exibição de cada ingrediente.
- `IngredientSkeleton`: Placeholder visual durante o carregamento.
- Material UI: Framework para componentes de interface.

### 3.2 Gerenciamento de Estado

- **Estado local**: Utiliza React Hooks (useState, useEffect) para gerenciar o estado interno.
- **Estado global**: Usa Redux para gerenciar notificações.

### 3.3 Requisitos de Acessibilidade

- **Textos alternativos**: Inclui atributos alt nas imagens para suporte a leitores de tela.
- **Estrutura semântica**: Utiliza elementos HTML apropriados para garantir acessibilidade.
- **Contraste e legibilidade**: Implementa cores e tamanhos de fonte adequados.

## 4. Fluxo do Usuário

1. Ao acessar a página, o usuário vê skeleton loaders enquanto os dados são carregados.
2. Após o carregamento, os ingredientes são exibidos em um grid responsivo.
3. O usuário pode filtrar os ingredientes usando a barra de pesquisa, as tabs ou a ordenação.
4. Ao clicar em "Ver Detalhes" em um card, o usuário é direcionado para a página de detalhes do ingrediente.
5. A qualquer momento, o usuário pode navegar entre as páginas de resultados usando a paginação.

## 5. Preparação para Futuras Integrações

- **Abstração de serviços**: O carregamento de dados foi implementado de forma a facilitar a futura integração com APIs reais.
- **Estrutura escalável**: A organização de código permite adicionar facilmente novas funcionalidades como CRUD.
- **Navegação preparada**: Rotas para detalhes dos ingredientes já configuradas.

## 6. Screenshots

(Espaço reservado para adicionar capturas de tela da interface em diferentes estados)

## 7. Próximos Passos

- Implementação da tela de detalhes do ingrediente.
- Adição de funcionalidades de criação, edição e exclusão.
- Implementação de filtros avançados por categorias ou atributos.
- Integração com o backend real quando disponível.

---

*Documentação gerada em Abril de 2024* 