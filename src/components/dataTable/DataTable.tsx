import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState, useCallback } from 'react';
import { IconButton, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export interface DataTableProps {
  rows: any;
  columns: any;
  pageSize: number;
  rowsPerPage: number;
  handleRowAction: (row: any) => void; 
  onSortModelChange?: (model: any) => void;
  sortModel?: any;
  onPaginationPageChange?: (page: number) => void;
  paginationModel?: any;
  customId?: string;
}


const DataTable = ({ rows, columns, rowsPerPage, handleRowAction, onSortModelChange, sortModel, onPaginationPageChange, paginationModel }: DataTableProps) => {
  const [finalColumns, setFinalColumns] = useState(Array<any>);

  console.log("ROWS", rows);
  console.log("COLUMNS", columns);

  useEffect(() => {
    if (columns && columns.length > 0) {
      const processedColumns = columns.map((col: any) => ({
        ...col,
        renderCell: col.renderCell ? col.renderCell : renderEmptyCell
      }));

      setFinalColumns(
        [
          ...processedColumns,
          {
            field: 'actions',
            headerName: '',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            flex: 1,
            renderCell: (params: any) => (
              <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
                <IconButton
                  onClick={() => memoizedHandleRowAction(params.row)}
                  size="small"
                >
                  <ArrowForwardIosIcon color='primary' fontSize='small' />
                </IconButton>
              </Box>
            )
          }
        ]
      );
    }
  }, [columns]);

  const memoizedHandleRowAction = useCallback((row: any) => {
    handleRowAction(row);
  }, [handleRowAction]);

  const renderEmptyCell = (params: any) => {
    if (params.value === null || params.value === undefined || params.value === '') {
      return '-';
    }
    return params.value;
  };

  const handlePageChange = (page: number) => {
    onPaginationPageChange?.(page);
  };
  return (
    <>
      {
        rows?.length > 0 && columns?.length > 0 && (
          <DataGrid
            rows={rows}
            columns={finalColumns}
            rowsPerPageOptions={[rowsPerPage]}
            disableSelectionOnClick
            autoHeight
            sortingMode='server'
            paginationMode='server'
            onSortModelChange={(model) => {
              onSortModelChange?.(model);
            }}
            sortModel={sortModel}
            onPageChange={handlePageChange}
            page={paginationModel?.pageNo}
            pageSize={paginationModel?.pageSize}
            rowCount={paginationModel?.totalElements}
            localeText={{
              noRowsLabel: 'Nessun punto vendita da visualizzare.',
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row': {
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#FFFFFF',
                },
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none'
              },
              '& .MuiDataGrid-footerContainer': {
                border: 'none'
              }

            }}
          />
        )
      }
    </>

  );
};

export default DataTable;