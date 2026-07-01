import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Button,
  Stack,
  Paper,
  Typography,
  Link,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { useFormik } from 'formik';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { useHistory, useLocation } from 'react-router-dom';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import DataTable from '../../components/dataTable/DataTable';
import PointOfSalesFilters from '../../components/pointsOfSale/PointOfSalesFilters';
import buildPointOfSalesColumns from '../../components/pointsOfSale/pointOfSalesColumns';
import usePointOfSalesTable from '../../components/pointsOfSale/usePointOfSalesTable';
import { GetPointOfSalesFilters } from '../../types/types';
import { PointOfSaleDTO } from '../../api/generated/merchants/data-contracts';
import { parseJwt } from '../../utils/jwt-utils';
import { getMerchantPointOfSales } from '../../services/merchantService';
import { BASE_ROUTE } from '../../routes';
import { PAGINATION_SIZE } from '../../utils/constants';
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
  const isGoingToDetail = useRef(false);
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
  }, [location, history, setAlert, t]);

  const formik = useFormik<GetPointOfSalesFilters>({
    initialValues,
    onSubmit: (values) => {
      browserConsole.log('Eseguo ricerca con filtri:', values);
    },
  });

  const handleFetchError = useCallback(
    () =>
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      }),
    [setAlert, t]
  );

  const fetchInitiativeStores = useCallback(
    async (filters: GetPointOfSalesFilters) => {
      const userJwt = parseJwt(storageTokenOps.read());
      const merchantId = userJwt?.merchant_id;

      if (!merchantId || !initiativeId) {
        return {
          content: [],
          pageNo: 0,
          pageSize: filters.size ?? PAGINATION_SIZE,
          totalElements: 0,
        };
      }

      return getMerchantPointOfSales(initiativeId, merchantId, {
        type: filters.type,
        city: filters.city,
        address: filters.address,
        contactName: filters.contactName,
        sort: filters.sort,
        page: filters.page ?? 0,
        size: filters.size ?? PAGINATION_SIZE,
      });
    },
    [initiativeId]
  );

  const {
    stores,
    storesPagination,
    storesLoading,
    rowsPerPage,
    sortModel,
    filtersAppliedOnce,
    handleFiltersApplied,
    handleFiltersReset,
    handleSortModelChange,
    handlePaginationPageChange,
    handleRowsPerPageChange,
  } = usePointOfSalesTable({
    initialValues,
    initialPageSize: PAGINATION_SIZE,
    storageKey: 'storesPagination',
    storageContextField: 'initiativeId',
    storageContextValue: initiativeId,
    resetStorageOnUnmount: !isGoingToDetail.current,
    suppressLoadingOnSort: true,
    enabled: Boolean(initiativeId),
    resetDependencies: [initiativeId],
    onFetchError: handleFetchError,
    fetchStores: fetchInitiativeStores,
  });

  const goToAddStorePage = useCallback(() => {
    history.push(`${BASE_ROUTE}/${initiativeId}/punti-vendita/censisci/`);
  }, [history, initiativeId]);

  const goToStoreDetail = useCallback(
    (store: PointOfSaleDTO) => {
      // eslint-disable-next-line functional/immutable-data
      isGoingToDetail.current = true;
      history.push(`${BASE_ROUTE}/${initiativeId}/punti-vendita/${store.id}/`);
    },
    [history, initiativeId]
  );

  const filtersSetted = () =>
    formik.values.type !== undefined ||
    formik.values.city !== '' ||
    formik.values.address !== '' ||
    formik.values.contactName !== '';

  const columns = useMemo(
    () =>
      buildPointOfSalesColumns({
        t,
        onActionClick: goToStoreDetail,
      }),
    [goToStoreDetail, t]
  );

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
        {!storesLoading && (
          <Button
            variant="contained"
            size="small"
            onClick={() => goToAddStorePage()}
            startIcon={<AddIcon fontSize='large' />}
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
              <PointOfSalesFilters
                onFiltersApplied={handleFiltersApplied}
                onFiltersReset={handleFiltersReset}
                formik={formik}
                filtersAppliedOnce={filtersAppliedOnce}
                fields={['type', 'city', 'address', 'contactName']}
                t={t}
              />

              <Box sx={{ height: 'auto', width: '100%' }}>
                <DataTable
                  rows={stores}
                  columns={columns}
                  rowsPerPage={rowsPerPage}
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
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <Stack spacing={1} alignItems="center">
            <ErrorOutlineOutlinedIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
            <Typography variant="body2">
              {t('pages.initiativeStores.noStores')}{t('pages.initiativeStores.addStoreNoResults')}.
            </Typography>
            <Link
              onClick={() => goToAddStorePage()}
              className="cursor-pointer"
              variant="body2"
              sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'none' } }}
            >
              {t('pages.initiativeStores.addStoreList')}
            </Link>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default InitiativeStores;
