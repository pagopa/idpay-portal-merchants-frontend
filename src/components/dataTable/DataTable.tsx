import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { IconButton, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export interface DataTableProps {
  rows: any;
  columns: any;
  pageSize: number;
  rowsPerPage: number;
  handleRowAction: (row:any) => void;
}


const DataTable = ({rows,columns,pageSize,rowsPerPage,handleRowAction} : DataTableProps ) => {
  const [finalColumns, setFinalColumns] = useState(Array<any>);

  function onRowAction(row: any) {
    handleRowAction(row);
  }

  useEffect(() => {
    if (columns && columns.length > 0){
      const processedColumns = columns.map((col: any) => ({
          ...col,
          renderCell: renderEmptyCell 
        }));

      setFinalColumns(
        [
          ...processedColumns,
          {
            field : 'actions',
            headerName: '',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            flex: 1,
            renderCell : (params: any) => (
              <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
                <IconButton
                  onClick={() => onRowAction(params.row)}
                  size="small"
                  sx={{ opacity: 0.6,
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <ArrowForwardIosIcon/>
                </IconButton>
              </Box>
            )
          }
        ]
      );
    }
  }, [columns]); 

  const renderEmptyCell = (params: any) => {
    if (params.value === null || params.value === undefined || params.value === '') {
      return '-';
    }
    return params.value;
  };
  return (
    <DataGrid
      rows={rows}
      columns={finalColumns}
      pageSize={pageSize}
      rowsPerPageOptions={[rowsPerPage]}
      disableSelectionOnClick
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
        },    
    
      }}
    />

  );
};

export default DataTable;