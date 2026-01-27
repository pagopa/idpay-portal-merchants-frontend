import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { useSelector } from 'react-redux';
import { Sync } from '@mui/icons-material';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import FiltersForm from '../../initiativeDiscounts/FiltersForm';
import StatusChip from '../../../components/Chip/StatusChipInvoice';
import InvoiceDataTable from '../invoiceDataTable';
import { formatDate, formattedCurrency, truncateString } from '../../../helpers';
import { RewardBatchTrxStatusEnum } from '../../../api/generated/merchants/RewardBatchTrxStatus';
import { parseJwt } from '../../../utils/jwt-utils';
import {
  downloadBatchCsv,
  getAllRewardBatches,
  getMerchantPointOfSalesWithTransactions,
} from '../../../services/merchantService';
import StatusChipInvoice from '../../../components/Chip/StatusChipInvoice';
import { intiativesListSelector } from '../../../redux/slices/initiativesSlice';
import { useAlert } from '../../../hooks/useAlert';
import { RewardBatchDTO } from '../../../api/generated/merchants/RewardBatchDTO';
import { FranchisePointOfSaleDTO } from '../../../api/generated/merchants/FranchisePointOfSaleDTO';
import { ShopCard } from './ShopCard';

const filterByStatusOptionsList = Object.values(RewardBatchTrxStatusEnum).filter(
  (el) => el !== 'TO_CHECK'
);

const ShopDetails: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<{ store: any; batchId?: string }>();
  const staticStore = location.state?.store;
  const [store, setStore] = useState({} as RewardBatchDTO);
  const batchId = location.state?.batchId;
  const history = useHistory();
  const [drawerRefreshKey, setDrawerRefreshKey] = useState(0);
  const [stores, setStores] = useState<Array<FranchisePointOfSaleDTO>>([]);
  const [storesLoading, setStoresLoading] = useState(false);

  const [batchDownloadIsLoading, setBatchDownloadIsLoading] = useState(false);

  const [trxCodeError, setTrxCodeError] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string>>({ pointOfSale: "", trxCode: "", status: "" });
  const initiativesList = useSelector(intiativesListSelector);

  const { setAlert } = useAlert();

  const formik = useFormik<any>({
    initialValues: {
      status: '',
      pointOfSaleId: '',
      trxCode: '',
      page: 0,
    },
    onSubmit: () => {
      setFilters({ pointOfSale: formik.values.pointOfSaleId, trxCode: formik.values.trxCode, status: formik.values.status });
    },
  });

  const fetchAll = async () => {
    try {
      let response: any;
      if (initiativesList) {
        response = await getAllRewardBatches(initiativesList[0].initiativeId!);

        const match = response.content.find((e: any) => e.id === staticStore.id);
        setStore(match);
      }
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
    void fetchAll();
  }, [initiativesList, batchId, filters, drawerRefreshKey]);

  const fetchStores = async (fromSort?: boolean) => {
    const userJwt = parseJwt(storageTokenOps.read());
    const merchantId = userJwt?.merchant_id;
    if (!merchantId) {
      return;
    }
    try {
      if (!fromSort) {
        setStoresLoading(true);
      }
      const response = await getMerchantPointOfSalesWithTransactions(batchId || '');
      setStores(response as any);
      if (!fromSort) {
        setStoresLoading(false);
      }
    } catch (error: any) {
      if (!fromSort) {
        setStoresLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnFiltersApplied = () => {
    formik.handleSubmit();
  };

  const handleOnFiltersReset = () => {
    formik.resetForm();
    setFilters({ pointOfSale: '', trxCode: '', status: '' });
  };

  const handleDownloadCsv = async () => {
    if (batchId && initiativesList?.[0].initiativeId) {
      try {
        setBatchDownloadIsLoading(true);
        const response = await downloadBatchCsv(initiativesList[0].initiativeId, batchId as string);
        const { approvedBatchUrl } = response;
        const filename = 'lotto.csv';

        const link = document.createElement('a');
        // eslint-disable-next-line functional/immutable-data
        link.href = approvedBatchUrl as string;
        // eslint-disable-next-line functional/immutable-data
        link.download = filename;
        link.click();
      } catch (e) {
        console.log(e);
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
      setTrxCodeError("Il codice sconto deve contenere al massimo 8 caratteri alfanumerici.");
      return;
    }
    setTrxCodeError("");
    formik.handleChange(event);
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
        <Box sx={{ display: 'flex', gridColumn: 'span 12', alignItems: 'center', marginTop: 2 }}>
          <ButtonNaked
            component="button"
            onClick={() => history.goBack()}
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
            disabled={store?.status !== 'APPROVED' || batchDownloadIsLoading}
          >
            {t('pages.refundRequests.storeDetails.exportCSV')}
            <span style={{ marginLeft: '10px' }}>
              {batchDownloadIsLoading && <CircularProgress size={20} />}
            </span>
          </Button>
        </Box>
      </Box>

      {store?.status === 'APPROVING' && (
        <Alert
          sx={{ mb: 3 }}
          variant="outlined"
          color="info"
          icon={<Sync sx={{ color: '#6BCFFB' }} />}
        >
          {t('pages.refundRequests.storeDetails.csv.alert')}
        </Alert>
      )}

      <ShopCard
        batchName={store?.name}
        dateRange={`${formatDate(store?.startDate)} - ${formatDate(store?.endDate)}`}
        companyName={store?.businessName || ''}
        refundAmount={formattedCurrency(store?.initialAmountCents, '-', true)}
        status={store?.status || ''}
        approvedRefund={formattedCurrency(store?.approvedAmountCents, '-', true)}
        posType={store?.posType || ''}
        suspendedAmountCents={formattedCurrency(store?.suspendedAmountCents, '-', true)}
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
                labelId="point-of-sale-label"
                id="pointOfSaleId"
                name="pointOfSaleId"
                label={t('pages.initiativeStores.pointOfSale')}
                value={formik.values.pointOfSaleId}
                onChange={formik.handleChange}
                size="small"
                disabled={stores?.length === 0}
              >
                {stores.map((store) => (
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
                role="input"
                InputLabelProps={{ required: false }}
                value={formik.values.trxCode}
                onChange={handleTrxCodeChange}
                onBlur={() => setTrxCodeError("")}
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
                id="rewardBatchTrxStatus"
                inputProps={{
                  'data-testid': 'filterStatus-select',
                }}
                name="status"
                label={t('pages.initiativeDiscounts.filterByStatus')}
                placeholder={t('pages.initiativeDiscounts/filterByStatus')}
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
                {filterByStatusOptionsList.map((item) => (
                  <MenuItem key={item} value={item}>
                    <StatusChip status={item} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </FiltersForm>
        <InvoiceDataTable
          batchId={batchId}
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
