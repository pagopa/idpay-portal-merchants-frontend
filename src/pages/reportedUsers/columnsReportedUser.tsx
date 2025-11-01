import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

export function getReportedUsersColumns(handleDelete: (cf: string) => void) {
  return [
    {
      field: 'cf',
      headerName: 'Codice fiscale',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Typography>{params.value || MISSING_DATA_PLACEHOLDER}</Typography>
      ),
    },
    {
      field: 'reportedDate',
      headerName: 'Segnalato il',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Typography>{params.value || MISSING_DATA_PLACEHOLDER}</Typography>
      ),
    },
    {
      field: 'transactionId',
      headerName: 'ID transazione',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Typography>{params.value || MISSING_DATA_PLACEHOLDER}</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      flex: 0.3,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <DeleteIcon
          style={{ cursor: 'pointer', color: '#d32f2f' }}
          onClick={() => handleDelete(params.row.cf)}
          titleAccess="Elimina"
        />
      ),
    },
  ];
}
