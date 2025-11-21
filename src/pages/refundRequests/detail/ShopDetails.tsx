import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import InvoiceDataTable from '../invoiceDataTable';
import DetailDrawer from '../../../components/Drawer/DetailDrawer';
import TransactionDetail from '../../../components/Transactions/TransactionDetail';
import getDetailFieldList from '../../../components/Transactions/useDetailList';
import { PointOfSaleTransactionProcessedDTO } from '../../../api/generated/merchants/PointOfSaleTransactionProcessedDTO';
import FiltersForm from '../../initiativeDiscounts/FiltersForm';
import getStatus from '../../../components/Transactions/useStatus';
import CustomChip from '../../../components/Chip/CustomChip';
import { ShopCard } from './ShopCard';

const ShopDetails: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<{ store: any }>();
  const store = location.state?.store;
  const history = useHistory();
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
  const [rowDetail, setRowDetail] = useState<Array<PointOfSaleTransactionProcessedDTO>>([]);
  const listItemDetail = getDetailFieldList();

  const [dataTableIsLoading, setDataTableIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const mock: PointOfSaleTransactionProcessedDTO = {
      additionalProperties: {
        productName: 'product',
        discountCode: '4T6Y7UIF',
      },
      authorizedAmountCents: 40000 as any,
      effectiveAmountCents: 50000 as any,
      fiscalCode: 'AAABBB11C22D345E',
      id: 'e5348bee-e342-4bb0-a551-42750bdf8d88',
      rewardAmountCents: 10000 as any,
      status: undefined,
      trxChargeDate: undefined,
    };

    setRowDetail([mock]);
  }, []);

  const handleToggleDrawer = (newOpen: boolean) => {
    setDrawerOpened(newOpen);
  };

  const handleListButtonClick = (row: any) => {
    setRowDetail(row);
    setDrawerOpened(true);
  };

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
        <Box sx={{ display: 'grid', gridColumn: 'span 8' }}>
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
                {'Rimborsi'}
              </Typography>
              <Typography color="text.disabled" variant="body2">
                {store?.insegna}
              </Typography>
            </Breadcrumbs>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
              mt: 3,
            }}
          >
            <TitleBox
              title={store?.insegna ?? MISSING_DATA_PLACEHOLDER}
              mbTitle={2}
              variantTitle="h4"
              variantSubTitle="body1"
            />
          </Box>
        </Box>

        <ShopCard
          batchName={store?.name}
          refundAmount={store?.refundAmount}
          status={store?.status}
        />

        <Box width="100%" pt={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => handleListButtonClick(rowDetail)}>mock drawer</Button>
        </Box>

        <Box
          sx={{
            height: 'auto',
            width: '100%',
            mt: 2,
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
                    height: 40,
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      paddingTop: 0,
                      paddingBottom: 0,
                      height: '100%',
                    },
                  }}
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

        <DetailDrawer
          data-testid="detail-drawer"
          open={drawerOpened}
          toggleDrawer={handleToggleDrawer}
        >
          <TransactionDetail
            title={'Dettaglio transazione'}
            itemValues={rowDetail[0]}
            listItem={listItemDetail}
          />
        </DetailDrawer>
      </Box>
    </>
  );
};

export default ShopDetails;
