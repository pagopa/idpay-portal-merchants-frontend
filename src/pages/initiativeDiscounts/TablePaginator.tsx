import { TablePagination } from '@mui/material';
import { itIT } from '@mui/material/locale';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalElements: number;
  rowsPerPage: number;
}

const TablePaginator = ({ page, setPage, totalElements, rowsPerPage }: Props) => {
  const theme = createTheme(itIT);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  return (
    <ThemeProvider theme={theme}>
      <TablePagination
        sx={{
          '.MuiTablePagination-displayedRows': {
            fontFamily: '"Titillium Web",sans-serif',
          },
        }}
        component="div"
        onPageChange={handleChangePage}
        page={page}
        count={totalElements}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10]}
      />
    </ThemeProvider>
  );
};

export default TablePaginator;
