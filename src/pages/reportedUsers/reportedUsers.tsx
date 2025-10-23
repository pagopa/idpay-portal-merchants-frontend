import React, { useState, useEffect, useRef } from 'react';
import { theme } from '@pagopa/mui-italia';
import {
  Box,
  Button,
  Stack,
  Grid,
  TextField,
  Paper,
  Typography,
  Alert,
  Slide,
  Tooltip,
  IconButton,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import ReportIcon from '@mui/icons-material/Report';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { CheckCircleOutline } from '@mui/icons-material';
import DataTable from '../../components/dataTable/DataTable';
import FiltersForm from '../initiativeDiscounts/FiltersForm';
import { GetReportedUsersFilters } from '../../types/types';
import { PointOfSaleDTO } from '../../api/generated/merchants/PointOfSaleDTO';
import { parseJwt } from '../../utils/jwt-utils';
import { BASE_ROUTE } from '../../routes';
import { PAGINATION_SIZE } from '../../utils/constants';
import { getMerchantPointOfSales } from '../../services/merchantService';

const initialValues: GetReportedUsersFilters = {
  cf: '',
  gtin: '',
  status: '',
  page: 0,
  size: PAGINATION_SIZE,
  sort: 'asc',
};
interface RouteParams {
  id: string;
}

const ReportedUsers: React.FC = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [users, setUsers] = useState<Array<any>>([]);
  const [storesPagination, setStoresPagination] = useState({
    pageNo: 0,
    pageSize: PAGINATION_SIZE,
    totalElements: 0
  });
  const [storesLoading, setStoresLoading] = useState(false);
  const [currentSort, setCurrentSort] = useState<string>('asc');
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filtersAppliedOnce, setFiltersAppliedOnce] = useState(false);

  const isGoingToDetail = useRef(false);
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<RouteParams>();

  const location = useLocation<{ showSuccessAlert?: boolean }>();
  useEffect(() => {
    if (location.state?.showSuccessAlert) {
      setShowSuccessAlert(true);

      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);

      history.replace({
        ...location,
        state: { ...location.state, showSuccessAlert: false }
      });
    }
  }, [location, history]);

  useEffect(() => {
    const storedPagination = sessionStorage.getItem('storesPagination');
    if(storedPagination && JSON.parse(storedPagination)?.pageNo !== undefined && JSON.parse(storedPagination)?.initiativeId === id ) {
      const parsed = JSON.parse(storedPagination);
      setStoresPagination(parsed);
      
      if (parsed.sort) {
        setCurrentSort(parsed.sort);
        
        // Convert sort string to GridSortModel
        const sortParts = parsed.sort.split(',');
        if (sortParts.length === 2) {
          const [field, order] = sortParts;
          setSortModel([{ field, sort: order as 'asc' | 'desc' }]);
        }
      }
      
      void fetchUsers({...initialValues, page: parsed.pageNo, sort: parsed.sort || 'asc'});
    } else {
      void fetchUsers({...initialValues});
    }

    return () => {
      if (!isGoingToDetail.current) {
        sessionStorage.removeItem('storesPagination');
      }
    };
    
  }, []);


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
      field: 'userCf',
      headerName: t('pages.reportedUsers.userCf'),
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'date',
      headerName: t('pages.reportedUsers.date'),
      flex: 0.8,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'discountCode',
      headerName: t('pages.reportedUsers.discountCode'),
      flex: 1,
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
      flex: 0.3,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
          <IconButton onClick={() => goToStoreDetail(params.row)} size="small">
            <ChevronRightIcon data-testid={params.row.id} color="primary" fontSize="inherit" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchUsers = async (_filters: GetReportedUsersFilters, fromSort?: boolean) => {
    // TODO configure the correct service to fetch users
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
        type: formik.status,
        city: '',
        address: '',
        contactName: '',
        sort: 'desc',
        page:  0,
        size: PAGINATION_SIZE,
      });

      const { content, ...paginationData } = response;
      console.log(content);
      console.log(paginationData);

      setUsers([]);
      setStoresPagination({
        pageNo: 0,
        pageSize: PAGINATION_SIZE,
        totalElements: 0
      });
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

  const formik = useFormik<GetReportedUsersFilters>({
    initialValues,
    onSubmit: (values) => {
      console.log('Eseguo ricerca con filtri:', values);
    },
  });

  const handleFiltersApplied = (values: GetReportedUsersFilters) => {
    const filtersWithSort = {
      ...values,
      sort: currentSort,
      page: 0,
    };
    setFiltersAppliedOnce(true);
    fetchUsers(filtersWithSort).catch((error) => {
      console.error('Error fetching stores:', error);
    });
  };

  const handleFiltersReset = () => {
    console.log('Callback dopo reset filtri');
    setFiltersAppliedOnce(false);
    void fetchUsers(initialValues);
  };

  const goToAddStorePage = () => {
    history.push(`${BASE_ROUTE}/${id}/punti-vendita/censisci/`);
  };

  const goToStoreDetail = (store: PointOfSaleDTO) => {
     // eslint-disable-next-line functional/immutable-data
    isGoingToDetail.current = true;
    history.push(`${BASE_ROUTE}/${id}/punti-vendita/${store.id}/`);
  };

  const filtersSetted = () =>
    formik.values.cf !== '' ||
    formik.values.gtin !== '' ||
    formik.values.status !== '';

  const handleSortModelChange = async (newSortModel: GridSortModel) => {
    if (newSortModel.length > 0) {
      const { field, sort } = newSortModel[0];
      const sortKey = field === 'referent' ? `contactName,${sort}` : `${field},${sort}`;
      setCurrentSort(sortKey);
      setSortModel(newSortModel);
      
      // Update sessionStorage with new sort
      const updatedPagination = { ...storesPagination, sort: sortKey, initiativeId: id };
      setStoresPagination(updatedPagination);
      sessionStorage.setItem('storesPagination', JSON.stringify(updatedPagination));
      
      await fetchUsers(
        {
          ...formik.values,
          sort: sortKey,
          page: storesPagination.pageNo,
        },
        true
      );
    } else {
      console.log('Ordinamento rimosso.');
      setCurrentSort('asc');
      setSortModel([]);
    }
  };

  const handlePaginationPageChange = (page: number) => {
    const updatedPagination = { ...storesPagination, pageNo: page, initiativeId: id, sort: currentSort };
    setStoresPagination(updatedPagination);
    sessionStorage.setItem('storesPagination', JSON.stringify(updatedPagination));
    void fetchUsers({
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
          title={t('pages.reportedUsers.title')}
          subTitle={t('pages.reportedUsers.subtitle')}
          mbTitle={2}
          variantTitle="h4"
          variantSubTitle="body1"
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => goToAddStorePage()}
          startIcon={<ReportIcon />}
          sx={{ width: { xs: '100%', md: 'auto', alignSelf: 'start', minWidth: '174px' } }}
        >
          {t('pages.reportedUsers.reportUser')}
        </Button>
      </Stack>
      {storesLoading ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {(users.length > 0 || (users.length === 0 && filtersSetted()) || filtersAppliedOnce) && (
            <>
              <FiltersForm
                onFiltersApplied={handleFiltersApplied}
                onFiltersReset={handleFiltersReset}
                formik={formik}
                filtersAppliedOnce={filtersAppliedOnce}
              >
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <Grid item xs={12} sm={6} md={3} lg={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t('pages.reportedUsers.cf')}
                      name="cf"
                      value={formik.values.cf}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </Grid>
                </Grid>
              </FiltersForm>

              <Box sx={{ height: 'auto', width: '100%' }}>
                <DataTable
                  rows={users}
                  columns={columns}
                  pageSize={PAGINATION_SIZE}
                  rowsPerPage={PAGINATION_SIZE}
                  onSortModelChange={handleSortModelChange}
                  paginationModel={storesPagination}
                  onPaginationPageChange={handlePaginationPageChange}
                  sortModel={sortModel}
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
        !storesLoading && users?.length === 0 && (
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
              <Typography variant="body2">{!filtersAppliedOnce ? t('pages.reportedUsers.noUsers') : t('pages.initiativeStores.noStoresInitiative')} </Typography>
            </Stack>
          </Paper>
        )
      }
    </Box>
  );
};

export default ReportedUsers;
