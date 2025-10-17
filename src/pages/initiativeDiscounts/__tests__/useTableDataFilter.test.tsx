import { act } from '@testing-library/react';

import { renderHook } from '@testing-library/react-hooks';
import { useTableDataFiltered } from '../useTableDataFiltered';

describe('useTableDataFiltered', () => {
  const mockGetTableData = jest.fn();
  const mockSetRows = jest.fn();
  const mockScrollTo = jest.fn();

  beforeAll(() => {
    window.scrollTo = mockScrollTo;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('dovrebbe chiamare getTableData e scrollTo al primo render', () => {
    const initialProps = {
      id: 'initiative-123',
      page: 0,
      filterByUser: undefined,
      filterByStatus: undefined,
    };

    renderHook(() =>
      useTableDataFiltered(
        initialProps.id,
        initialProps.page,
        initialProps.filterByUser,
        initialProps.filterByStatus,
        mockGetTableData,
        mockSetRows
      )
    );

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockGetTableData).toHaveBeenCalledTimes(1);
    expect(mockGetTableData).toHaveBeenCalledWith('initiative-123', 0, undefined, undefined);
    expect(mockSetRows).not.toHaveBeenCalled();
  });

  test('dovrebbe rieseguire l\'effetto quando la dipendenza "page" cambia', () => {
    const initialProps = { id: 'initiative-123', page: 0 };

    const { rerender } = renderHook(
      ({ page }) =>
        useTableDataFiltered(
          initialProps.id,
          page,
          undefined,
          undefined,
          mockGetTableData,
          mockSetRows
        ),
      { initialProps: { page: 0 } }
    );

    jest.clearAllMocks();

    rerender({ page: 1 });

    expect(mockSetRows).toHaveBeenCalledTimes(1);
    expect(mockSetRows).toHaveBeenCalledWith([]);

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockGetTableData).toHaveBeenCalledTimes(1);
    expect(mockGetTableData).toHaveBeenCalledWith('initiative-123', 1, undefined, undefined);
  });

  test("NON dovrebbe rieseguire l'effetto se cambiano solo i filtri", () => {
    const initialProps = { id: 'initiative-123', page: 0, filterByUser: 'user1' };

    const { rerender } = renderHook(
      (props) =>
        useTableDataFiltered(
          props.id,
          props.page,
          props.filterByUser,
          undefined,
          mockGetTableData,
          mockSetRows
        ),
      { initialProps }
    );

    jest.clearAllMocks();

    rerender({ ...initialProps, filterByUser: 'user2' });

    expect(mockSetRows).not.toHaveBeenCalled();
    expect(mockScrollTo).not.toHaveBeenCalled();
    expect(mockGetTableData).not.toHaveBeenCalled();
  });

  test('dovrebbe chiamare la funzione di pulizia (setRows) allo smontaggio del componente', () => {
    const { unmount } = renderHook(() =>
      useTableDataFiltered('initiative-123', 0, undefined, undefined, mockGetTableData, mockSetRows)
    );

    jest.clearAllMocks();

    unmount();

    expect(mockSetRows).toHaveBeenCalledTimes(1);
    expect(mockSetRows).toHaveBeenCalledWith([]);
    expect(mockScrollTo).not.toHaveBeenCalled();
    expect(mockGetTableData).not.toHaveBeenCalled();
  });

  test("NON dovrebbe chiamare getTableData se l'ID non è una stringa", () => {
    renderHook(() =>
      useTableDataFiltered(null as any, 0, undefined, undefined, mockGetTableData, mockSetRows)
    );

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);

    expect(mockGetTableData).not.toHaveBeenCalled();
  });
});
