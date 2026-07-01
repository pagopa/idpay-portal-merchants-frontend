import { Box, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia/theme';
import { ReactNode } from 'react';

interface Props {
  titleBox: string;
  children?: ReactNode;
}

export default function InitiativeDetailCard({ titleBox, children }: Props) {
  return (
    <Box
      py={3}
      px={4}
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxSizing: 'border-box',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box mb={2}>
        <Typography
          variant="body1"
          fontWeight={theme.typography.fontWeightBold}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {titleBox}
        </Typography>
      </Box>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  );
}
