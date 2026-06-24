import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { Box, Stack, Paper, Typography, Tooltip, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { useHistory, useLocation } from 'react-router-dom';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import DataTable from '../../components/dataTable/DataTable';
import { GetPointOfSalesFilters } from '../../types/types';
import { PointOfSaleDTO } from '../../api/generated/merchants/data-contracts';
import { parseJwt } from '../../utils/jwt-utils';
import { getMerchantPointOfSalesCatalog } from '../../services/merchantService';
import { ELEMENT_PER_PAGE, MISSING_DATA_PLACEHOLDER, PAGINATION_SIZE } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { browserConsole } from '../../utils/consoleLogger';
import { useAppSelector } from '../../redux/hooks';
import { intiativesListSelector } from '../../redux/slices/initiativesSlice';
import { PosCatalogDrawer, PosCatalogFilters } from './PosCatalogFiltersDrawer';

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
  const [stores, setStores] = useState<Array<PointOfSaleDTO>>([]);
  const [storesPagination, setStoresPagination] = useState({
    pageNo: 0,
    pageSize: PAGINATION_SIZE,
    totalElements: 0,
  });
  const [storesLoading, setStoresLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION_SIZE);
  const [currentSort, setCurrentSort] = useState<string>('asc');
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filtersAppliedOnce, setFiltersAppliedOnce] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<GetPointOfSalesFilters>(initialValues);
  const [selectedStore, setSelectedStore] = useState<PointOfSaleDTO | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const requestIdRef = useRef(0);
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

  useEffect(() => {
    const storedPagination = sessionStorage.getItem('storesPagination');
    if (storedPagination && JSON.parse(storedPagination)?.pageNo !== undefined) {
      const parsed = JSON.parse(storedPagination);
      setStoresPagination(parsed);
      setRowsPerPage(parsed.pageSize ?? PAGINATION_SIZE);

      if (parsed.sort) {
        setCurrentSort(parsed.sort);

        const sortParts = parsed.sort.split(',');
        if (sortParts.length === 2) {
          const [field, order] = sortParts;
          setSortModel([{ field, sort: order as 'asc' | 'desc' }]);
        }
      }
    }

    return () => {
      sessionStorage.removeItem('storesPagination');
    };
  }, []);

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

  const initiativeOptions = useMemo(
    () =>
      (initiativesList ?? []).map((initiative) => ({
        value: initiative.initiativeName ?? '',
        label: initiative.initiativeName ?? '',
      })),
    [initiativesList]
  );

  const openStoreDrawer = (store: PointOfSaleDTO) => {
    setSelectedStore(store);
    setIsDrawerOpen(true);
  };

  const handleToggleDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedStore(null);
  };

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
        renderCell: (params: any) => renderCellWithTooltip(params.value, 1),
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
            <IconButton onClick={() => openStoreDrawer(params.row)} size="small">
              <ChevronRightIcon data-testid={params.row.id} color="primary" fontSize="inherit" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [renderCellWithTooltip, t]
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

      const response = await getMerchantPointOfSalesCatalog(merchantId, {
        type: filters.type,
        city: filters.city,
        address: filters.address,
        contactName: filters.contactName,
        sort: filters.sort,
        page: filters.page ?? 0,
        size: PAGINATION_SIZE,
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

  const handleFiltersApplied = (values: GetPointOfSalesFilters) => {
    const updatedFilters = {
      ...values,
      page: 0,
      size: rowsPerPage,
    };
    setAppliedFilters(updatedFilters);
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
    }));
  };

  const filtersSetted = () =>
    formik.values.initiative !== '' ||
    formik.values.type !== undefined ||
    formik.values.city !== '' ||
    formik.values.address !== '' ||
    formik.values.contactName !== '';

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    if (newSortModel.length > 0) {
      const { field, sort } = newSortModel[0];
      const sortKey = field === 'referent' ? `contactName,${sort}` : `${field},${sort}`;
      setCurrentSort(sortKey);
      setSortModel(newSortModel);

      const updatedPagination = {
        ...storesPagination,
        sort: sortKey,
        pageSize: rowsPerPage,
      };
      setStoresPagination(updatedPagination);
      sessionStorage.setItem('storesPagination', JSON.stringify(updatedPagination));
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
        sort: currentSort,
      };
      setStoresPagination(updatedPagination);
      sessionStorage.setItem('storesPagination', JSON.stringify(updatedPagination));

      await fetchStores({
        ...appliedFilters,
        sort: currentSort,
        page,
      });
    },
    [storesPagination, currentSort, appliedFilters]
  );


  const handleRowsPerPageChange = (pageSize: number) => {
    setRowsPerPage(pageSize);
    setStoresPagination((prev) => ({
      ...prev,
      pageNo: 0,
      pageSize,
    }));
  };

  useEffect(() => {
    void fetchStores({
      ...appliedFilters,
      sort: currentSort,
      page: storesPagination.pageNo,
    });
  }, [currentSort, appliedFilters]);

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
              <PosCatalogFilters
                onFiltersApplied={handleFiltersApplied}
                onFiltersReset={handleFiltersReset}
                formik={formik}
                filtersAppliedOnce={filtersAppliedOnce}
                initiativeOptions={initiativeOptions}
                t={t}
              />

              <Box sx={{ height: 'auto', width: '100%' }}>
                <DataTable
                  rows={stores}
                  columns={columns}
                  checkable
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
