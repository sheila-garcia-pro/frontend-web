/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_TOKEN_KEY: string;
  readonly VITE_USER_KEY: string;
  readonly VITE_NAME: string;
  readonly VITE_DESCRIPTION: string;
  // Adicione outras variáveis aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
