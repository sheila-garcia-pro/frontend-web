/**
 * Flag global para indicar quando um login está em progresso
 * Isso ajuda a evitar condições de corrida entre login e verificações de auth
 */

let isLoginInProgress = false;

export const setLoginInProgress = (inProgress: boolean) => {
  isLoginInProgress = inProgress;
};

export const getLoginInProgress = () => {
  return isLoginInProgress;
};

export default {
  setLoginInProgress,
  getLoginInProgress,
};
