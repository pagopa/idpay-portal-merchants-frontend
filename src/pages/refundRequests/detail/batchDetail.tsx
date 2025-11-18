import { memo } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import getStatus from '../../../components/Transactions/useStatus';
import CustomChip from '../../../components/Chip/CustomChip';

export interface Batch {
  refundAmount?: number;
  referencePeriod?: string;
  status?: string;
}

interface Props {
  batch: Batch;
}

const BatchDetail = memo(({ batch }: Props) => {
  const { t } = useTranslation();
  const boldStyle = { fontWeight: theme.typography.fontWeightBold };

  const getStatusChip = () => {
    const chipItem = getStatus(batch?.status);
    return <CustomChip label={chipItem?.label} colorChip={chipItem?.color} sizeChip="small" />;
  };

  const details = [
    {
      label: t('pages.refundRequests.batchTransactionsDetails.referencePeriod'),
      value: batch?.referencePeriod ?? '-',
      minWidth: '180px',
    },
    {
      label: t('pages.refundRequests.batchTransactionsDetails.state'),
      value: getStatusChip(),
      minWidth: '50px',
    },
    {
      label: t('pages.refundRequests.batchTransactionsDetails.requestedRefund'),
      value: batch?.refundAmount ?? '-',
      minWidth: '180px',
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {details.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ minWidth: item.minWidth, flexShrink: 0 }}>
                  <Typography variant="body1">{item.label}</Typography>
                </Box>
                <Typography variant="body1" sx={boldStyle}>
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
});

export default BatchDetail;