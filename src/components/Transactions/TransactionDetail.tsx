
import { Box, Grid, Link, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { theme } from '@pagopa/mui-italia';
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { currencyFormatter, formatValues } from '../../utils/formatUtils';
import CustomChip from '../Chip/CustomChip';
import { MISSING_DATA_PLACEHOLDER, TYPE_TEXT } from '../../utils/constants';
import { downloadInvoiceFile } from '../../services/merchantService';
import { useStore } from '../../pages/initiativeStores/StoreContext';
import getStatus from './useStatus';

type Props = {
  title?:string;
  itemValues: any;
  listItem: Array<any>;
  children?: ReactNode;
};


export default function TransactionDetail({ title, itemValues, listItem }: Props) {

  const addError = useErrorDispatcher();
  const { storeId } = useStore();

  const getStatusChip = () => {
    const chipItem = getStatus(itemValues.status);
    return <CustomChip label={chipItem?.label} colorChip={chipItem?.color} sizeChip="small" />;
  };
  const downloadFile = async (selectedTransaction: any,pointOfSaleId: string) => {
    console.log(selectedTransaction ,'transaction');
    try {
      const response = await downloadInvoiceFile(selectedTransaction?.id,pointOfSaleId);
      const { invoiceUrl } = response;
      const filename = selectedTransaction?.invoiceFile?.filename || "fattura.pdf";

      const link = document.createElement("a");
      // eslint-disable-next-line functional/immutable-data
      link.href = invoiceUrl;
      // eslint-disable-next-line functional/immutable-data
      link.download = filename;
      link.click();

    } catch (error) {
      addError({
        id: 'FILE_DOWNLOAD',
        blocking: false,
        error: new Error('Merchant ID not found'),
        techDescription: 'Merchant ID not found',
        displayableTitle: 'Errore downloand file',
        displayableDescription: 'Non è stato possibile scaricare il file',
        toNotify: true,
        component: 'Toast',
        showCloseIcon: true,
      });
    }
  };

  function getValueText(driver: string, type: TYPE_TEXT) {
    const index = Object.keys(itemValues).indexOf(driver);
    const val = Object.values(itemValues)[index] as string;
    if (driver === "additionalProperties.productName") {
      const val = Object.values(itemValues)[Object.keys(itemValues).indexOf('additionalProperties')] as any;
      return val?.productName ?? MISSING_DATA_PLACEHOLDER;
    }
    if (type === TYPE_TEXT.Text) {
      return formatValues(val);
    } else if (type === TYPE_TEXT.Currency) {
      return currencyFormatter(Number(val)/100).toString();
    } else {
      return "error on type";
    }
  };

  return (
    <Box sx={{ width: 350 }} pl={2} data-testid="product-detail">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h5">{title}</Typography>
        </Grid>
        {listItem.map((item, index) => {
          console.log('item', item);
          return (
            <Grid item xs={12} key={index}>
              <Box mt={2}>
                <Typography variant="body1">{item?.label}</Typography>
                <Typography variant="body1" fontWeight="fontWeightMedium">
                  {getValueText(item?.id, item?.type)}
                </Typography>
              </Box>
            </Grid>
          );
        })}

        <Grid item xs={12}>
          <Box mt={2}>
            <Typography variant="body1">Stato</Typography>
            {getStatusChip()}
          </Box>
        </Grid>
        <Grid item xs={12} pb={3}>
          <Box mt={2}>
            <Typography variant="body1">
              {itemValues.status === 'REFUNDED' ? 'Nota di credito'  : 'Fattura'}
            </Typography>
            <Link
              fontWeight={theme.typography.fontWeightBold}
              onClick={() => downloadFile(itemValues,storeId)}
              underline="hover"
            >
              <DescriptionOutlinedIcon />{' '}
              {itemValues?.invoiceFile?.filename ?? MISSING_DATA_PLACEHOLDER}
            </Link>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}