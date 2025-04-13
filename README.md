# Sheila Garcia Pro

Um template moderno e completo para aplicações React com TypeScript, Material UI, Redux Toolkit + Redux Saga, e muito mais.

## Visão Geral

Este template foi criado para fornecer uma base sólida para o desenvolvimento de aplicações web de médio a grande porte. Ele inclui configurações prontas para as principais bibliotecas e ferramentas utilizadas no desenvolvimento moderno com React.

## Tecnologias Principais

- **React com TypeScript**: Para tipagem estática e melhor experiência de desenvolvimento.
- **Material UI**: Biblioteca de componentes com implementação do Material Design.
- **React Router DOM**: Para navegação entre páginas.
- **Redux Toolkit + Redux Saga**: Para gerenciamento de estado e efeitos colaterais.
- **Axios**: Para consumo de APIs REST.
- **ESLint + Prettier**: Para padronização de código.
- **Husky + Lint-staged**: Para hooks de pré-commit.
- **Jest + React Testing Library**: Para testes unitários e de integração.

## Estrutura de Pastas

```
src/
  ├── assets/       # Arquivos estáticos (imagens, fontes, etc.)
  ├── components/   # Componentes reutilizáveis da aplicação
  │   ├── common/   # Componentes comuns (GlobalLoader, NotificationsManager, etc.)
  │   ├── layouts/  # Layouts da aplicação (MainLayout, AuthLayout)
  │   └── ui/       # Componentes de interface (Navbar, Sidebar, etc.)
  ├── config/       # Configurações globais
  ├── hooks/        # Custom hooks
  ├── pages/        # Páginas da aplicação
  │   ├── Auth/     # Páginas de autenticação
  │   ├── Dashboard/# Página do dashboard
  │   └── Home/     # Página inicial
  ├── routes/       # Configuração de rotas
  ├── services/     # Serviços externos (API, etc.)
  │   ├── api/      # Configuração e chamadas de API
  │   └── interceptors/ # Interceptors para requisições Axios
  ├── store/        # Configuração do Redux
  │   ├── sagas/    # Sagas para operações assíncronas
  │   └── slices/   # Slices do Redux Toolkit
  ├── themes/       # Configuração de temas
  └── utils/        # Funções utilitárias
```

## Funcionalidades Implementadas

### Sistema de Autenticação

- Login e Registro de usuários
- Proteção de rotas para usuários autenticados
- Integração com Redux Saga para operações assíncronas
- Armazenamento de tokens JWT
- Interceptors para adicionar token às requisições

### Gerenciamento de Temas

- Suporte para temas light/dark
- Persistência da preferência do usuário
- Tema personalizado com Material UI

### Sistema de Notificações

- Feedback visual para ações do usuário
- Diferentes tipos de notificações (success, error, warning, info)
- Gerenciamento centralizado via Redux

### Layout Responsivo

- Sidebar retrátil
- Adaptação para diferentes tamanhos de tela
- Navbar com menu de usuário

## Páginas de Exemplo

- **Home**: Página inicial pública
- **Login/Registro**: Páginas de autenticação
- **Dashboard**: Área protegida com exemplos de widgets

## Começando

### Pré-requisitos

- Node.js (versão 14 ou superior)
- Yarn ou npm

### Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd projeto-react-template
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
REACT_APP_DESCRIPTION=Template para projetos React com TypeScript
```

## Scripts Disponíveis

- `yarn start`: Inicia o servidor de desenvolvimento
- `yarn build`: Gera a versão de produção
- `yarn test`: Executa os testes
- `yarn lint`: Verifica o código com ESLint
- `yarn lint:fix`: Corrige automaticamente problemas de linting
- `yarn format`: Formata o código com Prettier

## Customização

### Adicionando Novas Rotas

Edite o arquivo `src/routes/index.tsx` para adicionar novas rotas à aplicação:

```tsx
// Exemplo de adição de nova rota
<Route path="/nova-rota" element={<NovaComponente />} />
```

### Adicionando Novos Slices ao Redux

1. Crie um novo arquivo em `src/store/slices/`
2. Adicione o novo reducer ao arquivo `src/store/index.ts`

### Adicionando Novas Sagas

1. Crie um novo arquivo em `src/store/sagas/`
2. Adicione a nova saga à combinação de sagas em `src/store/index.ts`

## Boas Práticas

- Use os aliases de import para manter o código organizado (ex: `@components/`, `@store/`)
- Mantenha os componentes pequenos e focados em uma única responsabilidade
- Utilize os hooks customizados para lógica reutilizável
- Escreva testes para funcionalidades críticas

## Contribuição

Sinta-se à vontade para contribuir com melhorias para este template. Abra uma issue ou envie um pull request.

## Licença

MIT
