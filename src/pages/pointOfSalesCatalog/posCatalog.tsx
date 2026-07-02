import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { GridSelectionModel, GridSortModel } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useFormik } from 'formik';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { useHistory, useLocation } from 'react-router-dom';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import DataTable from '../../components/dataTable/DataTable';
import { GetPointOfSalesFilters } from '../../types/types';
import {
  PointOfSaleDTO,
  PointOfSaleOnboardingResultDTO,
} from '../../api/generated/merchants/data-contracts';
import { parseJwt } from '../../utils/jwt-utils';
import { associatePos, getMerchantPointOfSalesCatalog } from '../../services/merchantService';
import { ELEMENT_PER_PAGE, PAGINATION_SIZE } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { browserConsole } from '../../utils/consoleLogger';
import { useAppSelector } from '../../redux/hooks';
import { intiativesListSelector } from '../../redux/slices/initiativesSlice';
import PointOfSalesFilters from '../../components/pointsOfSale/PointOfSalesFilters';
import buildPointOfSalesColumns from '../../components/pointsOfSale/pointOfSalesColumns';
import usePointOfSalesTable from '../../components/pointsOfSale/usePointOfSalesTable';
import { PosCatalogDrawer } from './PosCatalogFiltersDrawer';
import AssociateSelectedPosModal from './AssociateSelectedPosModal';
import AlreadyAssociatedPosModal, {
  AlreadyAssociatedPointOfSale,
} from './AlreadyAssociatedPosModal';

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
  const [isAssociatingPos, setIsAssociatingPos] = useState(false);
  const [alreadyAssociatedStores, setAlreadyAssociatedStores] = useState<
    Array<AlreadyAssociatedPointOfSale>
  >([]);
  const [associationSuccessData, setAssociationSuccessData] = useState<{
    associatedCount: number;
    initiativeName: string;
  } | null>(null);
  const [pendingAssociationRefreshFilters, setPendingAssociationRefreshFilters] =
    useState<GetPointOfSalesFilters | null>(null);

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

  const handleInitiativeChange = useCallback((initiativeId: string) => {
    setSelectedInitiativeId(initiativeId);
  }, []);

  const showAssociationSuccessAlert = useCallback(
    (associatedCount: number, initiativeName: string) =>
      setAlert({
        text: t('pages.posCatalog.associateSuccess', {
          count: associatedCount,
          initiativeName,
        }),
        isOpen: true,
        severity: 'success',
      }),
    [setAlert, t]
  );

  const handleAlreadyAssociatedModalClose = useCallback(() => {
    setAlreadyAssociatedStores([]);

    if (associationSuccessData) {
      showAssociationSuccessAlert(
        associationSuccessData.associatedCount,
        associationSuccessData.initiativeName
      );
      setAssociationSuccessData(null);
    }

    if (pendingAssociationRefreshFilters) {
      handleFiltersApplied(pendingAssociationRefreshFilters);
      setPendingAssociationRefreshFilters(null);
    }
  }, [
    associationSuccessData,
    handleFiltersApplied,
    pendingAssociationRefreshFilters,
    showAssociationSuccessAlert,
  ]);

  const handleAssociationResult = useCallback(
    (result: PointOfSaleOnboardingResultDTO, initiativeName: string) => {
      const alreadyAssociated = (result.notAssociated ?? []).filter(
        (pointOfSale) => pointOfSale.reason === 'ALREADY_ASSOCIATED'
      );
      const associatedCount = result.associated?.length ?? 0;

      setSelectedStoreIds([]);
      handleAssociateModalClose();

      if (alreadyAssociated.length > 0) {
        setAssociationSuccessData({ associatedCount, initiativeName });
        setPendingAssociationRefreshFilters(formik.values);
        setAlreadyAssociatedStores(alreadyAssociated);
        return;
      }

      handleFiltersApplied(formik.values);
      showAssociationSuccessAlert(associatedCount, initiativeName);
    },
    [formik.values, handleAssociateModalClose, handleFiltersApplied, showAssociationSuccessAlert]
  );

  const handleAssociateConfirm = useCallback(async () => {
    const userJwt = parseJwt(storageTokenOps.read());
    const merchantId = userJwt?.merchant_id;
    const initiativeName =
      initiativeOptions.find((initiative) => initiative.value === selectedInitiativeId)?.label ??
      '';

    if (!merchantId || !selectedInitiativeId || selectedStoreIds.length === 0) {
      handleFetchError();
      return;
    }

    setIsAssociatingPos(true);

    try {
      const result = await associatePos(
        selectedInitiativeId,
        merchantId,
        selectedStoreIds.map((id) => String(id))
      );
      handleAssociationResult(result, initiativeName);
    } catch (_error) {
      handleFetchError();
    } finally {
      setIsAssociatingPos(false);
    }
  }, [
    handleAssociationResult,
    handleFetchError,
    initiativeOptions,
    selectedInitiativeId,
    selectedStoreIds,
  ]);

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
            <Button variant="outlined" color="error" sx={{ whiteSpace: 'nowrap' }}>
              {`${t('pages.posCatalog.actions.exclude')}${selectedStoresCountLabel}`}
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsAssociateModalOpen(true)}
              sx={{ whiteSpace: 'nowrap' }}
            >
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
          <AssociateSelectedPosModal
            open={isAssociateModalOpen}
            initiativeOptions={initiativeOptions}
            selectedInitiativeId={selectedInitiativeId}
            isLoading={isAssociatingPos}
            onClose={handleAssociateModalClose}
            onInitiativeChange={handleInitiativeChange}
            onConfirm={handleAssociateConfirm}
          />
          <AlreadyAssociatedPosModal
            stores={alreadyAssociatedStores}
            onClose={handleAlreadyAssociatedModalClose}
          />
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
