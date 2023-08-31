import { Dispatch, SetStateAction, useMemo } from 'react';

export const useMemoInitTableData = (
  id: string,
  setPage: Dispatch<SetStateAction<number>>,
  setFilterByUser: Dispatch<SetStateAction<string | undefined>>,
  setFilterByStatus: Dispatch<SetStateAction<string | undefined>>
) => {
  useMemo(() => {
    setPage(0);
    setFilterByUser(undefined);
    setFilterByStatus(undefined);
  }, [id]);
};
