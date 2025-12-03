import { DataGrid, GridSortModel, GridColDef, GridSelectionModel } from '@mui/x-data-grid';
import { useCallback, useState } from 'react';

/**
 * Props for the DataTable component
 */
export interface DataTableProps {
  /** Array of data rows to be displayed in the table */
  rows: any;
  /** Array of column definitions for the table */
  columns: Array<GridColDef>;
  /** Number of rows to display per page */
  rowsPerPage: number; // This prop is used for rowsPerPageOptions
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
  /** If true, only one row can be selected at a time */
  singleSelect?: boolean;
  /** Callback function triggered when row selection changes */
  onRowSelectionChange?: (rows: Array<any>) => void;
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
  singleSelect, // Nuova prop
  sortModel = [],
  onRowSelectionChange,
  isRowSelectable
}: DataTableProps) => {
  // Stato per la selezione singola. Viene usato solo se checkable e singleSelect sono veri.
  const [singleSelectionModel, setSingleSelectionModel] = useState<GridSelectionModel>([]);

  const handlePageChange = (page: number) => {
    onPaginationPageChange?.(page);
  };

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      onSortModelChange?.(model);
    },
    [onSortModelChange]
  );

  const handleRowSelectionChange = (newSelectionModel: GridSelectionModel) => {
    let finalModel = newSelectionModel;

    if (checkable && singleSelect) {
      if (newSelectionModel.length > 0) {
        finalModel = [newSelectionModel[newSelectionModel.length - 1]];
      } else {
        finalModel = [];
      }

      setSingleSelectionModel(finalModel);
    }

    const modelToMap = checkable && singleSelect ? finalModel : newSelectionModel;
    const selectedRowObjects = rows.filter((row: any) => modelToMap.includes(row.id));

    onRowSelectionChange?.(selectedRowObjects);

  };

  const selectionProps = {
    checkboxSelection: checkable,
    isRowSelectable,
    selectionModel: singleSelect ? singleSelectionModel : undefined,
    onSelectionModelChange: handleRowSelectionChange,
  };


  return (
    <>
      {rows?.length > 0 && columns?.length > 0 && (
        <DataGrid
          rows={rows}
          columns={columns}
          rowsPerPageOptions={[rowsPerPage]}

          {...selectionProps}

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
            '& .MuiDataGrid-columnHeaderCheckbox': {
              '& span ': {
                display: 'none',
              },
            },
          }}
        />
      )}
    </>
  );
};

export default DataTable;