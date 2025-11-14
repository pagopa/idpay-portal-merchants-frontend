import { DataGrid,GridSortModel } from '@mui/x-data-grid';
import { useEffect, useState, useCallback } from 'react';
import { theme } from '@pagopa/mui-italia';
import {MISSING_DATA_PLACEHOLDER} from '../../utils/constants';

export interface DataTableProps {
  rows: any;
  columns: any;
  pageSize: number;
  rowsPerPage: number;
  handleRowAction: (row: any) => void; 
  onSortModelChange?: (model: any) => void;
  sortModel: GridSortModel;
  onPaginationPageChange?: (page: number) => void;
  paginationModel?: any;
}


const TransactionDataTable = ({ rows, columns, rowsPerPage, onSortModelChange, onPaginationPageChange, paginationModel, sortModel }: DataTableProps) => {
  const [finalColumns, setFinalColumns] = useState(Array<any>);
  const [localSortModel, setLocalSortModel] = useState<GridSortModel>([]);

  useEffect(() => {
    if (columns && columns.length > 0) {
      const processedColumns = columns.map((col: any) => ({
        ...col,
        renderCell: col.renderCell ? col.renderCell : renderEmptyCell
      }));

      setFinalColumns([...processedColumns]);
    }
  }, [columns]);

 useEffect(() => {
    if (sortModel !== localSortModel) {
      setLocalSortModel(sortModel);
    }
  }, [sortModel]);

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
    if(model.length > 0){
      setLocalSortModel(model);
      onSortModelChange?.(model);
    } 
    else{
      setLocalSortModel((prevState: GridSortModel) => {
        const newSortModel: GridSortModel = prevState?.[0]?.sort === 'asc'
          ? [{field: prevState?.[0].field, sort: 'desc'}]
          : [{field: prevState?.[0].field, sort: 'asc'}];
        
        onSortModelChange?.(newSortModel);
        
        return newSortModel;
      });
    }
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
            sortModel={localSortModel} 
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
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                },
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none'
              },
              '& .MuiDataGrid-footerContainer': {
                border: 'none'
              }, 
               '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              }, 
               '& .MuiDataGrid-columnHeader:focus': {
                outline: 'none'
              },
               '& .MuiDataGrid-cell:focus-within': {
                outline: 'none'
              },  
              '& .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none'
              }
            }}
          />
        )
      }
    </>
  );
};

export default TransactionDataTable;