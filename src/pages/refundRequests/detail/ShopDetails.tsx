import React, { useEffect, useState } from 'react';
import { Box, Typography, Breadcrumbs, Grid, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation } from 'react-router-dom';
import { ButtonNaked, theme } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import getStatus from '../../../components/Transactions/useStatus';
import CustomChip from '../../../components/Chip/CustomChip';
import { getMerchantDetail } from '../../../services/merchantService';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

const ShopCard: React.FC = () => {
  const { t } = useTranslation();
  const boldStyle = { fontWeight: theme.typography.fontWeightBold };
  const [iban, setIban] = useState<string | undefined>();
  const [ibanHolder, setIbanHolder] = useState<string | undefined>();
  const [businessName, setBusinessName] = useState<string | undefined>();
  const [batch, setBatch] = useState<string | undefined>();
  const [requestedRefund, setRequestedRefund] = useState<string | undefined>();

  useEffect(() => {
    getMerchantDetail('68dd003ccce8c534d1da22bc')
      .then((response) => {
        setIban(response?.iban);
        setIbanHolder(response?.ibanHolder);
        setBusinessName(response?.businessName);
      })
      .catch((error) =>
        console.log(error)
      );

    setBatch(undefined);
    setRequestedRefund(undefined);
  }, []);

  const getStatusChip = () => {
    const chipItem = getStatus("status");
    return <CustomChip label={chipItem?.label} colorChip={chipItem?.color} sizeChip="small" />;
  };
  
  const details = [
    {
      label: t('pages.refundRequests.storeDetails.referredBatch'),
      value: batch || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
    },
    {
      label: t('pages.refundRequests.storeDetails.holder'),
      value: ibanHolder || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
    },
    {
      label: t('pages.refundRequests.storeDetails.companyName'),
      value: businessName,
      minWidth: '180px',
    },
    {
      label: t('pages.refundRequests.storeDetails.iban'),
      value: iban || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
    },
    {
      label: t('pages.refundRequests.storeDetails.requestedRefund'),
      value: requestedRefund || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
    },
    {
      label: t('pages.refundRequests.batchTransactionsDetails.state'),
      value: getStatusChip(),
      minWidth: '180px',
    }
  ];
  
  return(
    <Paper sx={{ p: 3 }}>

      <Grid container width="100%" justifyContent="center" alignItems="center" pl={8} ml={4}>
        <Typography variant="overline">
          dati rimborso
        </Typography>
      </Grid>

      <Grid container spacing={2}>
        {details.map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box width='50%' sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ minWidth: item.minWidth, flexShrink: 0 }}>
                <Typography variant="body1">{item.label}</Typography>
              </Box>
              <Typography variant="body1" sx={boldStyle} minWidth='100%'>
                {item.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

const ShopDetails: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<{ store: any }>();
  const store = location.state?.store;

  const history = useHistory();

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
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
              mt: 3,
            }}
          >
            <TitleBox
              title={store?.name ?? MISSING_DATA_PLACEHOLDER}
              mbTitle={2}
              variantTitle="h4"
              variantSubTitle="body1"
            />
          </Box>
        </Box>

        {<ShopCard />}
      </Box>
    </>
  );
};

export default ShopDetails;
