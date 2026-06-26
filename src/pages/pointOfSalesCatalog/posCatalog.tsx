import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { Box, Stack, Paper, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useFormik } from 'formik';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { useHistory, useLocation } from 'react-router-dom';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import DataTable from '../../components/dataTable/DataTable';
import { GetPointOfSalesFilters } from '../../types/types';
import { PointOfSaleDTO } from '../../api/generated/merchants/data-contracts';
import { parseJwt } from '../../utils/jwt-utils';
import { getMerchantPointOfSalesCatalog } from '../../services/merchantService';
import { ELEMENT_PER_PAGE, PAGINATION_SIZE } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { browserConsole } from '../../utils/consoleLogger';
import { useAppSelector } from '../../redux/hooks';
import { intiativesListSelector } from '../../redux/slices/initiativesSlice';
import PointOfSalesFilters from '../../components/pointsOfSale/PointOfSalesFilters';
import buildPointOfSalesColumns from '../../components/pointsOfSale/pointOfSalesColumns';
import usePointOfSalesTable from '../../components/pointsOfSale/usePointOfSalesTable';
import { PosCatalogDrawer } from './PosCatalogFiltersDrawer';

const initialValues: GetPointOfSalesFilters = {
  initiative: '',
  type: undefined,
  city: '',
  address: '',
  contactName: '',
  page: 0,
  size: PAGINATION_SIZE,
  sort: 'asc',
};

const PosCatalog: React.FC = () => {
  const { setAlert } = useAlert();
  const [selectedStore, setSelectedStore] = useState<PointOfSaleDTO | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { t } = useScopedTranslation();
  const history = useHistory();
  const initiativesList = useAppSelector(intiativesListSelector);

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

  const initiativeOptions = useMemo(
    () =>
      (initiativesList ?? []).map((initiative) => ({
        value: initiative.initiativeName ?? '',
        label: initiative.initiativeName ?? '',
      })),
    [initiativesList]
  );

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

  const fetchCatalogStores = useCallback(async (filters: GetPointOfSalesFilters) => {
    const userJwt = parseJwt(storageTokenOps.read());
    const merchantId = userJwt?.merchant_id;

    if (!merchantId) {
      return {
        content: [],
        pageNo: 0,
        pageSize: filters.size ?? PAGINATION_SIZE,
        totalElements: 0,
      };
    }

    return getMerchantPointOfSalesCatalog(merchantId, {
      initiative: filters.initiative,
      type: filters.type,
      city: filters.city,
      address: filters.address,
      contactName: filters.contactName,
      sort: filters.sort,
      page: filters.page ?? 0,
      size: filters.size ?? PAGINATION_SIZE,
    });
  }, []);

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
    onFetchError: handleFetchError,
    fetchStores: fetchCatalogStores,
  });

  const filtersSetted = () =>
    formik.values.initiative !== '' ||
    formik.values.type !== undefined ||
    formik.values.city !== '' ||
    formik.values.address !== '' ||
    formik.values.contactName !== '';

  const openStoreDrawer = useCallback((store: PointOfSaleDTO) => {
    setSelectedStore(store);
    setIsDrawerOpen(true);
  }, []);

  const handleToggleDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedStore(null);
  }, []);

  const columns = useMemo(
    () =>
      buildPointOfSalesColumns({
        t,
        onActionClick: openStoreDrawer,
        addressMode: 'catalog',
      }),
    [openStoreDrawer, t]
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
          title={t('pages.posCatalog.title')}
          subTitle={t('pages.posCatalog.subtitle')}
          mbTitle={2}
          variantTitle="h4"
          variantSubTitle="body1"
        />
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
                initiativeOptions={initiativeOptions}
                fields={['initiative', 'type', 'city', 'address', 'contactName']}
                t={t}
              />

              <Box sx={{ height: 'auto', width: '100%' }}>
                <DataTable
                  rows={stores}
                  columns={columns}
                  checkable
                  isRowSelectable={() => false}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={ELEMENT_PER_PAGE}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  onSortModelChange={handleSortModelChange}
                  paginationModel={storesPagination}
                  onPaginationPageChange={handlePaginationPageChange}
                  sortModel={sortModel}
                />
              </Box>

              <PosCatalogDrawer
                isOpen={isDrawerOpen}
                onClose={handleToggleDrawer}
                selectedStore={selectedStore}
              />
            </>
          )}
        </>
      )}
      {!storesLoading && stores?.length === 0 && (
        <Paper
          sx={{
            my: 4,
            p: 4,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack spacing={1} alignItems="center">
            {!filtersAppliedOnce ? (
              <>
                <ErrorOutlineOutlinedIcon sx={{ color: 'text.disabled', fontSize: 28 }} />
                <Typography variant="body2">{t('pages.posCatalog.noData')}</Typography>
              </>
            ) : (
              <Typography variant="body2">
                {t('pages.initiativeStores.noStoresInitiative')}
              </Typography>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default PosCatalog;
