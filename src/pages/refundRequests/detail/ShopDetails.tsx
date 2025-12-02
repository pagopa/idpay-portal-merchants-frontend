import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import FiltersForm from '../../initiativeDiscounts/FiltersForm';
import StatusChip from '../../../components/Chip/StatusChipInvoice';
import InvoiceDataTable from '../invoiceDataTable';
import { formatDate, formattedCurrency } from '../../../helpers';
import { RewardBatchTrxStatusEnum } from '../../../api/generated/merchants/RewardBatchTrxStatus';
import { parseJwt } from '../../../utils/jwt-utils';
import { getMerchantPointOfSales } from '../../../services/merchantService';
import { PointOfSaleDTO } from '../../../api/generated/merchants/PointOfSaleDTO';
import StatusChipInvoice from '../../../components/Chip/StatusChipInvoice';
import { ShopCard } from './ShopCard';

const PAGINATION_SIZE = 200;

const filterByStatusOptionsList = Object.values(RewardBatchTrxStatusEnum).filter(el=> el!== "TO_CHECK");

const ShopDetails: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<{ store: any; batchId?: string }>();
  const store = location.state?.store;
  const batchId = location.state?.batchId;
  const history = useHistory();
  const [dataTableIsLoading, setDataTableIsLoading] = useState<boolean>(false);

  const [stores, setStores] = useState<Array<PointOfSaleDTO>>([]);
  const [storesLoading, setStoresLoading] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPointOfSaleId, setSelectedPointOfSaleId] = useState<string>('');

  const formik = useFormik<any>({
    initialValues: {
      status: '',
      pointOfSaleId: '',
      page: 0,
    },
    onSubmit: () => {
      setSelectedStatus(formik.values.status);
      setSelectedPointOfSaleId(formik.values.pointOfSaleId);
      setDataTableIsLoading(true);
      setTimeout(() => {
        setDataTableIsLoading(false);
      }, 1000);
    },
  });

  const fetchStores = async (filters: any, fromSort?: boolean) => {
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
        sort: "franchiseName,asc",
        page: filters.page ?? 0,
        size: PAGINATION_SIZE,
      });
      const { content } = response;
      setStores(content);
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
    void fetchStores({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnFiltersApplied = () => {
    formik.handleSubmit();
  };

  const handleOnFiltersReset = () => {
    formik.resetForm();
    setSelectedStatus('');
    setSelectedPointOfSaleId('');
  };

  return (
    <>
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
              onClick={() => {}}
              data-testid="download-csv-button-test"
              disabled
            >
              {t('pages.refundRequests.storeDetails.exportCSV')}
            </Button>
          </Box>
        </Box>

        <ShopCard
          batchName={store?.name}
          dateRange={`${formatDate(store?.startDate)} - ${formatDate(store?.endDate)}`}
          companyName={store?.businessName}
          refundAmount={formattedCurrency(store?.initialAmountCents,'-', true)}
          status={store?.status}
          approvedRefund={formattedCurrency(store?.approvedAmountCents,'-', true)}
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
            <Grid item lg={3}>
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
                >
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.franchiseName || MISSING_DATA_PLACEHOLDER}
                    </MenuItem>
                  ))}
                </Select>
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
                  renderValue={(selected) => (selected ? <StatusChipInvoice status={selected} /> : '')}
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
          {dataTableIsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress />
            </Box>
          )}
          <InvoiceDataTable
            batchId={batchId}
            rewardBatchTrxStatus={selectedStatus}
            pointOfSaleId={selectedPointOfSaleId}
          />
        </Box>
      </Box>
    </>
  );
};

export default ShopDetails;
