import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import { Box, Grid, Paper, Tooltip, Typography } from '@mui/material';
import { getMerchantDetail } from '../../../services/merchantService';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import CustomChip from '../../../components/Chip/CustomChip';
import { RewardBatchTrxStatusEnum } from '../../../api/generated/merchants/RewardBatchTrxStatus';
import getStatus from '../../../components/Transactions/useStatus';
import { currencyFormatter } from '../../../utils/formatUtils';

type Props = {
  store: {
  batchName: string;
  dateRange: string;
  companyName: string;
  refundAmount: number;
  status: string;
  approvedRefund: number;
  posType: string;
  suspendedAmountCents: number;
};
};

const posTypeMapper = (posType: string) => {
  switch (posType) {
    case 'PHYSICAL':
      return 'Fisico';
    case 'ONLINE':
      return 'Online';
    default:
      return posType;
  }
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

export const ShopCard = ({store}: Props) => {
  const { t } = useTranslation();
  const boldStyle = { fontWeight: theme.typography.fontWeightBold };
  const [iban, setIban] = useState<string | undefined>();
  const [ibanHolder, setIbanHolder] = useState<string | undefined>();

  const {
    batchName,
    dateRange,
    companyName,
    refundAmount,
    status,
    approvedRefund,
    posType,
    suspendedAmountCents } = store;

  useEffect(() => {
    getMerchantDetail('68dd003ccce8c534d1da22bc')
      .then((response) => {
        setIban(response?.iban);
        setIbanHolder(response?.ibanHolder);
      })
      .catch((error) => console.log(error));
  }, []);

  const formatCurrency = useCallback((value: number) => isNaN(value) || (!value.toString()) ? MISSING_DATA_PLACEHOLDER : currencyFormatter(Number(value)).toString(), []);

  const details = useMemo(() => ({
    detailsSx: [
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
      label: t('pages.refundRequests.storeDetails.posType'),
      value: posTypeMapper(posType) || MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
      marginBottom: 2,
    },
    {
      label: t('pages.refundRequests.storeDetails.companyName'),
      value: companyName,
      minWidth: '180px',
      marginBottom: 2,
    },
    {
      label: t('pages.refundRequests.storeDetails.requestedRefund'),
      value: formatCurrency(refundAmount / 100),
      minWidth: '180px',
      marginBottom: 2,
    },
    {
      label: t('pages.refundRequests.storeDetails.approvedRefund'),
      value: status === 'APPROVED' ? formatCurrency(approvedRefund / 100) : MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
      marginBottom: 2,
    },
    {
      label: t('pages.refundRequests.storeDetails.suspendedRefund'),
      value: status === 'APPROVED' ? formatCurrency(suspendedAmountCents / 100) : MISSING_DATA_PLACEHOLDER,
      minWidth: '180px',
    },
  ],
  detailsDx: [
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
      isStatus: true,
    },
  ]
}), [store]);

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container width="100%" spacing={2}>
        <Grid item xs={6}>
          {details.detailsSx.map((item, index) => (
            <Box key={index} sx={{ display: 'flex' }}>
              <Box sx={{ minWidth: item.minWidth, marginBottom: item.marginBottom }}>
                <Typography variant="body1">{item.label}</Typography>
              </Box>
              <Tooltip
                title={
                  item?.value?.trim() === '' || !item?.value
                    ? MISSING_DATA_PLACEHOLDER
                    : item?.value
                }>
                <Typography variant="body1" sx={{ ...boldStyle, height: 'fit-content' }}>
                  {item.value?.trim() === '' || !item.value
                    ? MISSING_DATA_PLACEHOLDER
                    : item?.value}
                </Typography>
              </Tooltip>
            </Box>
          ))}
        </Grid>

        <Grid item xs={6}>
          <Typography variant="overline">
            {t('pages.refundRequests.storeDetails.detailCardTitleDx')}
          </Typography>
          {/* eslint-disable-next-line sonarjs/no-identical-functions */}
          {details.detailsDx.map((item, index) => (
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
              {!item?.isStatus ? (
                <Tooltip
                  title={
                    item?.value === '' || !item?.value ? MISSING_DATA_PLACEHOLDER : item?.value
                  }
                >
                  <Typography
                    variant="body1"
                    sx={{ ...boldStyle, marginTop: item.marginTop, height: 'fit-content' }}
                  >
                    {item?.value === '' || !item?.value ? MISSING_DATA_PLACEHOLDER : item?.value}
                  </Typography>
                </Tooltip>
              ) : (
                <Box
                  sx={{
                    minWidth: item.minWidth,
                    marginBottom: item.marginBottom,
                    marginTop: item.marginTop,
                  }}
                >
                  {item?.value}
                </Box>
              )}
            </Box>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};
