import { Box, Grid, Typography,Button, CircularProgress } from '@mui/material';
import { ReactNode, useState } from 'react';
import { theme } from '@pagopa/mui-italia';
import { ReceiptLong } from '@mui/icons-material';
import { currencyFormatter, formatValues } from '../../utils/formatUtils';
import CustomChip from '../Chip/CustomChip';
import { MISSING_DATA_PLACEHOLDER, TYPE_TEXT } from '../../utils/constants';
import { downloadInvoiceFile } from '../../services/merchantService';
import { useStore } from '../../pages/initiativeStores/StoreContext';
import { useAlert } from '../../hooks/useAlert';
import getStatus from './useStatus';

type Props = {
  title?: string;
  itemValues: any;
  listItem: Array<any>;
  children?: ReactNode;
};

export default function TransactionDetail({ title, itemValues, listItem }: Props) {
  const {setAlert} = useAlert();
  const { storeId } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusChip = () => {
    const chipItem = getStatus(itemValues.status);
    return <CustomChip label={chipItem?.label} colorChip={chipItem?.color} sizeChip="small" />;
  };
  const downloadFile = async (selectedTransaction: any, pointOfSaleId: string) => {
    setIsLoading(true);
    try {
      const response = await downloadInvoiceFile(selectedTransaction?.id, pointOfSaleId);
      const { invoiceUrl } = response;
      const filename = selectedTransaction?.invoiceFile?.filename || 'fattura.pdf';

      const link = document.createElement('a');
      // eslint-disable-next-line functional/immutable-data
      link.href = invoiceUrl;
      // eslint-disable-next-line functional/immutable-data
      link.download = filename;
      link.click();
      setIsLoading(false);
    } catch (error) {
      setAlert({
        title: 'Errore download file',
        text: 'Non è stato possibile scaricare il file',
        isOpen: true,
        severity: 'error',
        containerStyle: { height: 'fit-content', position: 'fixed', bottom: '20px', right: '20px', zIndex: '1300'},
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

  return (
    <Box sx={{ width: 375 }} p={'1.5rem'} pt={0} data-testid="product-detail">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h6">{title}</Typography>
        </Grid>
        {listItem.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Box
              mt={1}
              sx={{
                wordBreak: 'break-word'
              }}
            >
              <Typography
                variant="body2"
                fontWeight={theme.typography.fontWeightRegular}
                color={theme.palette.text.secondary}
              >
                {item?.label}
              </Typography>
              <Typography variant="body2" fontWeight="fontWeightMedium">
                {getValueText(item?.id, item?.type)}
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
              Stato
            </Typography>
            {getStatusChip()}
          </Box>
        </Grid>
        {itemValues.status !== 'CANCELLED' && (
          <>
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
                  {itemValues?.invoiceFile?.docNumber ?? MISSING_DATA_PLACEHOLDER}
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
                    padding: 0,
                    width: '100%',
                    display: 'block',
                    textAlign: 'left',
                    minWidth: 0,
                    maxWidth: '100%',
                    minHeight: 'fit-content',
                    height: 'auto',
                    '&:hover': {
                      backgroundColor: '#fff',
                      color: '#0055AA',
                    },
                  }}
                  onClick={() => downloadFile(itemValues, storeId)}
                >
                  {isLoading ? (
                    <CircularProgress color="inherit" size={20} data-testid="item-loader" />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: '6px',
                        width: "100%",
                        mt: '2px',
                        textAlign: "left"
                      }}
                    >
                      <ReceiptLong sx={{ flexShrink: 0, mt: 2 }} />
                      <Typography
                        component="span"
                        variant="inherit"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          minWidth: 0,
                          flex: 1,
                          marginTop:2
                        }}
                      >
                        {itemValues?.invoiceFile?.filename ?? MISSING_DATA_PLACEHOLDER}
                      </Typography>
                    </Box>
                  )}
                </Button>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}
