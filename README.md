# Sheila Garcia Pro

Um aplicativo moderno e completo para gerenciamento de receitas e ingredientes, desenvolvido com React, TypeScript, Material UI, Redux Toolkit e mais.

## Visão Geral

Sheila Garcia Pro é uma aplicação web responsiva para visualização de receitas e ingredientes. O projeto foi desenvolvido com foco em experiência do usuário, oferecendo uma interface moderna e intuitiva para explorar receitas e ingredientes disponíveis.

## Tecnologias Utilizadas

- **React 19**: Biblioteca para construção de interfaces
- **TypeScript 4**: Tipagem estática para melhor manutenção do código
- **Material UI 7**: Framework de componentes para design responsivo
- **Redux Toolkit 2.6**: Gerenciamento de estado global
- **React Router 7**: Navegação entre páginas
- **Redux Saga**: Middleware para operações assíncronas
- **Axios**: Cliente HTTP para requisições à API
- **ESLint + Prettier**: Para padronização de código
- **Husky + Lint-staged**: Para hooks de pré-commit
- **Jest + React Testing Library**: Para testes unitários e de integração

## Estrutura de Pastas

```
src/
  ├── assets/       # Arquivos estáticos (imagens, fontes, etc.)
  ├── components/   # Componentes reutilizáveis da aplicação
  │   ├── common/   # Componentes comuns (GlobalLoader, NotificationsManager, etc.)
  │   ├── layouts/  # Layouts da aplicação (MainLayout, AuthLayout)
  │   └── ui/       # Componentes de interface (Navbar, Sidebar, Cards, Carousel, etc.)
  │       ├── Carousel/       # Componente de carrossel
  │       ├── IngredientCard/ # Card para exibição de ingredientes
  │       ├── RecipeCard/     # Card para exibição de receitas
  │       └── SkeletonLoading/ # Componentes de skeleton para loading
  ├── config/       # Configurações globais
  ├── contexts/     # Contextos React (ThemeContext)
  ├── hooks/        # Custom hooks
  ├── mocks/        # Dados mockados (ingredientesMock, receitasMock)
  ├── pages/        # Páginas da aplicação
  │   ├── Auth/     # Páginas de autenticação
  │   ├── Dashboard/# Página do dashboard
  │   ├── Home/     # Página inicial com carrosséis
  │   ├── Ingredients/ # Página de listagem de ingredientes
  │   └── Recipes/  # Página de listagem de receitas
  ├── routes/       # Configuração de rotas
  ├── services/     # Serviços externos e simulados
  │   ├── api/      # Configuração e chamadas de API
  │   └── dataService.ts # Serviço para carregamento simulado de dados
  ├── store/        # Configuração do Redux
  │   ├── sagas/    # Sagas para operações assíncronas
  │   └── slices/   # Slices do Redux Toolkit
  ├── themes/       # Configuração de temas
  └── utils/        # Funções utilitárias
```

## Funcionalidades Implementadas

### Página Home

- **Carregamento Simulado**: Simulação de requisições à API com loading states e notificações
- **Carrosséis**: Exibição de ingredientes e receitas em destaque com navegação
- **Cards Interativos**: Cards com efeito de hover e botão para navegação para detalhes
- **Layout Responsivo**: Adaptação para diferentes tamanhos de tela
- **Skeleton Loading**: Exibição de placeholders durante o carregamento

### Página de Ingredientes

- **Listagem Completa**: Visualização de todos os ingredientes disponíveis
- **Filtragem e Busca**: Filtro por nome e categorias (Premium, Populares)
- **Ordenação**: Diversas opções de ordenação (nome, preço, número de receitas)
- **Paginação**: Navegação entre páginas de resultados
- **Mensagens Contextuais**: Feedback quando nenhum resultado é encontrado
- **Loading States**: Exibição de skeleton loaders durante o carregamento

### Página de Receitas

- **Listagem Completa**: Visualização de todas as receitas disponíveis
- **Filtragem por Nome e Tipo**: Busca por nome ou tipo de prato
- **Filtro por Tipo de Prato**: Seleção por categorias (Entrada, Prato Principal, etc.)
- **Ordenação**: Diversas opções de ordenação (nome, porções)
- **Filtros Visuais**: Exibição de chips para filtros ativos
- **Paginação**: Navegação entre páginas de resultados
- **Feedback Visual**: Mensagens para buscas sem resultados
- **Loading States**: Skeleton loaders durante o carregamento

### Sistema de Autenticação

- **Login e Registro**: Autenticação de usuários
- **Proteção de Rotas**: Acesso restrito a usuários autenticados
- **Recuperação de Senha**: Fluxo para recuperação de senha
- **Integração com Redux**: Gerenciamento de estado de autenticação

### Gerenciamento de Temas

- **Tema Claro/Escuro**: Alternância entre temas light e dark
- **Persistência de Preferência**: Salvamento da preferência de tema no localStorage
- **Detecção de Tema do Sistema**: Reconhecimento do tema preferido do sistema operacional

### Sistema de Notificações

- **Tipos de Notificações**: Suporte para mensagens de sucesso, erro, aviso e informação
- **Gestão de Exibição**: Exibição automática e remoção temporizada de notificações
- **Empilhamento**: Suporte para múltiplas notificações simultâneas

### Layout Responsivo

- **Adaptação a Diferentes Tamanhos de Tela**: Layout responsivo para desktop e dispositivos móveis
- **Sidebar Colapsável**: Menu lateral que pode ser expandido ou recolhido
- **Navegação Mobile-Friendly**: Experiência adaptada para dispositivos móveis

## Mocks e Simulação de Dados

O projeto utiliza dados mockados para simular o consumo de uma API:

### ingredientesMock.js

- Simulação de 100 ingredientes com imagens dinâmicas via Unsplash
- Cada ingrediente possui ID, nome, preço e número de receitas relacionadas

### receitasMock.js

- Simulação de 100 receitas com imagens dinâmicas via Unsplash
- Cada receita possui ID, nome, tipo de prato (Entrada, Prato Principal, etc.) e número de porções

### Serviço de Carregamento Simulado

- `fetchHomeData()`: Carrega dados para a página Home
- `fetchIngredientes()`: Carrega a lista completa de ingredientes
- `fetchReceitas()`: Carrega a lista completa de receitas
- Simulação de tempos de carregamento entre 1 e 2,5 segundos
- Probabilidade de erro de 5% para testar fluxos de erro

## Componentes Principais

### Carousel

Componente reutilizável para exibição de itens em carrossel:
- Suporte para responsividade com diferentes quantidades de itens por linha
- Navegação com botões e indicadores de página
- Transição suave entre páginas

### IngredientCard / RecipeCard

Cards para exibição de itens:
- Layout padronizado com imagem, título e detalhes
- Efeito de elevação no hover
- Botão de "Ver Detalhes" para navegação
- Exibição de informações específicas (preço, número de receitas, tipo de prato, porções)

### SkeletonLoading

Componentes para exibição durante carregamento:
- Placeholders com animação de pulso
- Estrutura similar aos cards finais para evitar layout shifts
- Versões específicas para ingredientes e receitas

## Começando

### Pré-requisitos

- Node.js (versão 14 ou superior)
- Yarn ou npm

### Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd sheila-garcia-pro
```

2. Instale as dependências:

**Utilizando o script de configuração completa (recomendado):**

No Windows:
```bash
setup-project.bat
```

Este script:
- Instala todas as dependências necessárias
- Configura o Craco para path aliases
- Atualiza os scripts no package.json
- Configura o Husky para pré-commits

**Ou utilizando os scripts de instalação básica:**

No Linux/Mac:
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

No Windows:
```bash
install-dependencies.bat
```

**Ou manualmente:**
```bash
yarn install
# ou
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
yarn start
# ou
npm start
```

4. Acesse a aplicação em `http://localhost:3000`

## Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configuração. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# API
REACT_APP_API_URL=http://localhost:3001/api

# Auth
REACT_APP_TOKEN_KEY=@sheila-garcia-pro-token
REACT_APP_USER_KEY=@sheila-garcia-pro-user

# App
REACT_APP_NAME=Sheila Garcia Pro
REACT_APP_DESCRIPTION=Aplicação para gerenciamento de receitas e ingredientes
```

## Scripts Disponíveis

- `yarn start`: Inicia o servidor de desenvolvimento
- `yarn build`: Gera a versão de produção
- `yarn test`: Executa os testes
- `yarn lint`: Verifica o código com ESLint
- `yarn lint:fix`: Corrige automaticamente problemas de linting
- `yarn format`: Formata o código com Prettier

## Próximos Passos

- **Detalhes de Ingredientes e Receitas**: Implementação das páginas de detalhes
- **Funcionalidades de CRUD**: Adição de criação, edição e exclusão de itens
- **Filtros Avançados**: Implementação de filtros adicionais (por ingredientes, tempo de preparo, etc.)
- **Favoritos**: Sistema para marcar e salvar itens favoritos
- **Integração com API Real**: Substituição dos mocks por chamadas reais à API
- **Testes Automatizados**: Ampliação da cobertura de testes
- **PWA**: Transformação em Progressive Web App para instalação em dispositivos
- **Internacionalização**: Suporte para múltiplos idiomas

## Documentação Adicional

O projeto inclui documentação detalhada sobre:
- [Tela de Ingredientes](./documentacao/tela_ingredientes.md)
- [Tela de Receitas](./documentacao/tela_receitas.md)
- [Resumo do Projeto](./documentacao/resumo_do_projeto.md)

## Contribuição

Sinta-se à vontade para contribuir com melhorias para este projeto. Abra uma issue ou envie um pull request.

## Licença

MIT
