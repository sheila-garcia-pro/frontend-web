import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as usersService from '@services/api/users';
import { User, CreateUserParams } from '@services/api/users';
import { addNotification } from '@store/slices/uiSlice';

interface UseUsersReturn {
  loadingUser: boolean;
  currentUser: User | null;
  userById: User | null;
  errorMessage: string | null;
  getCurrentUser: () => Promise<User | undefined>;
  getUserById: (id: string) => Promise<User | undefined>;
  createUser: (params: CreateUserParams) => Promise<User | null>;
}

export const useUsers = (): UseUsersReturn => {
  const dispatch = useDispatch();
  const [loadingUser, setLoadingUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userById, setUserById] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Obter usuário logado
  const getCurrentUser = useCallback(async () => {
    try {
      setLoadingUser(true);
      setErrorMessage(null);
      const userData = await usersService.getCurrentUser();
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao obter usuário atual';
      setErrorMessage(errorMsg);
      dispatch(
        addNotification({
          message: errorMsg,
          type: 'error',
        })
      );
    } finally {
      setLoadingUser(false);
    }
  }, [dispatch]);

  // Obter usuário por ID
  const getUserById = useCallback(
    async (id: string) => {
      try {
        setLoadingUser(true);
        setErrorMessage(null);
        const userData = await usersService.getUserById(id);
        setUserById(userData);
        return userData;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : `Erro ao obter usuário #${id}`;
        setErrorMessage(errorMsg);
        dispatch(
          addNotification({
            message: errorMsg,
            type: 'error',
          })
        );
      } finally {
        setLoadingUser(false);
      }
    },
    [dispatch]
  );

  // Criar um novo usuário
  const createUser = useCallback(
    async (params: CreateUserParams) => {
      try {
        setLoadingUser(true);
        setErrorMessage(null);
        const newUser = await usersService.createUser(params);
        dispatch(
          addNotification({
            message: 'Usuário criado com sucesso!',
            type: 'success',
          })
        );
        return newUser;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro ao criar usuário';
        setErrorMessage(errorMsg);
        dispatch(
          addNotification({
            message: errorMsg,
            type: 'error',
          })
        );
        return null;
      } finally {
        setLoadingUser(false);
      }
    },
    [dispatch]
  );

  return {
    loadingUser,
    currentUser,
    userById,
    errorMessage,
    getCurrentUser,
    getUserById,
    createUser,
  };
}; 