import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import {
  Box,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Typography,
  Link,
  Tooltip,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircularProgress from '@mui/material/CircularProgress';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import StoreIcon from '@mui/icons-material/Store';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { useHistory, useLocation } from 'react-router-dom';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import DataTable from '../../components/dataTable/DataTable';
import FiltersForm from '../initiativeDiscounts/FiltersForm';
import { GetPointOfSalesFilters } from '../../types/types';
import { PointOfSaleDTO } from '../../api/generated/merchants/data-contracts';
import { parseJwt } from '../../utils/jwt-utils';
import { getMerchantPointOfSales } from '../../services/merchantService';
import { BASE_ROUTE } from '../../routes';
import { MISSING_DATA_PLACEHOLDER, PAGINATION_SIZE } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { browserConsole } from '../../utils/consoleLogger';

const initialValues: GetPointOfSalesFilters = {
  type: undefined,
  city: '',
  address: '',
  contactName: '',
  page: 0,
  size: PAGINATION_SIZE,
  sort: 'asc',
};

const InitiativeStores: React.FC = () => {
  const { setAlert } = useAlert();
  const [stores, setStores] = useState<Array<PointOfSaleDTO>>([]);
  const [storesPagination, setStoresPagination] = useState({
    pageNo: 0,
    pageSize: PAGINATION_SIZE,
    totalElements: 0,
  });
  const [storesLoading, setStoresLoading] = useState(false);
  const [currentSort, setCurrentSort] = useState<string>('asc');
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filtersAppliedOnce, setFiltersAppliedOnce] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<GetPointOfSalesFilters>(initialValues);

  const isGoingToDetail = useRef(false);
  const requestIdRef = useRef(0);
  const { t } = useScopedTranslation();
  const history = useHistory();
  const { initiativeId } = useCurrentInitiativeId();

  const location = useLocation<{ showSuccessAlert?: boolean }>();
  useEffect(() => {
    if (location.state?.showSuccessAlert) {
      setAlert({
        text: t('pages.initiativeStores.pointOfSalesUploadSuccess'),
        isOpen: true,
        severity: 'success',
      });

      history.replace({
        ...location,
        state: { ...location.state, showSuccessAlert: false },
      });
    }
  }, [location, history]);

  useEffect(() => {
    if (!initiativeId) {
      return;
    }

    const storedPagination = sessionStorage.getItem('storesPagination');
    if (
      storedPagination &&
      JSON.parse(storedPagination)?.pageNo !== undefined &&
      JSON.parse(storedPagination)?.initiativeId === initiativeId
    ) {
      const parsed = JSON.parse(storedPagination);
      setStoresPagination(parsed);

      if (parsed.sort) {
        setCurrentSort(parsed.sort);

        const sortParts = parsed.sort.split(',');
        if (sortParts.length === 2) {
          const [field, order] = sortParts;
          setSortModel([{ field, sort: order as 'asc' | 'desc' }]);
        }
      }
    } else {
      setStoresPagination({
        pageNo: 0,
        pageSize: PAGINATION_SIZE,
        totalElements: 0,
      });
      setCurrentSort('asc');
      setSortModel([]);
    }

    return () => {
      if (!isGoingToDetail.current) {
        sessionStorage.removeItem('storesPagination');
      }
    };
  }, [initiativeId]);

  const infoStyles = {
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.fontSize,
  };

  const renderCellWithTooltip = useCallback(
    (value: string, tooltipThreshold: number) => (
      <Tooltip title={value && value.length >= tooltipThreshold ? value : MISSING_DATA_PLACEHOLDER}>
        <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
          {value && value !== '' ? value : MISSING_DATA_PLACEHOLDER}
        </Typography>
      </Tooltip>
    ),
    []
  );

  const columns: Array<GridColDef> = useMemo(
    () => [
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
            [params.value, params.row?.streetNumber].filter(Boolean).join(', '),
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
            <IconButton onClick={() => goToStoreDetail(params.row)} size="small">
              <ChevronRightIcon data-testid={params.row.id} color="primary" fontSize="inherit" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [t, renderCellWithTooltip]
  );

  const fetchStores = async (filters: GetPointOfSalesFilters, fromSort?: boolean) => {
    const currentRequestId = requestIdRef.current + 1;
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = currentRequestId;

    const userJwt = parseJwt(storageTokenOps.read());
    const merchantId = userJwt?.merchant_id;
    if (!merchantId) {
      return;
    }

    try {
      if (!fromSort) {
        setStoresLoading(true);
      }

      const response = await getMerchantPointOfSales(initiativeId || '', merchantId, {
        type: filters.type,
        city: filters.city,
        address: filters.address,
        contactName: filters.contactName,
        sort: filters.sort,
        page: filters.page ?? 0,
        size: filters.size ?? PAGINATION_SIZE,
      });

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const { content, ...paginationData } = response;
      setStores(content);
      setStoresPagination(() => ({
        ...paginationData,
        pageNo: filters.page ?? 0,
      }));

      if (!fromSort) {
        setStoresLoading(false);
      }
    } catch (error: any) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (!fromSort) {
        setStoresLoading(false);
      }

      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
    }
  };

  const formik = useFormik<GetPointOfSalesFilters>({
    initialValues,
    onSubmit: (values) => {
      browserConsole.log('Eseguo ricerca con filtri:', values);
    },
  });

  useEffect(() => {
    if (!initiativeId) {
      return;
    }

    formik.resetForm();
    setAppliedFilters(initialValues);
    setFiltersAppliedOnce(false);
    setSortModel([]);
    setCurrentSort('asc');
    setStoresPagination({
      pageNo: 0,
      pageSize: PAGINATION_SIZE,
      totalElements: 0,
    });
  }, [initiativeId]);

  const handleFiltersApplied = (values: GetPointOfSalesFilters) => {
    setAppliedFilters(values);
    setFiltersAppliedOnce(true);
    setStoresPagination((prev) => ({
      ...prev,
      pageNo: 0,
    }));
  };

  const handleFiltersReset = () => {
    setFiltersAppliedOnce(false);
    setAppliedFilters(initialValues);
    setStoresPagination((prev) => ({
      ...prev,
      pageNo: 0,
      pageSize: storesPagination.pageSize,
    }));
  };

  const goToAddStorePage = () => {
    history.push(`${BASE_ROUTE}/${initiativeId}/punti-vendita/censisci/`);
  };

  const goToStoreDetail = (store: PointOfSaleDTO) => {
    // eslint-disable-next-line functional/immutable-data
    isGoingToDetail.current = true;
    history.push(`${BASE_ROUTE}/${initiativeId}/punti-vendita/${store.id}/`);
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
      setSortModel(newSortModel);

      const updatedPagination = { ...storesPagination, sort: sortKey, initiativeId };
      setStoresPagination(updatedPagination);
      sessionStorage.setItem('storesPagination', JSON.stringify(updatedPagination));

      await fetchStores(
        {
          ...appliedFilters,
          sort: sortKey,
          page: storesPagination.pageNo,
          size: storesPagination.pageSize,
        },
        true
      );
    } else {
      browserConsole.log('Ordinamento rimosso.');
      setCurrentSort('asc');
      setSortModel([]);
    }
  };

  const handlePaginationPageChange = useCallback(
    async (page: number) => {
      const updatedPagination = {
        ...storesPagination,
        pageNo: page,
        initiativeId,
        sort: currentSort,
      };
      setStoresPagination(updatedPagination);
      sessionStorage.setItem('storesPagination', JSON.stringify(updatedPagination));

      await fetchStores({
        ...appliedFilters,
        sort: currentSort,
        page,
        size: storesPagination.pageSize,
      });
    },
    [storesPagination, initiativeId, currentSort, appliedFilters]
  );

  const handleRowsPerPageChange = useCallback(
    async (pageSize: number) => {
      const updatedPagination = {
        ...storesPagination,
        pageNo: 0,
        pageSize,
        initiativeId,
        sort: currentSort,
      };
      setStoresPagination(updatedPagination);
      sessionStorage.setItem('storesPagination', JSON.stringify(updatedPagination));

      await fetchStores({
        ...appliedFilters,
        sort: currentSort,
        page: 0,
        size: pageSize,
      });
    },
    [storesPagination, initiativeId, currentSort, appliedFilters]
  );

  useEffect(() => {
    if (!initiativeId) {
      return;
    }

    void fetchStores({
      ...appliedFilters,
      sort: currentSort,
      page: storesPagination.pageNo,
      size: storesPagination.pageSize

    });
  }, [initiativeId, currentSort, appliedFilters]);

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
          {(stores.length > 0 ||
            (stores.length === 0 && filtersSetted()) ||
            filtersAppliedOnce) && (
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
                  rowsPerPage={storesPagination.pageSize}
                  onSortModelChange={handleSortModelChange}
                  paginationModel={storesPagination}
                  onPaginationPageChange={handlePaginationPageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  sortModel={sortModel}
                  isTransactionsPage={true}
                />
              </Box>
            </>
          )}
        </>
      )}
      {!storesLoading && stores?.length === 0 && (
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
            <Typography variant="body2">
              {!filtersAppliedOnce
                ? t('pages.initiativeStores.noStores')
                : t('pages.initiativeStores.noStoresInitiative')}
              {!filtersAppliedOnce && (
                <Link
                  onClick={() => goToAddStorePage()}
                  className="cursor-pointer"
                  variant="body2"
                  sx={{ fontWeight: '600' }}
                >
                  {t('pages.initiativeStores.addStoreNoResults')}
                </Link>
              )}
            </Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default InitiativeStores;
