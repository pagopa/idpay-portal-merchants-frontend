import { Box, Typography } from '@mui/material';
import { FC } from 'react';
import {theme} from "@pagopa/mui-italia/dist/theme/theme.js";
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

interface LabelValuePairProps {
  label: string;
  value: string;

}

const LabelValuePair: FC<LabelValuePairProps> = ({ label, value, }) => (
  <Box
    display={'flex'}
    flexDirection={'row'}
    alignItems={'flex-start'}
    gap={2}
    mb={2}
  >
    <Typography
      fontWeight={theme.typography.fontWeightRegular}
      minWidth={'30%'}
      variant="body2"
      color="text.primary"
    >
      {label}:
    </Typography>

    <Typography
      flex={1}
      fontWeight={theme.typography.fontWeightMedium}
      variant="body2"
      color="text.primary"
    >
      {value ? value : MISSING_DATA_PLACEHOLDER}
    </Typography>
  </Box>
);

export default LabelValuePair;
