import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
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
      setFinalColumns(
        [...columns,{field : 'actions',headerName: '', sortable: false, filterable: false,
          renderCell : (params: any) => {
            <IconButton
              onClick={() => onRowAction(params.row)}
              size="small"
              sx={{ opacity: 0.6,
                '&:hover': { opacity: 1 } }}
            >
              {<ArrowForwardIosIcon/>}
            </IconButton>;}
        }]
      );
    }
  }, [columns]);
  return (
    <DataGrid
      rows={rows}
      columns={finalColumns}
      pageSize={pageSize}
      rowsPerPageOptions={[rowsPerPage]}
      disableSelectionOnClick
      sx={{
        '& .MuiDataGrid-row': {
          backgroundColor: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#FFFFFF',
          },
        },
      }}
    />

  );
};

export default DataTable;