
import { Box, Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { formatValues } from '../../utils/formatUtils';
import { formattedCurrency } from '../../helpers';
import CustomChip from '../Chip/CustomChip';
import getStatus from './useStatus';

type Props = {
  item: any;
  children?: ReactNode;
};
// type Props = {
//   open: boolean;
//   data: ProductDTO;
//   isInvitaliaUser: boolean;
//   onUpdateTable?: () => void;
//   onClose?: () => void;
// };

export default function TransactionDetail({ item }: Props) {
  // const { t } = useTranslation();
  // const detailItem = [
  //   { label: "test", value: "prova", id: "trxDate" }
  // ];
  const getStatusChip = () => {
    const chipItem = getStatus(item.status);
    return <CustomChip label={chipItem?.label} colorChip={chipItem?.color} sizeChip="small" />;
  };

  return (
    <Box sx={{ width: 350 }} pl={2} data-testid="product-detail">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h5">
            Dettaglio Transazione
          </Typography>
        </Grid>
        {/* {detailItem.map((item, index) =>{
        console.log("item", item);
        return(
        <Grid item xs={12} key={index}>
          <Box mt={2}>
            <Typography variant="body1">
             {item?.label}
            </Typography>
              <Typography variant="body1" fontWeight="fontWeightMedium">
             {item?.value}
            </Typography>
          </Box>
          
        </Grid>);} 
)} */}
        <Grid item xs={12}>
          <Box mt={2}>
            <Typography variant="body1">
              Data e ora
            </Typography>
            <Typography variant="body1" fontWeight="fontWeightMedium">
              {formatValues(item?.trxDate)}
            </Typography>
          </Box>
        </Grid>
        {/* <Grid item xs={12}>
          <Box mt={2}>
            <Typography variant="body1">
              Categoria
            </Typography>
            <Typography variant="body1" fontWeight="fontWeightMedium">
               {formatValues(item?.)}
            </Typography>
          </Box>
        </Grid> */}
        {/* <Grid item xs={12}>
          <Box mt={2}>
            <Typography variant="body1">
              Modello
            </Typography>
            <Typography variant="body1" fontWeight="fontWeightMedium">
              {formatValues(item?.)}
            </Typography>
          </Box>
        </Grid> */}

        <Grid item xs={12}>
          <Box mt={2}>
            <Typography variant="body1">
              Codice Fiscale
            </Typography>
            <Typography variant="body1" fontWeight="fontWeightMedium">
              {formatValues(item?.fiscalCode)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mt={2}>
            <Typography variant="body1">
              Totale della spesa
            </Typography>
            <Typography variant="body1" fontWeight="fontWeightMedium">
              {formatValues(formattedCurrency(item?.trxExpirationSeconds))}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mt={2}>
            <Typography variant="body1">
              Importo autorizzato
            </Typography>
            <Typography variant="body1" fontWeight="fontWeightMedium">
              {formatValues(formattedCurrency(item?.rewardAmountCents))}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mt={2}>
            <Typography variant="body1">
              Stato
            </Typography>
            {getStatusChip()}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}