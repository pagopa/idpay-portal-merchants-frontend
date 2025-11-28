import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { getMerchantDetail } from '../../../services/merchantService';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import CustomChip from '../../../components/Chip/CustomChip';
import { RewardBatchTrxStatusEnum } from '../../../api/generated/merchants/RewardBatchTrxStatus';
import getStatus from '../../../components/Transactions/useStatus';

type Props = {
  batchName: string;
  dateRange: string;
  companyName: string;
  refundAmount: string;
  status: string;
  approvedRefund: string;
};

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

export const ShopCard = ({
  batchName,
  dateRange,
  companyName,
  refundAmount,
  status,
  approvedRefund,
}: Props) => {
  const { t } = useTranslation();
  const boldStyle = { fontWeight: theme.typography.fontWeightBold };
  const [iban, setIban] = useState<string | undefined>();
  const [ibanHolder, setIbanHolder] = useState<string | undefined>();

  useEffect(() => {
    getMerchantDetail('68dd003ccce8c534d1da22bc')
      .then((response) => {
        setIban(response?.iban);
        setIbanHolder(response?.ibanHolder);
      })
      .catch((error) => console.log(error));
  }, []);

  const detailsSx = [
    {
      label: t('pages.refundRequests.storeDetails.referredBatch'),
      value: batchName || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
      marginBottom: 2,
    },
    {
      label: t('pages.refundRequests.storeDetails.referencePeriod'),
      value: dateRange || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
      marginBottom: 2,
    },
    {
      label: t('pages.refundRequests.storeDetails.companyName'),
      value: companyName,
      minWidth: '180px',
      marginBottom: 2,
    },
    {},
    {
      label: t('pages.refundRequests.storeDetails.requestedRefund'),
      value: refundAmount || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
      marginBottom: 2,
    },
    {
      label: t('pages.refundRequests.storeDetails.approvedRefund'),
      value: approvedRefund || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
    },
  ];

  const detailsDx = [
    {
      label: t('pages.refundRequests.storeDetails.holder'),
      value: ibanHolder || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
      marginTop: 1,
    },
    {
      label: t('pages.refundRequests.storeDetails.iban'),
      value: iban || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
      marginBottom: 6,
    },
    {
      label: t('pages.refundRequests.batchTransactionsDetails.state'),
      value: <StatusChip status={status as RewardBatchTrxStatusEnum} />,
      minWidth: '180px',
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container width="100%" spacing={2}>
        <Grid item xs={6}>
          {detailsSx.map((item, index) => (
            <Box key={index} sx={{ display: 'flex' }}>
              <Box sx={{ minWidth: item.minWidth, marginBottom: item.marginBottom }}>
                <Typography variant="body1">{item.label}</Typography>
              </Box>
              <Typography variant="body1" sx={boldStyle} minWidth="100%">
                {item.value}
              </Typography>
            </Box>
          ))}
        </Grid>

        <Grid item xs={6}>
          <Typography variant="overline">
            {t('pages.refundRequests.storeDetails.detailCardTitleDx')}
          </Typography>
          {/* eslint-disable-next-line sonarjs/no-identical-functions */}
          {detailsDx.map((item, index) => (
            <Box key={index} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  minWidth: item.minWidth,
                  marginBottom: item.marginBottom,
                  marginTop: item.marginTop,
                }}
              >
                <Typography variant="body1">{item.label}</Typography>
              </Box>
              <Typography variant="body1" sx={boldStyle} minWidth="100%">
                {item.value}
              </Typography>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};
