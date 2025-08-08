
import { Box, Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { currencyFormatter, formatValues } from '../../utils/formatUtils';
import CustomChip from '../Chip/CustomChip';
import { TYPE_TEXT } from '../../utils/constants';
import getStatus from './useStatus';

type Props = {
  title?:string;
  itemValues: any;
  listItem: Array<any>;
  children?: ReactNode;
};


export default function TransactionDetail({ title, itemValues, listItem }: Props) {

  const getStatusChip = () => {
    const chipItem = getStatus(itemValues.status);
    return <CustomChip label={chipItem?.label} colorChip={chipItem?.color} sizeChip="small" />;
  };

  function getValueText(driver: string, type: TYPE_TEXT) {
    const index = Object.keys(itemValues).indexOf(driver);
    const val = Object.values(itemValues)[index] as string;
    if (type === TYPE_TEXT.Text) {
      return formatValues(val);
    } else if (type === TYPE_TEXT.Currency) {
      return currencyFormatter(Number(val)).toString();
    } else {
      return "error on type";
    }
  };

  return (
    <Box sx={{ width: 350 }} pl={2} data-testid="product-detail">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h5">
            {title}
          </Typography>
        </Grid>
        {listItem.map((item, index) => {
          console.log("item", item);
          return (
            <Grid item xs={12} key={index}>
              <Box mt={2}>
                <Typography variant="body1">
                  {item?.label}
                </Typography>
                <Typography variant="body1" fontWeight="fontWeightMedium">
                  {getValueText(item?.id, item?.type)}
                </Typography>
              </Box>
            </Grid>);
        }
        )}

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