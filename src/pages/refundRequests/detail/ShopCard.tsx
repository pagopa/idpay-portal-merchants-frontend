import { useCallback, useMemo } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import useScopedTranslation from '../../../hooks/useScopedTranslation';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import CustomChip from '../../../components/Chip/CustomChip';
import { RewardBatchTrxStatus } from '../../../api/generated/merchants/data-contracts';
import { getBatchStatus } from '../../../components/Transactions/useStatus';
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
  iban?: string;
  ibanHolder?: string;
};

const posTypeMapper: Record<string, string> = {
  PHYSICAL: 'Fisico',
  ONLINE: 'Online',
};

const StatusChip = ({ status }: any) => {
  const chipItem = getBatchStatus(status);
  return (
    <CustomChip
      label={chipItem?.label}
      colorChip={chipItem?.color}
      sizeChip="small"
      textColorChip={chipItem?.textColor}
    />
  );
};

export const ShopCard = ({ store, iban, ibanHolder }: Props) => {
  const { t } = useScopedTranslation();
  const boldStyle = { fontWeight: theme.typography.fontWeightBold };

  const {
    batchName,
    dateRange,
    companyName,
    refundAmount,
    status,
    approvedRefund,
    posType,
    suspendedAmountCents,
  } = store;

  const formatCurrency = useCallback(
    (value: number) =>
      isNaN(value) || !value.toString()
        ? MISSING_DATA_PLACEHOLDER
        : currencyFormatter(Number(value)).toString(),
    []
  );

  const details = useMemo(
    () => ({
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
          value: posTypeMapper[posType] || MISSING_DATA_PLACEHOLDER,
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
          value:
            status === 'APPROVED' ? formatCurrency(approvedRefund / 100) : MISSING_DATA_PLACEHOLDER,
          minWidth: '180px',
          marginBottom: 2,
        },
        {
          label: t('pages.refundRequests.storeDetails.suspendedRefund'),
          value:
            status === 'APPROVED'
              ? formatCurrency(suspendedAmountCents / 100)
              : MISSING_DATA_PLACEHOLDER,
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
          label: t('commons.status'),
          value: <StatusChip status={status as RewardBatchTrxStatus} />,
          minWidth: '180px',
          isStatus: true,
        },
      ],
    }),
    [store, iban, ibanHolder, status]
  );

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
                }
              >
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
