import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import useScopedTranslation from '../../hooks/useScopedTranslation';

interface NoResultPaperProps {
  translationKey: string;
}

const NoResultPaper: React.FC<NoResultPaperProps> = ({ translationKey }) => {
  const { t } = useScopedTranslation();
  return (
    <Paper
      sx={{
        my: 4,
        p: 3,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={0.5} direction="row">
        <Typography variant="body2">{t(translationKey)}</Typography>
      </Stack>
    </Paper>
  );
};

export default NoResultPaper;
