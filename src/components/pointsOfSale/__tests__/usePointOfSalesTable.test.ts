import { act, renderHook } from '@testing-library/react-hooks';
import usePointOfSalesTable from '../usePointOfSalesTable';

describe('usePointOfSalesTable', () => {
  const initialValues = {
    merchantName: 'merchant',
  } as any;

  const fetchResponse = {
    content: [{ id: '1', businessName: 'Store 1' }] as any,
    pageNo: 0,
    pageSize: 10,
    totalElements: 1,
  };

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('loads data on mount with default pagination', async () => {
    const fetchStores = jest.fn().mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
      })
    );

    await waitForNextUpdate();

    expect(fetchStores).toHaveBeenCalledWith({
      ...initialValues,
      sort: 'asc',
      page: 0,
      size: 10,
    });
    expect(result.current.stores).toEqual(fetchResponse.content);
    expect(result.current.storesPagination).toEqual({
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
    });
    expect(result.current.storesLoading).toBe(false);
    expect(onFetchError).not.toHaveBeenCalled();
  });

  test('does not fetch when disabled', () => {
    const fetchStores = jest.fn();
    const onFetchError = jest.fn();

    const { result } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        enabled: false,
      })
    );

    expect(fetchStores).not.toHaveBeenCalled();
    expect(result.current.stores).toEqual([]);
    expect(result.current.storesLoading).toBe(false);
  });

  test('persists and restores pagination with sort model from storage', async () => {
    sessionStorage.setItem(
      'pos-table',
      JSON.stringify({
        pageNo: 2,
        pageSize: 20,
        totalElements: 200,
        sort: 'businessName,desc',
      })
    );

    const fetchStores = jest.fn().mockResolvedValue({
      ...fetchResponse,
      pageNo: 2,
      pageSize: 20,
      totalElements: 200,
    });
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        storageKey: 'pos-table',
      })
    );

    await waitForNextUpdate();

    expect(result.current.currentSort).toBe('asc');
    expect(result.current.sortModel).toEqual([]);
    expect(fetchStores).toHaveBeenCalledWith({
      ...initialValues,
      sort: 'asc',
      page: 0,
      size: 10,
    });
  });

  test('ignores stored pagination when storage context does not match', async () => {
    sessionStorage.setItem(
      'pos-table',
      JSON.stringify({
        pageNo: 3,
        pageSize: 25,
        totalElements: 100,
        sort: 'businessName,desc',
        initiativeId: 'other-id',
      })
    );

    const fetchStores = jest.fn().mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        storageKey: 'pos-table',
        storageContextField: 'initiativeId',
        storageContextValue: 'current-id',
      })
    );

    await waitForNextUpdate();

    expect(result.current.rowsPerPage).toBe(10);
    expect(result.current.currentSort).toBe('asc');
    expect(result.current.sortModel).toEqual([]);
    expect(fetchStores).toHaveBeenCalledWith({
      ...initialValues,
      sort: 'asc',
      page: 0,
      size: 10,
    });
  });

  test('restores stored pagination without sort and keeps default sort state', async () => {
    sessionStorage.setItem(
      'pos-table',
      JSON.stringify({
        pageNo: 1,
        pageSize: 15,
        totalElements: 50,
      })
    );

    const fetchStores = jest.fn().mockResolvedValue({
      ...fetchResponse,
      pageNo: 1,
      pageSize: 15,
      totalElements: 50,
    });
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        storageKey: 'pos-table',
      })
    );

    await waitForNextUpdate();

    expect(result.current.currentSort).toBe('asc');
    expect(result.current.sortModel).toEqual([]);
    expect(fetchStores).toHaveBeenCalledWith({
      ...initialValues,
      sort: 'asc',
      page: 0,
      size: 10,
    });
  });

  test('handles stored sort with invalid format by keeping default sort model', async () => {
    sessionStorage.setItem(
      'pos-table',
      JSON.stringify({
        pageNo: 1,
        pageSize: 15,
        totalElements: 50,
        sort: 'invalid-sort-format',
      })
    );

    const fetchStores = jest.fn().mockResolvedValue({
      ...fetchResponse,
      pageNo: 1,
      pageSize: 15,
      totalElements: 50,
    });
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        storageKey: 'pos-table',
      })
    );

    await waitForNextUpdate();

    expect(result.current.currentSort).toBe('asc');
    expect(result.current.sortModel).toEqual([]);
  });

  test('handles filters applied and resets pagination page', async () => {
    const fetchStores = jest.fn().mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
      })
    );

    await waitForNextUpdate();

    act(() => {
      result.current.handleFiltersApplied({
        merchantName: 'updated merchant',
      } as any);
    });

    await waitForNextUpdate();

    expect(result.current.filtersAppliedOnce).toBe(true);
    expect(result.current.appliedFilters).toEqual({
      merchantName: 'updated merchant',
      page: 0,
      size: 10,
    });
    expect(result.current.storesPagination.pageNo).toBe(0);
    expect(fetchStores).toHaveBeenLastCalledWith({
      merchantName: 'updated merchant',
      page: 0,
      size: 10,
      sort: 'asc',
    });
  });

  test('handles filters reset using initial values', async () => {
    const fetchStores = jest.fn().mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
      })
    );

    await waitForNextUpdate();

    act(() => {
      result.current.handleFiltersApplied({
        merchantName: 'updated merchant',
      } as any);
    });

    await waitForNextUpdate();

    act(() => {
      result.current.handleFiltersReset();
    });

    await waitForNextUpdate();

    expect(result.current.filtersAppliedOnce).toBe(false);
    expect(result.current.appliedFilters).toEqual({
      ...initialValues,
      page: 0,
      size: 10,
    });
    expect(result.current.storesPagination.pageNo).toBe(0);
  });

  test('handles sort model change and maps referent field to contactName', async () => {
    const fetchStores = jest.fn().mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        storageKey: 'pos-table',
      })
    );

    await waitForNextUpdate();

    act(() => {
      result.current.handleSortModelChange([{ field: 'referent', sort: 'desc' } as any]);
    });

    await waitForNextUpdate();

    expect(result.current.currentSort).toBe('contactName,desc');
    expect(result.current.sortModel).toEqual([{ field: 'referent', sort: 'desc' }]);
    expect(JSON.parse(sessionStorage.getItem('pos-table') as string)).toMatchObject({
      pageNo: 0,
      pageSize: 10,
      sort: 'contactName,desc',
    });
    expect(fetchStores).toHaveBeenLastCalledWith({
      ...initialValues,
      sort: 'contactName,desc',
      page: 0,
      size: 10,
    });
  });

  test('clears sort model when empty sort model is provided', async () => {
    const fetchStores = jest.fn().mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
      })
    );

    await waitForNextUpdate();

    act(() => {
      result.current.handleSortModelChange([{ field: 'businessName', sort: 'asc' } as any]);
    });

    await waitForNextUpdate();

    act(() => {
      result.current.handleSortModelChange([]);
    });

    await waitForNextUpdate();

    expect(result.current.currentSort).toBe('asc');
    expect(result.current.sortModel).toEqual([]);
  });

  test('handles page change and persists pagination', async () => {
    const fetchStores = jest.fn().mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        storageKey: 'pos-table',
      })
    );

    await waitForNextUpdate();

    act(() => {
      result.current.handlePaginationPageChange(4);
    });

    await waitForNextUpdate();

    expect(result.current.storesPagination.pageNo).toBe(4);
    expect(JSON.parse(sessionStorage.getItem('pos-table') as string)).toMatchObject({
      pageNo: 4,
      pageSize: 10,
      sort: 'asc',
    });
    expect(fetchStores).toHaveBeenLastCalledWith({
      ...initialValues,
      sort: 'asc',
      page: 4,
      size: 10,
    });
  });

  test('handles rows per page change and persists pagination', async () => {
    const fetchStores = jest.fn().mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        storageKey: 'pos-table',
      })
    );

    await waitForNextUpdate();

    act(() => {
      result.current.handleRowsPerPageChange(25);
    });

    await waitForNextUpdate();

    expect(result.current.rowsPerPage).toBe(25);
    expect(result.current.appliedFilters).toEqual({
      ...initialValues,
      page: 0,
      size: 25,
    });
    expect(result.current.storesPagination).toEqual({
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
    });
    expect(JSON.parse(sessionStorage.getItem('pos-table') as string)).toMatchObject({
      pageNo: 0,
      pageSize: 25,
      sort: 'asc',
    });
    expect(fetchStores).toHaveBeenLastCalledWith({
      ...initialValues,
      sort: 'asc',
      page: 0,
      size: 25,
    });
  });

  test('calls onFetchError when fetch fails', async () => {
    const fetchStores = jest.fn().mockRejectedValue(new Error('failure'));
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
      })
    );

    await waitForNextUpdate();

    expect(onFetchError).toHaveBeenCalledTimes(1);
    expect(result.current.storesLoading).toBe(false);
    expect(result.current.stores).toEqual([]);
  });

  test('suppresses loading state during sort when configured', async () => {
    let sortResolve: ((value: typeof fetchResponse) => void) | undefined;
    const fetchStores = jest
      .fn()
      .mockResolvedValueOnce(fetchResponse)
      .mockImplementationOnce(
        () =>
          new Promise<typeof fetchResponse>((resolve) => {
            sortResolve = resolve;
          })
      );
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        suppressLoadingOnSort: true,
      })
    );

    await waitForNextUpdate();

    act(() => {
      result.current.handleSortModelChange([{ field: 'businessName', sort: 'desc' } as any]);
    });

    expect(result.current.currentSort).toBe('businessName,desc');
    expect(result.current.storesLoading).toBe(true);

    await act(async () => {
      sortResolve?.(fetchResponse);
      await waitForNextUpdate();
    });

    expect(result.current.storesLoading).toBe(false);
  });

  test('ignores stale successful responses from previous requests', async () => {
    let firstResolve: ((value: typeof fetchResponse) => void) | undefined;
    let secondResolve: ((value: typeof fetchResponse) => void) | undefined;

    const fetchStores = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<typeof fetchResponse>((resolve) => {
            firstResolve = resolve;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise<typeof fetchResponse>((resolve) => {
            secondResolve = resolve;
          })
      );
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
      })
    );

    act(() => {
      result.current.handlePaginationPageChange(1);
    });

    await act(async () => {
      firstResolve?.({
        content: [{ id: 'stale', businessName: 'Stale store' }] as any,
        pageNo: 0,
        pageSize: 10,
        totalElements: 1,
      });
      await Promise.resolve();
    });

    expect(result.current.stores).toEqual([]);

    await act(async () => {
      secondResolve?.({
        content: [{ id: 'fresh', businessName: 'Fresh store' }] as any,
        pageNo: 1,
        pageSize: 10,
        totalElements: 1,
      });
      await waitForNextUpdate();
    });

    expect(result.current.stores).toEqual([{ id: 'fresh', businessName: 'Fresh store' }]);
    expect(result.current.storesPagination.pageNo).toBe(1);
    expect(onFetchError).not.toHaveBeenCalled();
  });

  test('ignores stale rejected responses from previous requests', async () => {
    let firstReject: ((reason?: unknown) => void) | undefined;
    let secondResolve: ((value: typeof fetchResponse) => void) | undefined;

    const fetchStores = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<typeof fetchResponse>((_resolve, reject) => {
            firstReject = reject;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise<typeof fetchResponse>((resolve) => {
            secondResolve = resolve;
          })
      );
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
      })
    );

    act(() => {
      result.current.handlePaginationPageChange(1);
    });

    await act(async () => {
      firstReject?.(new Error('stale failure'));
      await Promise.resolve();
    });

    expect(onFetchError).not.toHaveBeenCalled();

    await act(async () => {
      secondResolve?.({
        content: [{ id: 'fresh', businessName: 'Fresh store' }] as any,
        pageNo: 1,
        pageSize: 10,
        totalElements: 1,
      });
      await waitForNextUpdate();
    });

    expect(result.current.stores).toEqual([{ id: 'fresh', businessName: 'Fresh store' }]);
    expect(result.current.storesPagination.pageNo).toBe(1);
    expect(onFetchError).not.toHaveBeenCalled();
  });

  test('removes storage on unmount by default and preserves it when configured not to', async () => {
    sessionStorage.setItem('pos-table', JSON.stringify({ pageNo: 1, pageSize: 10, totalElements: 0 }));

    const fetchStores = jest.fn().mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const firstHook = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        storageKey: 'pos-table',
      })
    );

    await firstHook.waitForNextUpdate();
    firstHook.unmount();

    expect(sessionStorage.getItem('pos-table')).toBeNull();

    sessionStorage.setItem('pos-table', JSON.stringify({ pageNo: 1, pageSize: 10, totalElements: 0 }));

    const secondHook = renderHook(() =>
      usePointOfSalesTable({
        initialValues,
        initialPageSize: 10,
        fetchStores,
        onFetchError,
        storageKey: 'pos-table',
        resetStorageOnUnmount: false,
      })
    );

    await secondHook.waitForNextUpdate();
    secondHook.unmount();

    expect(sessionStorage.getItem('pos-table')).not.toBeNull();
  });

  test('resets state when reset dependency changes', async () => {
    const fetchStores = jest
      .fn()
      .mockResolvedValue(fetchResponse);
    const onFetchError = jest.fn();

    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ resetToken }) =>
        usePointOfSalesTable({
          initialValues,
          initialPageSize: 10,
          fetchStores,
          onFetchError,
          resetDependencies: [resetToken],
        }),
      {
        initialProps: { resetToken: 'first' },
      }
    );

    await waitForNextUpdate();

    act(() => {
      result.current.handleRowsPerPageChange(30);
    });

    await waitForNextUpdate();

    expect(result.current.rowsPerPage).toBe(30);

    rerender({ resetToken: 'second' });

    await waitForNextUpdate();

    expect(result.current.rowsPerPage).toBe(10);
    expect(result.current.currentSort).toBe('asc');
    expect(result.current.sortModel).toEqual([]);
    expect(result.current.filtersAppliedOnce).toBe(false);
    expect(result.current.appliedFilters).toEqual(initialValues);
    expect(result.current.storesPagination).toEqual({
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
    });
  });
});
