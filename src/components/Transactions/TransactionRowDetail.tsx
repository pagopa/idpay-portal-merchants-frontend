import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  label: string;
  value: ReactNode;
  labelVariant?: 'body1' | 'body2';
  valueVariant?: 'body2' | 'h6';
  sx?: object;
};

export default function TransactionRowDetail({sx, labelVariant, valueVariant ,label, value}:Props) {
  return (
    <Box sx={{ my: 1, ...sx }}>
        <Typography variant={labelVariant} color="text.secondary">
          {label}
        </Typography>
        <Typography variant={valueVariant} fontWeight="fontWeightMedium">
          {value}
        </Typography>
      </Box>
  );
}
