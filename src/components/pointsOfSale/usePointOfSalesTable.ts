import { useCallback, useEffect, useRef, useState } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { GetPointOfSalesFilters } from '../../types/types';
import { PointOfSaleDTO } from '../../api/generated/merchants/data-contracts';

type PointOfSalesPagination = {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  sort?: string;
  [key: string]: unknown;
};

type FetchPointOfSalesResult = {
  content: Array<PointOfSaleDTO>;
  pageNo: number;
  pageSize: number;
  totalElements: number;
};

type UsePointOfSalesTableArgs = {
  initialValues: GetPointOfSalesFilters;
  initialPageSize: number;
  fetchStores: (filters: GetPointOfSalesFilters) => Promise<FetchPointOfSalesResult>;
  storageKey?: string;
  storageContextValue?: string;
  storageContextField?: string;
  resetStorageOnUnmount?: boolean;
  suppressLoadingOnSort?: boolean;
  onFetchError: () => void;
  resetDependencies?: Array<unknown>;
  enabled?: boolean;
};

const defaultPagination = (pageSize: number): PointOfSalesPagination => ({
  pageNo: 0,
  pageSize,
  totalElements: 0,
});

const getSortModelFromSortKey = (sort?: string): GridSortModel => {
  if (!sort) {
    return [];
  }

  const sortParts = sort.split(',');
  if (sortParts.length !== 2) {
    return [];
  }

  const [field, order] = sortParts;
  return [{ field, sort: order as 'asc' | 'desc' }];
};

const usePointOfSalesTable = ({
  initialValues,
  initialPageSize,
  fetchStores,
  storageKey,
  storageContextValue,
  storageContextField,
  resetStorageOnUnmount = true,
  suppressLoadingOnSort = false,
  onFetchError,
  resetDependencies = [],
  enabled = true,
}: UsePointOfSalesTableArgs) => {
  const [stores, setStores] = useState<Array<PointOfSaleDTO>>([]);
  const [storesPagination, setStoresPagination] = useState<PointOfSalesPagination>(
    defaultPagination(initialPageSize)
  );
  const [storesLoading, setStoresLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize);
  const [currentSort, setCurrentSort] = useState<string>('asc');
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filtersAppliedOnce, setFiltersAppliedOnce] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<GetPointOfSalesFilters>(initialValues);

  const requestIdRef = useRef(0);

  const persistPagination = useCallback(
    (pagination: PointOfSalesPagination) => {
      if (!storageKey) {
        return;
      }

      const payload =
        storageContextField && storageContextValue
          ? {
              ...pagination,
              [storageContextField]: storageContextValue,
            }
          : pagination;

      sessionStorage.setItem(storageKey, JSON.stringify(payload));
    },
    [storageKey, storageContextField, storageContextValue]
  );

  const loadStoredPagination = useCallback(() => {
    if (!storageKey) {
      return;
    }

    const storedPagination = sessionStorage.getItem(storageKey);
    if (!storedPagination) {
      return;
    }

    const parsed = JSON.parse(storedPagination);

    if (
      storageContextField &&
      storageContextValue &&
      parsed?.[storageContextField] !== storageContextValue
    ) {
      setStoresPagination(defaultPagination(initialPageSize));
      setRowsPerPage(initialPageSize);
      setCurrentSort('asc');
      setSortModel([]);
      return;
    }

    if (parsed?.pageNo !== undefined) {
      setStoresPagination(parsed);
      setRowsPerPage(parsed.pageSize ?? initialPageSize);

      if (parsed.sort) {
        setCurrentSort(parsed.sort);
        setSortModel(getSortModelFromSortKey(parsed.sort));
      }
    }
  }, [storageKey, storageContextField, storageContextValue, initialPageSize]);

  useEffect(() => {
    loadStoredPagination();

    return () => {
      if (storageKey && resetStorageOnUnmount) {
        sessionStorage.removeItem(storageKey);
      }
    };
  }, [loadStoredPagination, storageKey, resetStorageOnUnmount]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setAppliedFilters(initialValues);
    setFiltersAppliedOnce(false);
    setCurrentSort('asc');
    setSortModel([]);
    setStoresPagination(defaultPagination(initialPageSize));
    setRowsPerPage(initialPageSize);
  }, [enabled, initialPageSize, ...resetDependencies]);

  const runFetch = useCallback(
    async (filters: GetPointOfSalesFilters, fromSort?: boolean) => {
      if (!enabled) {
        return;
      }

      const currentRequestId = requestIdRef.current + 1;
      // eslint-disable-next-line functional/immutable-data
      requestIdRef.current = currentRequestId;

      try {
        if (!fromSort || !suppressLoadingOnSort) {
          setStoresLoading(true);
        }

        const response = await fetchStores(filters);

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const { content, ...paginationData } = response;
        setStores(content);
        setStoresPagination({
          ...paginationData,
          pageNo: filters.page ?? 0,
        });

        if (!fromSort || !suppressLoadingOnSort) {
          setStoresLoading(false);
        }
      } catch (_error) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (!fromSort || !suppressLoadingOnSort) {
          setStoresLoading(false);
        }

        onFetchError();
      }
    },
    [enabled, fetchStores, onFetchError, suppressLoadingOnSort]
  );

  const handleFiltersApplied = useCallback(
    (values: GetPointOfSalesFilters) => {
      const updatedFilters = {
        ...values,
        page: 0,
        size: rowsPerPage,
      };

      setAppliedFilters(updatedFilters);
      setFiltersAppliedOnce(true);
      setStoresPagination((prev) => ({
        ...prev,
        pageNo: 0,
      }));
    },
    [rowsPerPage]
  );

  const handleFiltersReset = useCallback(() => {
    const resetFilters = {
      ...initialValues,
      page: 0,
      size: rowsPerPage,
    };

    setFiltersAppliedOnce(false);
    setAppliedFilters(resetFilters);
    setStoresPagination((prev) => ({
      ...prev,
      pageNo: 0,
    }));
  }, [initialValues, rowsPerPage]);

  const handleSortModelChange = useCallback(
    (newSortModel: GridSortModel) => {
      if (newSortModel.length > 0) {
        const { field, sort } = newSortModel[0];
        const sortKey = field === 'referent' ? `contactName,${sort}` : `${field},${sort}`;
        setCurrentSort(sortKey);
        setSortModel(newSortModel);

        const updatedPagination = {
          ...storesPagination,
          sort: sortKey,
          pageSize: rowsPerPage,
        };
        setStoresPagination(updatedPagination);
        persistPagination(updatedPagination);
      } else {
        setCurrentSort('asc');
        setSortModel([]);
      }
    },
    [persistPagination, rowsPerPage, storesPagination]
  );

  const handlePaginationPageChange = useCallback(
    (page: number) => {
      const updatedPagination = {
        ...storesPagination,
        pageNo: page,
        sort: currentSort,
      };
      setStoresPagination(updatedPagination);
      persistPagination(updatedPagination);
    },
    [currentSort, persistPagination, storesPagination]
  );

  const handleRowsPerPageChange = useCallback(
    (pageSize: number) => {
      setRowsPerPage(pageSize);

      const updatedFilters = {
        ...appliedFilters,
        page: 0,
        size: pageSize,
      };

      const updatedPagination = {
        ...storesPagination,
        pageNo: 0,
        pageSize,
        sort: currentSort,
      };

      setAppliedFilters(updatedFilters);
      setStoresPagination(updatedPagination);
      persistPagination(updatedPagination);
    },
    [appliedFilters, currentSort, persistPagination, storesPagination]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void runFetch({
      ...appliedFilters,
      sort: currentSort,
      page: storesPagination.pageNo,
      size: rowsPerPage,
    });
  }, [enabled, appliedFilters, currentSort, rowsPerPage, runFetch, storesPagination.pageNo]);

  return {
    stores,
    storesPagination,
    storesLoading,
    rowsPerPage,
    currentSort,
    sortModel,
    filtersAppliedOnce,
    appliedFilters,
    setFiltersAppliedOnce,
    setAppliedFilters,
    setStoresPagination,
    formPagination: storesPagination,
    handleFiltersApplied,
    handleFiltersReset,
    handleSortModelChange,
    handlePaginationPageChange,
    handleRowsPerPageChange,
  };
};

export default usePointOfSalesTable;
