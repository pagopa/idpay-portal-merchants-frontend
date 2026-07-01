import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { GridSelectionModel, GridSortModel } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { MIAlert } from '@pagopa/mui-italia';
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
  const [selectedStoreIds, setSelectedStoreIds] = useState<GridSelectionModel>([]);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState('');

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
        value: initiative.initiativeId ?? '',
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
      initiativeId: filters.initiative,
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

  const handleSelectionModelChange = useCallback((selectionModel: GridSelectionModel) => {
    setSelectedStoreIds(selectionModel);
  }, []);

  const handleCatalogFiltersApplied = useCallback(
    (values: GetPointOfSalesFilters) => {
      setSelectedStoreIds([]);
      handleFiltersApplied(values);
    },
    [handleFiltersApplied]
  );

  const handleCatalogFiltersReset = useCallback(() => {
    setSelectedStoreIds([]);
    handleFiltersReset();
  }, [handleFiltersReset]);

  const handleCatalogPaginationPageChange = useCallback(
    (page: number) => {
      setSelectedStoreIds([]);
      handlePaginationPageChange(page);
    },
    [handlePaginationPageChange]
  );

  const handleCatalogRowsPerPageChange = useCallback(
    (pageSize: number) => {
      setSelectedStoreIds([]);
      handleRowsPerPageChange(pageSize);
    },
    [handleRowsPerPageChange]
  );

  const handleCatalogSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSelectedStoreIds([]);
      handleSortModelChange(model);
    },
    [handleSortModelChange]
  );

  const handleAssociateModalClose = useCallback(() => {
    setIsAssociateModalOpen(false);
    setSelectedInitiativeId('');
  }, []);

  const handleInitiativeChange = useCallback((event: SelectChangeEvent) => {
    setSelectedInitiativeId(event.target.value);
  }, []);

  const selectedStoresCountLabel = ` (${selectedStoreIds.length})`;

  const columns = useMemo(
    () =>
      buildPointOfSalesColumns({
        t,
        onActionClick: openStoreDrawer,
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
        {selectedStoreIds.length > 0 && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="outlined" color="error" sx={{whiteSpace: "nowrap"}}>
              {`${t('pages.posCatalog.actions.exclude')}${selectedStoresCountLabel}`}
            </Button>
            <Button variant="contained" onClick={() => setIsAssociateModalOpen(true)} sx={{whiteSpace: "nowrap"}}>
              {`${t('pages.posCatalog.actions.associate')}${selectedStoresCountLabel}`}
            </Button>
          </Stack>
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
                onFiltersApplied={handleCatalogFiltersApplied}
                onFiltersReset={handleCatalogFiltersReset}
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
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={ELEMENT_PER_PAGE}
                  onRowsPerPageChange={handleCatalogRowsPerPageChange}
                  onSelectionModelChange={handleSelectionModelChange}
                  selectionModel={selectedStoreIds}
                  onSortModelChange={handleCatalogSortModelChange}
                  paginationModel={storesPagination}
                  onPaginationPageChange={handleCatalogPaginationPageChange}
                  sortModel={sortModel}
                />
              </Box>

              <PosCatalogDrawer
                isOpen={isDrawerOpen}
                onClose={handleToggleDrawer}
                selectedStore={selectedStore}
                initiativeOptions={initiativeOptions}
                merchantId={parseJwt(storageTokenOps.read())?.merchant_id ?? ''}
              />
            </>
          )}
          <Modal
            open={isAssociateModalOpen}
            onClose={handleAssociateModalClose}
            aria-labelledby="associate-selected-pos-modal-title"
          >
            <Box
              data-testid="associate-selected-pos-modal"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: 'calc(100% - 32px)', sm: 608 },
                maxWidth: 'calc(100% - 32px)',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 3.5,
                outline: 'none',
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography
                      id="associate-selected-pos-modal-title"
                      variant="h5"
                      sx={{ fontWeight: theme.typography.fontWeightBold, mb: 0.75 }}
                    >
                      {t('pages.posCatalog.associateModal.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('pages.posCatalog.associateModal.description')}
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label={t('actions.close')}
                    onClick={handleAssociateModalClose}
                    sx={{ ml: 2, mt: -1 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>

                <FormControl fullWidth size="small">
                  <InputLabel id="associate-initiative-label">
                    {t('pages.posCatalog.associateModal.initiativeLabel')}{' '}
                    <Box component="span" sx={{ color: theme.palette.error.main }}>
                      *
                    </Box>
                  </InputLabel>
                  <Select
                    labelId="associate-initiative-label"
                    value={selectedInitiativeId}
                    label={t('pages.posCatalog.associateModal.initiativeLabel')}
                    onChange={handleInitiativeChange}
                    sx={{
                      '& .MuiSelect-select': {
                        py: 1.25,
                      },
                    }}
                  >
                    {initiativeOptions.map((initiative) => (
                      <MenuItem key={initiative.value} value={initiative.value}>
                        {initiative.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <MIAlert
                  severity="info"
                  description={t('pages.posCatalog.associateModal.infoBanner')}
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button size="small" onClick={handleAssociateModalClose}>
                    {t('actions.cancel')}
                  </Button>
                  <Button size="small" variant="contained">
                    {t('actions.confirm')}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Modal>
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
