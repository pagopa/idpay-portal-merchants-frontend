import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Typography, IconButton, Box } from '@mui/material';
import React from 'react';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { safeFormatDate } from '../../utils/formatUtils';

export function getReportedUsersColumns(handleDelete: (cf: string) => void) {
  return [
    {
      field: 'cf',
      headerName: 'Codice fiscale',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [show, setShow] = React.useState(false);
        const value = params.value || MISSING_DATA_PLACEHOLDER;

        const maskCF = (cf: string) => {
          if (!cf || cf === MISSING_DATA_PLACEHOLDER) {
            return cf;
          }
          return '*'.repeat(cf.length);
        };

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: 1, fontFamily: 'monospace' }}>
              {show ? value : maskCF(value)}
            </Typography>
            {value !== MISSING_DATA_PLACEHOLDER && (
              <IconButton
                size="small"
                aria-label={show ? 'Nascondi codice fiscale' : 'Mostra codice fiscale'}
                onMouseDown={() => setShow(true)}
                onMouseUp={() => setShow(false)}
                onMouseLeave={() => setShow(false)}
                tabIndex={-1}
                sx={{
                  width: 22,
                  height: 15,
                  position: 'relative',
                  left: '1px',
                  background: 'none',
                  opacity: 1,
                  p: 0,
                  borderRadius: '4px',
                  minWidth: 0,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { background: 'none' },
                }}
              >
                {show ? (
                  <VisibilityOffIcon fontSize="medium" color="primary" />
                ) : (
                  <VisibilityIcon fontSize="medium" color="primary" />
                )}
              </IconButton>
            )}
          </Box>
        );
      },
    },
    {
      field: 'reportedDate',
      headerName: 'Segnalato il',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => <Typography>{safeFormatDate(params.value)}</Typography>,
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
        <Box sx={{ ml: 1.25 }}>
          <DeleteOutlineIcon
            color="error"
            style={{ cursor: 'pointer' }}
            onClick={() => handleDelete(params.row.cf)}
            titleAccess="Elimina"
          />
        </Box>
      ),
    },
  ];
}
