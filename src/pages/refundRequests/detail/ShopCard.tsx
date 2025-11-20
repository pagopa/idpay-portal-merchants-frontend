import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { getMerchantDetail } from '../../../services/merchantService';
import getStatus from '../../../components/Transactions/useStatus';
import CustomChip from '../../../components/Chip/CustomChip';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

export const ShopCard: React.FC = () => {
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