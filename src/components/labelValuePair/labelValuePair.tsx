import { Box, Link, Typography } from '@mui/material';
import { FC } from 'react';
import {theme} from "@pagopa/mui-italia/dist/theme/theme.js";
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

interface LabelValuePairProps {
  label: string;
  value: string;
  isLink: boolean;

}

const LabelValuePair: FC<LabelValuePairProps> = ({ label, value, isLink}) => (
  <Box display={'flex'} flexDirection={'row'} gap={5} mb={2}>
    <Typography
      fontWeight={theme.typography.fontWeightRegular}
      minWidth={'30%'}
      variant="body2"
      color="text.primary"
    >
      {label}:
    </Typography>

    { !isLink ?
      <Typography
        fontWeight={theme.typography.fontWeightMedium}
        variant="body2"
        color="text.primary"
      >
        {value ?? MISSING_DATA_PLACEHOLDER}
      </Typography>

      :
      <Link
        fontWeight={theme.typography.fontWeightBold}
        href={`${value}`}
        underline="hover"
      >
        {value ?? MISSING_DATA_PLACEHOLDER}
      </Link>
    }
  </Box>
);

export default LabelValuePair;
