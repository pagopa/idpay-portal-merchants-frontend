import React, { useState, useEffect } from 'react';
import { theme } from '@pagopa/mui-italia';
import {
  Box,
  Button,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Typography,
  Link,
  Alert,
  Slide,
  Tooltip,
  IconButton,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import StoreIcon from '@mui/icons-material/Store';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { CheckCircleOutline } from '@mui/icons-material';
import DataTable from '../../components/dataTable/DataTable';
import FiltersForm from '../initiativeDiscounts/FiltersForm';
import { GetPointOfSalesFilters } from '../../types/types';
import { PointOfSaleDTO } from '../../api/generated/merchants/PointOfSaleDTO';
import { parseJwt } from '../../utils/jwt-utils';
import { getMerchantPointOfSales } from '../../services/merchantService';
import { BASE_ROUTE } from '../../routes';
import { MISSING_DATA_PLACEHOLDER, PAGINATION_SIZE } from '../../utils/constants';

const initialValues: GetPointOfSalesFilters = {
  type: undefined,
  city: '',
  address: '',
  contactName: '',
  page: 0,
  size: PAGINATION_SIZE,
  sort: 'asc',
};
interface RouteParams {
  id: string;
}

const InitiativeStores: React.FC = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [stores, setStores] = useState<Array<PointOfSaleDTO>>([]);
  const [storesPagination, setStoresPagination] = useState<any>({});
  const [storesLoading, setStoresLoading] = useState(false);
  const [currentSort, setCurrentSort] = useState<string>('asc');
  const [filtersAppliedOnce, setFiltersAppliedOnce] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<RouteParams>();

  const location = useLocation<{ showSuccessAlert?: boolean }>();
  useEffect(() => {
    if (location.state?.showSuccessAlert) {
      setShowSuccessAlert(true);
    }
    setTimeout(() => setShowSuccessAlert(false), 3000);
  }, [location.state]);

  const addError = useErrorDispatcher();
  const infoStyles = {
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.fontSize,
  };

  const renderCellWithTooltip = (value: string, tooltipThreshold: number) => (
    <Tooltip
      title={value && value.length >= tooltipThreshold ? value : ''}
      placement="top"
      arrow={true}
    >
      <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
        {value && value !== '' ? value : '-'}
      </Typography>
    </Tooltip>
  );

  const columns: Array<GridColDef> = [
    {
      field: 'franchiseName',
      headerName: t('pages.initiativeStores.franchiseName'),
      flex: 9.698,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'type',
      headerName: t('pages.initiativeStores.type'),
      flex: 10.338,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) =>
        params.value === 'PHYSICAL' ? 'Fisico' : params.value === 'ONLINE' ? 'Online' : '-',
    },
    {
      field: 'address',
      headerName: t('pages.initiativeStores.address'),
      flex: 12.992,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'website',
      headerName: t('pages.initiativeStores.addressURL'),
      flex: 12.992,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'city',
      headerName: t('pages.initiativeStores.city'),
      flex: 10.747,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'referent',
      headerName: t('pages.initiativeStores.referent'),
      flex: 11.566,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) =>
        renderCellWithTooltip(
          `${params.row.contactName ? params.row.contactName : MISSING_DATA_PLACEHOLDER} ${params.row.contactSurname ? params.row.contactSurname : MISSING_DATA_PLACEHOLDER
          }`,
          11
        ),
    },
    {
      field: 'contactEmail',
      headerName: t('pages.initiativeStores.email'),
      flex: 13.57,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      flex: 4.736,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
          <IconButton onClick={() => goToStoreDetail(params.row)} size="small">
            <ChevronRightIcon data-testid={params.row.id} color="primary" fontSize="inherit" />
          </IconButton>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    void fetchStores(initialValues);
  }, []);

  const fetchStores = async (filters: GetPointOfSalesFilters, fromSort?: boolean) => {
    const userJwt = parseJwt(storageTokenOps.read());
    const merchantId = userJwt?.merchant_id;
    if (!merchantId) {
      return;
    }
    try {

      if (!fromSort) {
        setStoresLoading(true);
      }
      const response = await getMerchantPointOfSales(merchantId, {
        type: filters.type,
        city: filters.city,
        address: filters.address,
        contactName: filters.contactName,
        sort: filters.sort,
        page: filters.page,
        size: PAGINATION_SIZE,
      });
      const { content, ...paginationData } = response;
      setStores(content);
      setStoresPagination(paginationData);
      if (!fromSort) {
        setStoresLoading(false);
      }
    } catch (error: any) {
      if (!fromSort) {
        setStoresLoading(false);
      }
      addError({
        id: 'GET_MERCHANT_POINT_OF_SALES',
        blocking: false,
        error,
        techDescription: 'An error occurred getting merchant point of sales',
        displayableTitle: t('errors.genericTitle'),
        displayableDescription: t('errors.genericDescription'),
        toNotify: true,
        component: 'Toast',
        showCloseIcon: true,
      });
    }
  };

  const formik = useFormik<GetPointOfSalesFilters>({
    initialValues,
    onSubmit: (values) => {
      console.log('Eseguo ricerca con filtri:', values);
    },
  });

  const handleFiltersApplied = (values: GetPointOfSalesFilters) => {
    const filtersWithSort = {
      ...values,
      sort: currentSort,
      page: 0,
    };
    setFiltersAppliedOnce(true);
    fetchStores(filtersWithSort).catch((error) => {
      console.error('Error fetching stores:', error);
    });
  };

  const handleFiltersReset = () => {
    console.log('Callback dopo reset filtri');
    setFiltersAppliedOnce(false);
    void fetchStores(initialValues);
  };

  const goToAddStorePage = () => {
    history.push(`${BASE_ROUTE}/${id}/punti-vendita/censisci/`);
  };

  const goToStoreDetail = (store: PointOfSaleDTO) => {
    history.push(`${BASE_ROUTE}/${id}/punti-vendita/${store.id}/`);
  };

  const filtersSetted = () =>
    formik.values.type !== undefined ||
    formik.values.city !== '' ||
    formik.values.address !== '' ||
    formik.values.contactName !== '';

  const handleSortModelChange = async (newSortModel: GridSortModel) => {
    if (newSortModel.length > 0) {
      const { field, sort } = newSortModel[0];
      const sortKey = field === 'referent' ? `contactName,${sort}` : `${field},${sort}`;
      setCurrentSort(sortKey);
      await fetchStores(
        {
          ...formik.values,
          sort: sortKey,
        },
        true
      );
    } else {
      console.log('Ordinamento rimosso.');
      setCurrentSort('asc');
    }
  };

  const handlePaginationPageChange = (page: number) => {
    setStoresPagination(page);
    void fetchStores({
      ...formik.values,
      page,
      sort: currentSort,
    });
  };

  return (
    <Box sx={{ my: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 3 }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <TitleBox
          title={t('pages.initiativeStores.title')}
          subTitle={t('pages.initiativeStores.subtitle')}
          mbTitle={2}
          variantTitle="h4"
          variantSubTitle="body1"
        />
        {stores.length > 0 && !storesLoading && (
          <Button
            variant="contained"
            size="small"
            onClick={() => goToAddStorePage()}
            startIcon={<StoreIcon />}
            sx={{ width: { xs: '100%', md: 'auto', alignSelf: 'start', minWidth: '200px' } }}
          >
            {t('pages.initiativeStores.addStoreList')}
          </Button>
        )}
      </Stack>
      {storesLoading ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {(stores.length > 0 || (stores.length === 0 && filtersSetted()) || filtersAppliedOnce) && (
            <>
              <FiltersForm
                onFiltersApplied={handleFiltersApplied}
                onFiltersReset={handleFiltersReset}
                formik={formik}
                filtersAppliedOnce={filtersAppliedOnce}
              >
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="pos-type-label">
                      {t('pages.initiativeStores.pointOfSaleType')}
                    </InputLabel>
                    <Select
                      labelId="pos-type-label"
                      id="pos-type-select"
                      label={t('pages.initiativeStores.pointOfSaleType')}
                      name="type"
                      value={formik.values.type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="PHYSICAL">{t('pages.initiativeStores.physical')}</MenuItem>
                      <MenuItem value="ONLINE">{t('pages.initiativeStores.online')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Città */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('pages.initiativeStores.city')}
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                {/* Indirizzo */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <TextField
                    fullWidth
                    size="small"
                    name="address"
                    label={t('pages.initiativeStores.address')}
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                {/* Referente */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('pages.initiativeStores.referent')}
                    name="contactName"
                    value={formik.values.contactName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
              </FiltersForm>

              <Box sx={{ height: 'auto', width: '100%' }}>
                <DataTable
                  rows={stores}
                  columns={columns}
                  pageSize={PAGINATION_SIZE}
                  rowsPerPage={PAGINATION_SIZE}
                  onSortModelChange={handleSortModelChange}
                  paginationModel={storesPagination}
                  onPaginationPageChange={handlePaginationPageChange}
                />
              </Box>
            </>
          )
          }
        </>
      )}
      <Slide direction="left" in={showSuccessAlert} mountOnEnter unmountOnExit>
        <Alert
          severity="success"
          icon={<CheckCircleOutline />}
          sx={{
            position: 'fixed',
            bottom: 40,
            right: 20,
            backgroundColor: 'white',
            width: 'auto',
            maxWidth: '400px',
            minWidth: '300px',
            zIndex: 1300,
            boxShadow: 3,
            borderRadius: 1,
            '& .MuiAlert-icon': {
              color: '#6CC66A',
            },
          }}
        >
          {t('pages.initiativeStores.pointOfSalesUploadSuccess')}
        </Alert>
      </Slide>
      {
        !storesLoading && stores?.length === 0 && (
          <Paper
            sx={{
              my: 4,
              p: 3,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack spacing={0.5} direction="row">
              <Typography variant="body2">{!filtersAppliedOnce ? t('pages.initiativeStores.noStores') : t('pages.initiativeStores.noStoresInitiative')} </Typography>
             {
              !filtersAppliedOnce && (
                <Link
                onClick={() => goToAddStorePage()}
                className="cursor-pointer"
                variant="body2"
                sx={{ fontWeight: '600' }}
              >
                {t('pages.initiativeStores.addStoreNoResults')}
              </Link>
              )
             }
            </Stack>
          </Paper>
        )
      }
    </Box>
  );
};

export default InitiativeStores;
