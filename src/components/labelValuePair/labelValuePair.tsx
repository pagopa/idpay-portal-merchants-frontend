import { Box, Grid, Link, Tooltip, Typography } from '@mui/material';
import { FC } from 'react';
import { theme } from "@pagopa/mui-italia/dist/theme/theme.js";
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';


interface LabelValuePairProps {
  label: string;
  value: string;
  isLink: boolean;

}

const LabelValuePair: FC<LabelValuePairProps> = ({ label, value, isLink }) => (
  <>
    <Grid item xs={5}>
      <Box mb={1}>
        <Typography variant="body2">
          {label}:
        </Typography>
      </Box>
    </Grid>
    {!isLink ?
      <Grid item xs={7}>
        <Box mb={1}>
          <Tooltip title={value ?? MISSING_DATA_PLACEHOLDER}>
            <Typography
              fontWeight={theme.typography.fontWeightMedium}
              variant="body2"
            >
              {value ?? MISSING_DATA_PLACEHOLDER}
            </Typography>
          </Tooltip>
        </Box>
      </Grid>
      :
      <Grid item xs={7}>
        <Box
          mb={1}
          display={'-webkit-box'}
          overflow={'hidden'}
          textOverflow={'ellipsis'}
          color={theme.palette.primary.main}
          sx={{
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word'
          }}
        >
          <Tooltip title={value ?? MISSING_DATA_PLACEHOLDER}>
            <Link
              fontWeight={theme.typography.fontWeightMedium}
              href={`${value}`}
              underline="hover"
              target='blank'
            >
              {value ?? MISSING_DATA_PLACEHOLDER}
            </Link>
          </Tooltip>
        </Box>
      </Grid>
    }
  </>
);

export default LabelValuePair;
