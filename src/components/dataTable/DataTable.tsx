import { DataGrid, GridSortModel } from '@mui/x-data-grid';
import { useCallback } from 'react';

export interface DataTableProps {
  rows: any;
  columns: any;
  rowsPerPage: number;
  onSortModelChange?: (model: GridSortModel) => void;
  sortModel?: GridSortModel;
  onPaginationPageChange?: (page: number) => void;
  paginationModel?: any;
  checkable?: boolean;
  onRowSelectionChange?: (rows: Array<number>) => void;
  isRowSelectable?: (params: { row: any }) => boolean;
}

const DataTable = ({
  rows,
  columns,
  rowsPerPage,
  onSortModelChange,
  onPaginationPageChange,
  paginationModel,
  checkable,
  sortModel = [],
  onRowSelectionChange,
  isRowSelectable
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

  const handleRowSelectionChange = (rows: Array<any>) => {
    onRowSelectionChange?.(rows);
  };

  return (
    <>
      {rows?.length > 0 && columns?.length > 0 && (
        <DataGrid
          rows={rows}
          columns={columns}
          rowsPerPageOptions={[rowsPerPage]}
          checkboxSelection={checkable}
          isRowSelectable={isRowSelectable}
          onSelectionModelChange={handleRowSelectionChange}
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
          hideFooterSelectedRowCount={true}
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
