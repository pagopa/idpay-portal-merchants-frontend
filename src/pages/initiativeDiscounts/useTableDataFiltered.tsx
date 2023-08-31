import { Dispatch, SetStateAction, useEffect } from 'react';

export const useTableDataFiltered = (
  id: string,
  page: number,
  filterByUser: string | undefined,
  filterByStatus: string | undefined,
  getTableData: (
    id: string,
    page: number,
    filterByUser: string | undefined,
    filterByStatus: string | undefined
  ) => void,
  setRows: Dispatch<SetStateAction<Array<any>>>
) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof id === 'string') {
      getTableData(id, page, filterByUser, filterByStatus);
    }
    return () => {
      setRows([]);
    };
  }, [id, page]);
};
