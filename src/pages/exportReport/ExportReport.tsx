import React from 'react';
import { Box, Stack } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';

const ExportReport: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box sx={{ my: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, md: 3 }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <TitleBox
            title={t('pages.reportExport.title')}
            subTitle={t('pages.reportExport.subtitle')}
            mbTitle={2}
            variantTitle="h4"
            variantSubTitle="body1"
          />
        </Stack>
      </Box>
    </>
  );
};

export default ExportReport;
