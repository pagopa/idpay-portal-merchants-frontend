import { DataGrid, GridSortModel } from '@mui/x-data-grid';
import { useCallback } from 'react';

export interface DataTableProps {
  rows: any;
  columns: any;
  pageSize: number;
  rowsPerPage: number;
  onSortModelChange?: (model: GridSortModel) => void;
  sortModel?: GridSortModel;
  onPaginationPageChange?: (page: number) => void;
  paginationModel?: any;
}

const DataTable = ({
  rows,
  columns,
  rowsPerPage,
  onSortModelChange,
  onPaginationPageChange,
  paginationModel,
  sortModel = [],
}: DataTableProps) => {
  const handlePageChange = (page: number) => {
    onPaginationPageChange?.(page);
  };

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      if (model.length > 0) {
        onSortModelChange?.(model);
      }
    },
    [sortModel]
  );

  return (
    <>
      {rows?.length > 0 && columns?.length > 0 && (
        <DataGrid
          rows={rows}
          columns={columns}
          rowsPerPageOptions={[rowsPerPage]}
          disableSelectionOnClick
          autoHeight
          sortingOrder={['asc', 'desc']}
          sortingMode="server"
          paginationMode="server"
          onSortModelChange={handleSortModelChange}
          sortModel={sortModel}
          onPageChange={handlePageChange}
          page={paginationModel?.pageNo}
          pageSize={paginationModel?.pageSize}
          rowCount={paginationModel?.totalElements}
          localeText={{
            noRowsLabel: 'Nessun punto vendita da visualizzare.',
            MuiTablePagination: {
              labelDisplayedRows(paginationInfo) {
                return `${paginationInfo.from}-${paginationInfo.to} di ${paginationInfo.count}`;
              },
            },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '14px',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#FFFFFF',
              },
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              border: 'none',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
          }}
        />
      )}
    </>
  );
};

export default DataTable;
