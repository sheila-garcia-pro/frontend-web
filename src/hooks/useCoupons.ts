import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
  fetchCouponsRequest,
  createCouponRequest,
  updateCouponRequest,
  deleteCouponRequest,
  fetchCouponByIdRequest,
  setSelectedCoupon,
  selectCoupons,
  selectCouponsLoading,
  selectCouponsError,
  selectSelectedCoupon,
  selectCouponsPagination,
} from '../store/slices/couponsSlice';
import {
  CouponSearchParams,
  CreateCouponParams,
  UpdateCouponParams,
  Coupon,
} from '../types/coupons';

/**
 * Hook customizado para gerenciar cupons
 * Fornece interface simplificada sobre Redux para operações CRUD
 */
export const useCoupons = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const coupons = useSelector(selectCoupons);
  const loading = useSelector(selectCouponsLoading);
  const error = useSelector(selectCouponsError);
  const selectedCoupon = useSelector(selectSelectedCoupon);
  const paginationData = useSelector(selectCouponsPagination);

  /**
   * Buscar cupons com filtros
   */
  const fetchCoupons = useCallback(
    (params: CouponSearchParams) => {
      dispatch(fetchCouponsRequest(params));
    },
    [dispatch],
  );

  /**
   * Criar um novo cupom
   */
  const createCoupon = useCallback(
    (data: CreateCouponParams) => {
      dispatch(createCouponRequest(data));
    },
    [dispatch],
  );

  /**
   * Atualizar um cupom existente
   */
  const updateCoupon = useCallback(
    (id: string, data: UpdateCouponParams) => {
      dispatch(updateCouponRequest({ id, params: data }));
    },
    [dispatch],
  );

  /**
   * Deletar um cupom
   */
  const deleteCoupon = useCallback(
    (id: string) => {
      dispatch(deleteCouponRequest(id));
    },
    [dispatch],
  );

  /**
   * Buscar cupom por ID
   */
  const fetchCouponById = useCallback(
    (id: string) => {
      dispatch(fetchCouponByIdRequest(id));
    },
    [dispatch],
  );

  /**
   * Selecionar cupom para visualização
   */
  const selectCoupon = useCallback(
    (coupon: Coupon | null) => {
      dispatch(setSelectedCoupon(coupon));
    },
    [dispatch],
  );

  /**
   * Obter cupons de um fornecedor específico (filtro em memória)
   * @param supplierId ID do fornecedor
   * @returns Array de cupons do fornecedor
   */
  const getCouponsBySupplier = useCallback(
    (supplierId: string): Coupon[] => {
      return coupons.filter((coupon) => {
        // Verifica se o cupom tem um supplier válido com _id
        if (coupon.supplier && '_id' in coupon.supplier) {
          return coupon.supplier._id === supplierId;
        }
        return false;
      });
    },
    [coupons],
  );

  /**
   * Verificar se um cupom tem fornecedor vinculado
   */
  const hasSupplier = useCallback((coupon: Coupon): boolean => {
    return (
      coupon.supplier &&
      Object.keys(coupon.supplier).length > 0 &&
      'name' in coupon.supplier &&
      !!coupon.supplier.name
    );
  }, []);

  /**
   * Contar cupons por fornecedor
   */
  const countCouponsBySupplier = useCallback(
    (supplierId: string): number => {
      return getCouponsBySupplier(supplierId).length;
    },
    [getCouponsBySupplier],
  );

  /**
   * Vincular cupom a um fornecedor
   * @param couponId ID do cupom
   * @param supplierId ID do fornecedor
   */
  const linkCouponToSupplier = useCallback(
    async (couponId: string, supplierId: string) => {
      dispatch(updateCouponRequest({ id: couponId, params: { supplierId } }));
    },
    [dispatch],
  );

  /**
   * Desvincular cupom de um fornecedor
   * @param couponId ID do cupom
   */
  const unlinkCouponFromSupplier = useCallback(
    async (couponId: string) => {
      dispatch(updateCouponRequest({ id: couponId, params: { supplierId: '' } }));
    },
    [dispatch],
  );

  // Dados derivados
  const totalCoupons = useMemo(() => paginationData.total, [paginationData.total]);
  const currentPage = useMemo(() => paginationData.currentPage, [paginationData.currentPage]);
  const totalPages = useMemo(() => paginationData.totalPages, [paginationData.totalPages]);

  return {
    // Estado
    coupons,
    loading,
    error,
    selectedCoupon,

    // Paginação
    paginationData,
    totalCoupons,
    currentPage,
    totalPages,

    // Ações
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    fetchCouponById,
    selectCoupon,

    // Utilidades
    getCouponsBySupplier,
    hasSupplier,
    countCouponsBySupplier,
    linkCouponToSupplier,
    unlinkCouponFromSupplier,
  };
};
