import { Box, Link, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { FC } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

interface LabelValuePairProps {
  label: string;
  value: string;
  isLink: boolean;
  labelXs?: number;
  valueMaxWidth?: string | number;
  valueXs?: number;
}

const ellipsisSx = {
  display: 'block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const LabelValuePair: FC<LabelValuePairProps> = ({
  label,
  value,
  isLink,
  labelXs = 5,
  valueMaxWidth = '100%',
  valueXs = 7,
}) => (
  <>
    <Grid item xs={labelXs} sx={{ minWidth: 0 }}>
      <Box mb={1} sx={{ minWidth: 0, width: '100%' }}>
        <Typography variant="body2" sx={ellipsisSx}>
          {label}:
        </Typography>
      </Box>
    </Grid>
    {!isLink ? (
      <Grid item xs={valueXs} sx={{ minWidth: 0 }}>
        <Box display="flex" mb={1} sx={{ maxWidth: valueMaxWidth, minWidth: 0, width: '100%' }}>
          <Tooltip title={value?.trim() === '' || !value ? MISSING_DATA_PLACEHOLDER : value}>
            <Typography
              fontWeight={theme.typography.fontWeightMedium}
              variant="body2"
              sx={ellipsisSx}
            >
              {value?.trim() === '' || !value ? MISSING_DATA_PLACEHOLDER : value}
            </Typography>
          </Tooltip>
        </Box>
      </Grid>
    ) : (
      <Grid item xs={valueXs} sx={{ minWidth: 0 }}>
        <Box
          mb={1}
          display="flex"
          color={theme.palette.primary.main}
          sx={{ maxWidth: valueMaxWidth, minWidth: 0, width: '100%' }}
        >
          <Tooltip title={value?.trim() === '' || !value ? MISSING_DATA_PLACEHOLDER : value}>
            <Link
              fontWeight={theme.typography.fontWeightMedium}
              href={`${value}`}
              underline="hover"
              target="blank"
              sx={ellipsisSx}
            >
              {value?.trim() === '' || !value ? MISSING_DATA_PLACEHOLDER : value}
            </Link>
          </Tooltip>
        </Box>
      </Grid>
    )}
  </>
);

export default LabelValuePair;
