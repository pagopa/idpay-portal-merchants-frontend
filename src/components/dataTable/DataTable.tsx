import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState, useCallback } from 'react';
import { IconButton, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { GridSortModel } from '@mui/x-data-grid';
import {MISSING_DATA_PLACEHOLDER} from '../../utils/constants';

export interface DataTableProps {
  rows: any;
  columns: any;
  pageSize: number;
  rowsPerPage: number;
  handleRowAction: (row: any) => void; 
  onSortModelChange?: (model: any) => void;
  sortModel?: GridSortModel;
  onPaginationPageChange?: (page: number) => void;
  paginationModel?: any;
  customId?: string;
}


const DataTable = ({ rows, columns, rowsPerPage, handleRowAction, onSortModelChange, onPaginationPageChange, paginationModel, sortModel }: DataTableProps) => {
  const [finalColumns, setFinalColumns] = useState(Array<any>);

  console.log("ROWS", rows);
  console.log("COLUMNS", columns);

  useEffect(() => {
    console.log("Sort model", sortModel);
    
  }, [sortModel]);

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
      return MISSING_DATA_PLACEHOLDER;
    }
    return params.value;
  };

  const handlePageChange = (page: number) => {
    onPaginationPageChange?.(page);
  };

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    console.log("Sort model changed:", model);
    onSortModelChange?.(model); // Chiama la callback del parent
  }, [onSortModelChange]);

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
              }
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