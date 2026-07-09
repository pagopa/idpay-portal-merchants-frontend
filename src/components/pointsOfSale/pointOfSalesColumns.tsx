import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { theme } from '@pagopa/mui-italia/theme';
import { GridColDef } from '@mui/x-data-grid';
import { PointOfSaleDTO } from '../../api/generated/merchants/data-contracts';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { formatStreetAddress } from '../../utils/addressUtils';

type BuildPointOfSalesColumnsArgs = {
  t: (key: string) => string;
  onActionClick: (store: PointOfSaleDTO) => void;
};

const infoStyles = {
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.fontSize,
};

const renderCellWithTooltip = (value: string, tooltipThreshold: number) => (
  <Tooltip title={value && value.length >= tooltipThreshold ? value : MISSING_DATA_PLACEHOLDER}>
    <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
      {value && value !== '' ? value : MISSING_DATA_PLACEHOLDER}
    </Typography>
  </Tooltip>
);

export const buildPointOfSalesColumns = ({
  t,
  onActionClick,
}: BuildPointOfSalesColumnsArgs): Array<GridColDef> => [
  {
    field: 'franchiseName',
    headerName: t('pages.initiativeStores.franchiseName'),
    flex: 1,
    editable: false,
    disableColumnMenu: true,
    renderCell: (params: any) => renderCellWithTooltip(params.value, 1),
  },
  {
    field: 'type',
    headerName: t('pages.initiativeStores.type'),
    flex: 0.8,
    editable: false,
    disableColumnMenu: true,
    renderCell: (params: any) =>
      renderCellWithTooltip(
        params.value === 'PHYSICAL'
          ? 'Fisico'
          : params.value === 'ONLINE'
          ? 'Online'
          : MISSING_DATA_PLACEHOLDER,
        1
      ),
  },
  {
    field: 'address',
    headerName: t('pages.initiativeStores.address'),
    flex: 1,
    editable: false,
    disableColumnMenu: true,
    renderCell: (params: any) =>
      renderCellWithTooltip(
        formatStreetAddress({ address: params.value, streetNumber: params.row?.streetNumber }),
        1
      ),
  },
  {
    field: 'website',
    headerName: t('pages.initiativeStores.addressURL'),
    flex: 1.2,
    editable: false,
    disableColumnMenu: true,
    renderCell: (params: any) => renderCellWithTooltip(params.value, 1),
  },
  {
    field: 'city',
    headerName: t('pages.initiativeStores.city'),
    flex: 1,
    editable: false,
    disableColumnMenu: true,
    renderCell: (params: any) => renderCellWithTooltip(params.value, 1),
  },
  {
    field: 'contactName',
    headerName: t('pages.initiativeStores.referent'),
    flex: 1.2,
    editable: false,
    disableColumnMenu: true,
    renderCell: (params: any) =>
      renderCellWithTooltip(
        `${params.row.contactName ? params.row.contactName : MISSING_DATA_PLACEHOLDER} ${
          params.row.contactSurname ? params.row.contactSurname : MISSING_DATA_PLACEHOLDER
        }`,
        1
      ),
  },
  {
    field: 'contactEmail',
    headerName: t('pages.initiativeStores.email'),
    flex: 1.5,
    editable: false,
    disableColumnMenu: true,
    renderCell: (params: any) => renderCellWithTooltip(params.value, 1),
  },
  {
    field: 'actions',
    headerName: '',
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    flex: 0.3,
    renderCell: (params: any) => (
      <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
        <IconButton onClick={() => onActionClick(params.row)} size="small">
          <ChevronRightIcon data-testid={params.row.id} color="primary" fontSize="inherit" />
        </IconButton>
      </Box>
    ),
  },
];

export default buildPointOfSalesColumns;
