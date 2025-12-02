import { Box, Grid, Typography, Button, CircularProgress } from '@mui/material';
import { ReactNode, useState } from 'react';
import { theme } from '@pagopa/mui-italia';
import { ReceiptLong } from '@mui/icons-material';
import { downloadInvoiceFile } from '../../../services/merchantService';
import { TYPE_TEXT, MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import { formatValues, currencyFormatter } from '../../../utils/formatUtils';
import StatusChipInvoice from '../../../components/Chip/StatusChipInvoice';
import { RewardBatchTrxStatusEnum } from '../../../api/generated/merchants/RewardBatchTrxStatus';
import { useAlert } from '../../../hooks/useAlert';

type Props = {
  title?: string;
  itemValues: any;
  listItem: Array<any>;
  storeId: string;
  children?: ReactNode;
};

export default function InvoiceDetail({ title, itemValues, listItem, storeId }: Props) {
  const {setAlert} = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadFile = async (selectedTransaction: any, pointOfSaleId: string) => {
    setIsLoading(true);
    try {
      const response = await downloadInvoiceFile(selectedTransaction?.id, pointOfSaleId);
      const invoiceUrl = response.invoiceUrl;

      const res = await fetch(invoiceUrl, {
        method: "GET",
      });

      const blob = await res.blob();

      const contentType =
        blob.type ||
        res.headers.get("Content-Type") ||
        "application/octet-stream";

      const fileUrl = URL.createObjectURL(new Blob([blob], { type: contentType }));
      window.open(fileUrl, "_blank")?.focus();

      setIsLoading(false);
    } catch (error) {
      setAlert({
        title: 'Errore downloand file',
        text: 'Non è stato possibile scaricare il file',
        isOpen: true,
        severity: 'error',
        containerStyle: { height: 'fit-content', position: 'fixed', bottom: '20px', right: '20px'},
        contentStyle: {position: 'unset', bottom: '0', right: '0'}
      });
      setIsLoading(false);
    }
  };

  function getValueText(driver: string, type: TYPE_TEXT) {
    const index = Object.keys(itemValues).indexOf(driver);
    const val = Object.values(itemValues)[index] as string;
    if (driver === 'additionalProperties.productName') {
      return itemValues?.additionalProperties?.productName ?? MISSING_DATA_PLACEHOLDER;
    }
    if (type === TYPE_TEXT.Text) {
      return formatValues(val);
    } else if (type === TYPE_TEXT.Currency) {
      return currencyFormatter(Number(val) / 100).toString();
    } else {
      return 'error on type';
    }
  }

  function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  return (
    <Box sx={{ width: 375 }} p={'1.5rem'} pt={0} data-testid="product-detail">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h6">{title}</Typography>
        </Grid>
        {listItem.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Box mt={1}>
              <Typography
                variant="body2"
                fontWeight={theme.typography.fontWeightRegular}
                color={theme.palette.text.secondary}
              >
                {item?.label}
              </Typography>
              <Typography variant="body2" fontWeight="fontWeightMedium">
                {item.format
                  ? item.format(getNestedValue(itemValues, item?.id))
                  : getValueText(item?.id, item?.type)}
              </Typography>
            </Box>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box mt={1}>
            <Typography
              variant="body2"
              fontWeight={theme.typography.fontWeightRegular}
              color={theme.palette.text.secondary}
            >
              {itemValues.status === 'REFUNDED' ? 'Numero nota di credito' : 'Numero fattura'}
            </Typography>
            <Typography variant="body2" fontWeight={theme.typography.fontWeightMedium}>
              {itemValues?.invoiceDocNumber ?? MISSING_DATA_PLACEHOLDER}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mt={1}>
            <Typography
              variant="body2"
              fontWeight={theme.typography.fontWeightRegular}
              color={theme.palette.text.secondary}
            >
              {itemValues.status === 'REFUNDED' ? 'Nota di credito' : 'Fattura'}
            </Typography>
            <Button
              data-testid="btn-test"
              sx={{
                padding: '0',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#0055AA',
                },
              }}
              onClick={() => handleDownloadFile(itemValues, storeId)}
            >
              {isLoading ? (
                <CircularProgress color="inherit" size={20} data-testid="item-loader" />
              ) : (
                <>
                  <ReceiptLong /> {itemValues?.invoiceFileName ?? MISSING_DATA_PLACEHOLDER}
                </>
              )}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box mt={1}>
            <Typography
              variant="body2"
              fontWeight={theme.typography.fontWeightRegular}
              color={theme.palette.text.secondary}
            >
              Stato
            </Typography>
            <StatusChipInvoice status={itemValues?.rewardBatchTrxStatus} />
          </Box>
        </Grid>
        {[RewardBatchTrxStatusEnum.SUSPENDED,RewardBatchTrxStatusEnum.REJECTED].includes(itemValues.rewardBatchTrxStatus) &&
          <Grid item xs={12}>
            <Box mt={1}>
              <Typography
                variant="overline"
                fontWeight={theme.typography.fontWeightBold}
                color={theme.palette.text.primary}
              >
                nota ufficiale
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {itemValues?.rewardBatchRejectionReason ?? MISSING_DATA_PLACEHOLDER}
              </Typography>
            </Box>
          </Grid>
        }
      </Grid>
    </Box>
  );
}
