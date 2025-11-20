import { DataGrid, GridSortModel, GridColDef } from '@mui/x-data-grid';
import { useCallback } from 'react';

/**
 * Props for the DataTable component
 */
export interface DataTableProps {
  /** Array of data rows to be displayed in the table */
  rows: any;
  /** Array of column definitions for the table */
  columns: Array<GridColDef>;
  /** Number of rows to display per page */
  rowsPerPage: number;
  /** Callback function triggered when sorting changes */
  onSortModelChange?: (model: GridSortModel) => void;
  /** Current sort model configuration */
  sortModel?: GridSortModel;
  /** Callback function triggered when page changes */
  onPaginationPageChange?: (page: number) => void;
  /** Current pagination model configuration */
  paginationModel?: any;
  /** Whether rows are selectable with checkboxes */
  checkable?: boolean;
  /** Callback function triggered when row selection changes */
  onRowSelectionChange?: (rows: Array<number>) => void;
  /** Function to determine if a row is selectable */
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
