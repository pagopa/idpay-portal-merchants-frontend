import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Tooltip,
  CircularProgress,
  Alert as MuiAlert,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useHistory, useParams } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { Sync } from '@mui/icons-material';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import FiltersForm from '../../initiativeDiscounts/FiltersForm';
import StatusChip from '../../../components/Chip/StatusChipInvoice';
import InvoiceDataTable from '../invoiceDataTable';
import { formatDate, truncateString } from '../../../helpers';
import { RewardBatchTrxStatus } from '../../../api/generated/merchants/data-contracts';
import { parseJwt } from '../../../utils/jwt-utils';
import {
  downloadBatchCsv,
  getRewardBatchById,
  getMerchantPointOfSalesWithTransactions,
  getMerchantDetail,
} from '../../../services/merchantService';
import StatusChipInvoice from '../../../components/Chip/StatusChipInvoice';
import { useAlert } from '../../../hooks/useAlert';
import { RewardBatchDTO } from '../../../api/generated/merchants/data-contracts';
import { browserConsole } from '../../../utils/consoleLogger';

type StatusEnum = RewardBatchDTO['status'];
const ENABLED_DOWNLOAD_STATUSES: Array<StatusEnum> = [
  'APPROVED',
  'PENDING_REFUND',
  'REFUNDED',
  'NOT_REFUNDED',
];
const APPROVING_STATUS: StatusEnum = 'APPROVING';
import { FranchisePointOfSaleDTO } from '../../../api/generated/merchants/data-contracts';
import { MerchantDetailDTO } from '../../../api/generated/merchants/data-contracts';
import { ShopCard } from './ShopCard';

const filterByStatusOptionsList = Object.values(RewardBatchTrxStatus).filter(
  (el) => el !== RewardBatchTrxStatus.TO_CHECK
);
interface RouteParams {
  initiative_id: string;
  batch_id: string;
}

const ShopDetails: React.FC = () => {
  const { t } = useTranslation();
  const { initiative_id, batch_id } = useParams<RouteParams>();
  const [store, setStore] = useState({} as RewardBatchDTO);
  const [merchantDetail, setMerchantDetail] = useState<MerchantDetailDTO | null>(null);
  const history = useHistory();
  const [drawerRefreshKey, setDrawerRefreshKey] = useState(0);
  const [stores, setStores] = useState<Array<FranchisePointOfSaleDTO>>([]);
  const [storesLoading, setStoresLoading] = useState(false);

  const [batchDownloadIsLoading, setBatchDownloadIsLoading] = useState(false);

  const [trxCodeError, setTrxCodeError] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, string>>({
    pointOfSale: '',
    trxCode: '',
    status: '',
  });

  const { setAlert } = useAlert();

  useEffect(() => {
    if ((history.location.state as any)?.refundUploadSuccess) {
      history.replace({
        ...history.location,
        state: {
          ...(history.location.state || {}),
          refundUploadSuccess: undefined,
        },
      });
    }
  }, [history.location.key]);

  const mappedStore = useMemo(
    () => ({
      batchName: store?.name ?? '',
      dateRange: `${store?.startDate ? formatDate(new Date(store.startDate)) : ''} - ${
        store?.endDate ? formatDate(new Date(store.endDate)) : ''
      }`,
      companyName: store?.businessName || '',
      refundAmount: store?.initialAmountCents || 0,
      status: store?.status || '',
      approvedRefund: store?.approvedAmountCents || 0,
      posType: store?.posType || '',
      suspendedAmountCents: store?.suspendedAmountCents || 0,
    }),
    [store]
  );

  const formik = useFormik<any>({
    initialValues: {
      status: '',
      pointOfSaleId: '',
      trxCode: '',
      page: 0,
    },
    onSubmit: () => {
      setFilters({
        pointOfSale: formik.values.pointOfSaleId,
        trxCode: formik.values.trxCode,
        status: formik.values.status,
      });
    },
  });

  const fetchBatch = async () => {
    try {
      const response = await getRewardBatchById(initiative_id, batch_id);
      setStore(response);
      history.replace({ ...history.location, state: { store: response } });
    } catch (error: any) {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    void fetchBatch();
  }, [drawerRefreshKey]);

  useEffect(() => {
    const fetchMerchantDetail = async () => {
      try {
        const response = await getMerchantDetail(initiative_id);
        setMerchantDetail(response);
      } catch (error: any) {
        setAlert({
          title: t('errors.genericTitle'),
          text: t('errors.genericDescription'),
          isOpen: true,
          severity: 'error',
        });
      }
    };

    if (initiative_id) {
      void fetchMerchantDetail();
    }
  }, [initiative_id]);

  const fetchStores = async () => {
    const userJwt = parseJwt(storageTokenOps.read());
    const merchantId = userJwt?.merchant_id;
    if (!merchantId) {
      return;
    }
    setStoresLoading(true);
    try {
      const response = await getMerchantPointOfSalesWithTransactions(batch_id);
      setStores(response || []);
    } catch (error: any) {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    void fetchStores();
  }, []);

  const handleOnFiltersApplied = () => {
    formik.handleSubmit();
  };

  const handleOnFiltersReset = () => {
    formik.resetForm();
    setFilters({ pointOfSale: '', trxCode: '', status: '' });
  };

  const handleDownloadCsv = async () => {
    if (batch_id && initiative_id) {
      try {
        setBatchDownloadIsLoading(true);
        const response = await downloadBatchCsv(initiative_id, batch_id);
        const { approvedBatchUrl } = response;
        const filename = 'lotto.csv';

        const link = document.createElement('a');
        // eslint-disable-next-line functional/immutable-data
        link.href = approvedBatchUrl as string;
        // eslint-disable-next-line functional/immutable-data
        link.download = filename;
        link.click();
      } catch (e) {
        browserConsole.log(e);
        setAlert({
          title: t('errors.genericTitle'),
          text: t('errors.genericDescription'),
          isOpen: true,
          severity: 'error',
        });
      } finally {
        setBatchDownloadIsLoading(false);
      }
    }
  };

  const handleTrxCodeChange = useCallback((event: any) => {
    const value = event.target.value;
    const alphanumericRegex = /^[a-zA-Z0-9]*$/;
    if (value.includes(' ') || value.length > 8) {
      return;
    }
    if (!alphanumericRegex.test(value)) {
      setTrxCodeError('Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.');
      return;
    }
    setTrxCodeError('');
    formik.handleChange(event);
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
        <Box
          sx={{
            display: 'flex',
            gridColumn: 'span 12',
            alignItems: 'center',
            marginTop: 2,
            cursor: 'pointer',
          }}
          onClick={() => history.goBack()}
        >
          <ButtonNaked
            component="button"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: 'primary.main',
              fontSize: '1rem',
              marginBottom: '3px',
              marginRight: '8px',
              fontWeight: 700,
            }}
            weight="default"
            data-testid="back-button-test"
          >
            {t('commons.backBtn')}
          </ButtonNaked>
          <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '3px', marginRight: '8px' }}>
            <Typography color="text.primary" variant="body2">
              {'Bonus Elettrodomestici'}
            </Typography>
            <Typography color="text.primary" variant="body2" fontWeight="600">
              {'...'}
            </Typography>
            <Typography color="text.disabled" variant="body2">
              {store?.name}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            width: '100%',
            mt: 3,
            mb: 4,
            gridColumn: 'span 12',
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0, pr: 2 }}>
            <TitleBox
              title={store?.name ?? MISSING_DATA_PLACEHOLDER}
              mbTitle={0}
              variantTitle="h4"
              variantSubTitle="body1"
            />
          </Box>

          <Button
            startIcon={<FileDownloadIcon />}
            size="small"
            variant="contained"
            sx={{
              height: '40px',
              ml: 'auto',
            }}
            onClick={handleDownloadCsv}
            data-testid="download-csv-button-test"
            disabled={
              !ENABLED_DOWNLOAD_STATUSES.includes(store?.status as StatusEnum) ||
              batchDownloadIsLoading
            }          >
            {t('pages.refundRequests.storeDetails.exportCSV')}
            <span style={{ marginLeft: '10px' }}>
              {batchDownloadIsLoading && <CircularProgress size={20} />}
            </span>
          </Button>
        </Box>
      </Box>

      {store?.status === APPROVING_STATUS && (
        <MuiAlert
          sx={{ mb: 3 }}
          variant="outlined"
          severity="info"
          icon={<Sync sx={{ color: '#6BCFFB' }} />}
        >
          {t('pages.refundRequests.storeDetails.csv.alert')}
        </MuiAlert>
      )}

      <ShopCard
        store={mappedStore}
        iban={merchantDetail?.iban}
        ibanHolder={merchantDetail?.ibanHolder}
      />
      <Box
        sx={{
          height: 'auto',
          width: '100%',
          mt: 4,
        }}
      >
        <FiltersForm
          formik={formik}
          onFiltersApplied={handleOnFiltersApplied}
          onFiltersReset={handleOnFiltersReset}
          filtersAppliedOnce={false}
        >
          <Grid item xs={12} sm={6} md={3} lg={2.5}>
            <FormControl fullWidth size="small" disabled={storesLoading}>
              <InputLabel id="point-of-sale-label">Punto vendita</InputLabel>
              <Select
                data-testid="point-of-sale-test"
                labelId="point-of-sale-label"
                id="pointOfSaleId"
                name="pointOfSaleId"
                label={t('pages.initiativeStores.pointOfSale')}
                value={formik.values.pointOfSaleId}
                onChange={formik.handleChange}
                size="small"
                disabled={stores?.length === 0}
              >
                {stores?.map((store) => (
                  <MenuItem key={store?.pointOfSaleId} value={store?.pointOfSaleId}>
                    <Tooltip title={store?.franchiseName || MISSING_DATA_PLACEHOLDER}>
                      <span>
                        {truncateString(store?.franchiseName || MISSING_DATA_PLACEHOLDER, 40)}
                      </span>
                    </Tooltip>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={2.5}>
            <FormControl fullWidth size="small">
              <TextField
                label={t('pages.pointOfSaleTransactions.searchByTrxCode')}
                placeholder={t('pages.pointOfSaleTransactions.searchByTrxCode')}
                name="trxCode"
                aria-label="searchTrxCode"
                InputLabelProps={{ required: false }}
                value={formik.values.trxCode}
                onChange={handleTrxCodeChange}
                onBlur={() => setTrxCodeError('')}
                size="small"
                inputProps={{ maxLength: 8 }}
                error={!!trxCodeError}
                helperText={trxCodeError}
                data-testid="trxCodeFilter"
              />
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('pages.initiativeDiscounts.filterByStatus')}</InputLabel>
              <Select
                data-testid="status-test"
                id="rewardBatchTrxStatus"
                inputProps={{
                  'data-testid': 'filterStatus-select',
                }}
                name="status"
                label={t('pages.initiativeDiscounts.filterByStatus')}
                onChange={formik.handleChange}
                value={formik.values.status}
                sx={{
                  width: 165,
                }}
                size="small"
                renderValue={(selected) =>
                  selected ? <StatusChipInvoice status={selected} /> : ''
                }
                disabled={stores?.length === 0}
              >
                {filterByStatusOptionsList?.map((item) => (
                  <MenuItem key={item} value={item}>
                    <StatusChip status={item} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </FiltersForm>
        <InvoiceDataTable
          onDrawerClosed={() => setDrawerRefreshKey((prev) => prev + 1)}
          rewardBatchTrxStatus={filters.status}
          pointOfSaleId={filters.pointOfSale}
          trxCode={filters.trxCode}
        />
      </Box>
    </Box>
  );
};

export default ShopDetails;
