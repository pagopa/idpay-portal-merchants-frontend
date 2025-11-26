import React, { useState } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  CircularProgress, Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import FiltersForm from '../../initiativeDiscounts/FiltersForm';
import getStatus from '../../../components/Transactions/useStatus';
import CustomChip from '../../../components/Chip/CustomChip';
import InvoiceDataTable from '../invoiceDataTable';
import { formatDate, formattedCurrency } from '../../../helpers';
import { ShopCard } from './ShopCard';

const ShopDetails: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<{ store: any }>();
  const store = location.state?.store;
  const history = useHistory();
  const [dataTableIsLoading, setDataTableIsLoading] = useState<boolean>(false);

  const formik = useFormik<any>({
    initialValues: {
      status: '',
      date: '',
      page: 0,
    },
    onSubmit: () => {
      setDataTableIsLoading(true);
      setTimeout(() => {
        setDataTableIsLoading(false);
      }, 1000);
    },
  });

  const filterByStatusOptionsList = [
    { value: 'REFUNDED', label: t('commons.discountStatusEnum.refunded') },
    { value: 'CANCELLED', label: t('commons.discountStatusEnum.cancelled') },
    { value: 'REWARDED', label: t('commons.discountStatusEnum.rewarded') },
    { value: 'INVOICED', label: t('commons.discountStatusEnum.invoiced') },
  ];

  const StatusChip = ({ status }: any) => {
    const chipItem = getStatus(status);
    return (
      <CustomChip
        label={chipItem?.label}
        colorChip={chipItem?.color}
        sizeChip="small"
        textColorChip={chipItem?.textColor}
      />
    );
  };

  const handleOnFiltersApplied = () => {
    formik.handleSubmit();
  };

  const handleOnFiltersReset = () => {
    formik.resetForm();
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
              gridColumn: 'span 12'
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
                height: '43px',
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
          refundAmount={formattedCurrency(store?.totalAmountCents)}
          status={store?.status}
          approvedRefund={formattedCurrency(store?.approvedAmountCents)}
        />

        <Box
          sx={{
            height: 'auto',
            width: '100%',
            mt: 4,
            '& .MuiDataGrid-footerContainer': { display: 'none' },
          }}
        >
          <FiltersForm
            formik={formik}
            onFiltersApplied={handleOnFiltersApplied}
            onFiltersReset={handleOnFiltersReset}
            filtersAppliedOnce={false}
          >
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <FormControl fullWidth size="small">
                <TextField
                  label={t('pages.initiativeDiscounts.filterByDate')}
                  placeholder={t('pages.initiativeDiscounts.filterByDate')}
                  name="date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  size="small"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>{t('pages.initiativeDiscounts.filterByStatus')}</InputLabel>
                <Select
                  id="status"
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
                >
                  {filterByStatusOptionsList.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      <StatusChip status={item.value} />
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
          <InvoiceDataTable />
        </Box>
      </Box>
    </>
  );
};

export default ShopDetails;
