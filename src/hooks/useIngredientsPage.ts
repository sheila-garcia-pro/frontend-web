import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchCategoriesRequest } from '../store/slices/categoriesSlice';
import { getCachedIngredients, getIngredients } from '../services/api/ingredients';
import { clearCache } from '../services/api';
import { addNotification } from '../store/slices/uiSlice';
import { Ingredient } from '../types/ingredients';
import { useDebounce } from './useDebounce';

/**
 * Hook personalizado para gerenciar o estado da página de ingredientes
 * Centraliza toda a lógica de estado, filtros e paginação
 */
export const useIngredientsPage = () => {
  const dispatch = useDispatch();

  // Estados locais
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<'used' | 'all'>('all');
  const [sortOption, setSortOption] = useState('name_asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);

  // Estados para ingredientes (similar ao useRecipesPage)
  const [loading, setLoading] = useState(true);
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Refs para controle de sincronização
  const previousTotal = useRef(0);
  const isInitialLoad = useRef(true);

  // Redux state apenas para categorias
  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories,
  );

  // Aplicar debounce ao termo de busca
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // Constantes
  const itemsPerPage = 1000;

  // Função para carregar ingredientes com parâmetros otimizados (similar ao useRecipesPage)
  const loadIngredients = useCallback(
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
          clearCache('/v1/users/me/ingredient');

          response = await getIngredients({
            page: currentPage,
            itemPerPage: itemsPerPage,
            name: params.search,
            category: params.category,
          });
        } else {
          response = await getCachedIngredients({
            page: currentPage,
            itemPerPage: itemsPerPage,
            name: params.search,
            category: params.category,
          });
        }

        setIngredientsList(response.data);
        setTotalPages(Math.ceil(response.total / itemsPerPage));
        setTotalItems(response.total);

        if (params.showNotification !== false) {
          dispatch(
            addNotification({
              message: 'Ingredientes carregados com sucesso!',
              type: 'success',
              duration: 4000,
            }),
          );
        }
      } catch (error) {
        dispatch(
          addNotification({
            message: 'Erro ao carregar ingredientes.',
            type: 'error',
            duration: 5000,
          }),
        );
        setIngredientsList([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, dispatch],
  );

  // Carregar dados iniciais
  useEffect(() => {
    dispatch(
      fetchCategoriesRequest({
        page: 1,
        itemPerPage: 100,
      }),
    );

    // Carrega ingredientes iniciais
    loadIngredients();
    isInitialLoad.current = false;
  }, [dispatch, loadIngredients]);

  // Carregar ingredientes quando filtros mudarem (exceto carregamento inicial)
  useEffect(() => {
    if (!isInitialLoad.current) {
      loadIngredients({
        search: debouncedSearchTerm,
        category: selectedCategory || undefined,
        showNotification: false,
      });
    }
  }, [debouncedSearchTerm, selectedCategory, loadIngredients]);

  // Carregar ingredientes quando página mudar
  useEffect(() => {
    if (!isInitialLoad.current) {
      loadIngredients({
        search: debouncedSearchTerm,
        category: selectedCategory || undefined,
        showNotification: false,
      });
    }
  }, [currentPage, loadIngredients, debouncedSearchTerm, selectedCategory]);

  // Detectar mudanças na lista de ingredientes e resetar página se necessário
  useEffect(() => {
    const currentTotal = ingredientsList.length;

    // Se houve mudança no total de ingredientes (criação/exclusão)
    // e não estamos na primeira página, reseta para página 1
    if (previousTotal.current !== currentTotal && currentPage !== 1) {
      setCurrentPage(1);
    }

    previousTotal.current = currentTotal;
  }, [ingredientsList.length, currentPage]);

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearchTerm, currentTab, sortOption]);

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

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: 'used' | 'all') => {
    setCurrentTab(newValue);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((event: any) => {
    setSortOption(event.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRefreshList = useCallback(() => {
    loadIngredients({
      search: debouncedSearchTerm,
      category: selectedCategory || undefined,
      forceRefresh: true,
    });
  }, [loadIngredients, debouncedSearchTerm, selectedCategory]);

  // Modal handlers
  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    // Aguarda um pouco antes de recarregar para garantir que o modal fechou
    setTimeout(() => {
      loadIngredients({
        search: debouncedSearchTerm,
        category: selectedCategory || undefined,
        forceRefresh: false, // Não força refresh para não mostrar loading desnecessário
      });
    }, 300);
  }, [loadIngredients, debouncedSearchTerm, selectedCategory]);
  const handleOpenCategoryModal = useCallback(() => setCategoryModalOpen(true), []);
  const handleCloseCategoryModal = useCallback(() => setCategoryModalOpen(false), []);

  const handleViewDetails = useCallback((id: string) => {
    setSelectedIngredientId(id);
    setDetailsModalOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsModalOpen(false);
    setSelectedIngredientId(null);
  }, []);

  return {
    // Estados
    searchInput,
    currentPage,
    selectedCategory,
    currentTab,
    sortOption,
    modalOpen,
    categoryModalOpen,
    detailsModalOpen,
    selectedIngredientId,
    debouncedSearchTerm,
    itemsPerPage,

    // Dados dos ingredientes
    allIngredients: ingredientsList,
    ingredientsLoading: loading,
    categories,
    categoriesLoading,
    total: totalItems,
    totalPages,

    // Handlers
    handleSearchChange,
    handleCategoryToggle,
    handleTabChange,
    handleSortChange,
    handlePageChange,
    handleRefreshList,
    handleOpenModal,
    handleCloseModal,
    handleOpenCategoryModal,
    handleCloseCategoryModal,
    handleViewDetails,
    handleCloseDetails,
  };
};
