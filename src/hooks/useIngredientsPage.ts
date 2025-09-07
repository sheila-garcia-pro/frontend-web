import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchIngredientsRequest } from '../store/slices/ingredientsSlice';
import { fetchCategoriesRequest } from '../store/slices/categoriesSlice';
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

  // Refs para controle de sincronização
  const previousTotal = useRef(0);
  const isInitialLoad = useRef(true);

  // Redux state
  const {
    items: allIngredients,
    loading: ingredientsLoading,
    total,
  } = useSelector((state: RootState) => state.ingredients);

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories,
  );

  // Aplicar debounce ao termo de busca
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // Constantes
  const itemsPerPage = 10;

  // Função para carregar ingredientes com parâmetros otimizados
  const loadIngredients = useCallback(
    (
      params: {
        search?: string;
        category?: string;
        forceRefresh?: boolean;
      } = {},
    ) => {
      dispatch(
        fetchIngredientsRequest({
          page: 1,
          itemPerPage: 1000, // Carrega muitos ingredientes para filtros frontend
          search: params.search,
          category: params.category,
          forceRefresh: params.forceRefresh,
        }),
      );
    },
    [dispatch],
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
      });
    }
  }, [debouncedSearchTerm, selectedCategory, loadIngredients]);

  // Detectar mudanças na lista de ingredientes e resetar página se necessário
  useEffect(() => {
    const currentTotal = allIngredients.length;

    // Se houve mudança no total de ingredientes (criação/exclusão)
    // e não estamos na primeira página, reseta para página 1
    if (previousTotal.current !== currentTotal && currentPage !== 1) {
      setCurrentPage(1);
    }

    previousTotal.current = currentTotal;
  }, [allIngredients.length, currentPage]);

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

    // Dados do Redux
    allIngredients,
    ingredientsLoading,
    categories,
    categoriesLoading,
    total,

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
