import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { addNotification } from '../store/slices/uiSlice';
import { getCachedRecipes, getRecipes } from '../services/api/recipes';
import { clearCache } from '../services/api';
import { Recipe } from '../types/recipes';
import { useDebounce } from './useDebounce';

/**
 * Hook personalizado para gerenciar o estado da página de receitas
 * Centraliza toda a lógica de estado, filtros e paginação
 */
export const useRecipesPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Estados locais
  const [loading, setLoading] = useState(true);
  const [receitas, setReceitas] = useState<Recipe[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOption, setSortOption] = useState('name_asc');
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs para controle de sincronização
  const previousTotal = useRef(0);
  const isInitialLoad = useRef(true);

  // Aplicar debounce ao termo de busca
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // Constantes
  const itemsPerPage = 8;

  // Função para carregar receitas com parâmetros otimizados
  const loadRecipes = useCallback(
    async (
      params: {
        search?: string;
        category?: string;
        forceRefresh?: boolean;
        showNotification?: boolean;
      } = {},
    ) => {
      setLoading(true);
      try {
        let response;

        if (params.forceRefresh) {
          // Limpa completamente o cache antes de fazer a nova requisição
          clearCache('/v1/users/me/recipe');

          response = await getRecipes({
            page: 1,
            itemPerPage: 1000, // Carrega muitas receitas para filtros frontend
            search: params.search,
            category: params.category,
          });
        } else {
          response = await getCachedRecipes({
            page: 1,
            itemPerPage: 1000, // Carrega muitas receitas para filtros frontend
            search: params.search,
            category: params.category,
          });
        }

        setReceitas(response.data);
        setTotalPages(response.totalPages);

        if (params.showNotification !== false) {
          dispatch(
            addNotification({
              message: 'Receitas carregadas com sucesso!',
              type: 'success',
              duration: 4000,
            }),
          );
        }
      } catch (error) {
        dispatch(
          addNotification({
            message: 'Erro ao carregar receitas.',
            type: 'error',
            duration: 5000,
          }),
        );
        setReceitas([]);
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  // Função para recarregar forçadamente a lista (sem cache - para após exclusões)
  const handleForceRefreshList = useCallback(async () => {
    await loadRecipes({
      search: debouncedSearchTerm,
      category: selectedCategory || undefined,
      forceRefresh: true,
      showNotification: false,
    });
  }, [loadRecipes, debouncedSearchTerm, selectedCategory]);

  // Carregar dados iniciais
  useEffect(() => {
    // Carrega receitas iniciais
    loadRecipes();
    isInitialLoad.current = false;
  }, [loadRecipes]);

  // Carregar receitas quando filtros mudarem (exceto carregamento inicial)
  useEffect(() => {
    if (!isInitialLoad.current) {
      loadRecipes({
        search: debouncedSearchTerm,
        category: selectedCategory || undefined,
        showNotification: false,
      });
    }
  }, [debouncedSearchTerm, selectedCategory, loadRecipes]);

  // Efeito para detectar quando chegamos com estado de reload (após exclusão ou edição)
  useEffect(() => {
    const state = location.state as {
      reloadList?: boolean;
      deletedRecipeName?: string;
      editedRecipeName?: string;
    } | null;

    if (state?.reloadList) {
      // Força o reload da lista SEM cache
      handleForceRefreshList();

      // Mostra notificação sobre a operação realizada
      if (state.deletedRecipeName) {
        dispatch(
          addNotification({
            message: `Receita "${state.deletedRecipeName}" excluída com sucesso!`,
            type: 'success',
            duration: 4000,
          }),
        );
      } else if (state.editedRecipeName) {
        dispatch(
          addNotification({
            message: `Receita "${state.editedRecipeName}" atualizada com sucesso!`,
            type: 'success',
            duration: 4000,
          }),
        );
      }

      // Limpa o state para evitar reloads desnecessários
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch, handleForceRefreshList]);

  // Detectar mudanças na lista de receitas e resetar página se necessário
  useEffect(() => {
    const currentTotal = receitas.length;

    // Se houve mudança no total de receitas (criação/exclusão)
    // e não estamos na primeira página, reseta para página 1
    if (previousTotal.current !== currentTotal && currentPage !== 1) {
      setCurrentPage(1);
    }

    previousTotal.current = currentTotal;
  }, [receitas.length, currentPage]);

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearchTerm, sortOption]);

  // Handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleCategoryToggle = useCallback(
    (categoryName: string) => {
      // Se a categoria já está selecionada, desseleciona
      if (selectedCategory === categoryName) {
        setSelectedCategory('');
      } else {
        // Seleciona a nova categoria
        setSelectedCategory(categoryName);
      }
      setCurrentPage(1);
    },
    [selectedCategory],
  );

  const handleSortChange = useCallback((event: any) => {
    setSortOption(event.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRefreshList = useCallback(() => {
    loadRecipes({
      search: debouncedSearchTerm,
      category: selectedCategory || undefined,
      forceRefresh: true,
    });
  }, [loadRecipes, debouncedSearchTerm, selectedCategory]);

  // Modal handlers
  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Aguarda um pouco antes de recarregar para garantir que o modal fechou
    setTimeout(() => {
      loadRecipes({
        search: debouncedSearchTerm,
        category: selectedCategory || undefined,
        forceRefresh: false, // Não força refresh para não mostrar loading desnecessário
        showNotification: false,
      });
    }, 300);
  }, [loadRecipes, debouncedSearchTerm, selectedCategory]);

  const handleRecipeCreated = useCallback(() => {
    // Usar refresh forçado (sem cache) após criar uma nova receita
    // Isso garante que a nova receita aparecerá imediatamente na lista
    handleForceRefreshList();
  }, [handleForceRefreshList]);

  return {
    // Estados
    loading,
    receitas,
    searchInput,
    currentPage,
    selectedCategory,
    sortOption,
    totalPages,
    isModalOpen,
    debouncedSearchTerm,
    itemsPerPage,

    // Handlers
    handleSearchChange,
    handleCategoryToggle,
    handleSortChange,
    handlePageChange,
    handleRefreshList,
    handleForceRefreshList,
    handleOpenModal,
    handleCloseModal,
    handleRecipeCreated,
  };
};
