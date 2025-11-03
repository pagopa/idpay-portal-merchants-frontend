import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import { FormikProps } from 'formik';
import { isValidCF } from './helpersReportedUsers';
import CfTextField from './CfTextField';

interface SearchTaxCodeProps<T> {
  formik: FormikProps<T>;
  onSearch: (values: T) => void;
  filtersAppliedOnce?: boolean;
}

function SearchTaxCode<T extends { cf: string }>({ formik, onSearch }: SearchTaxCodeProps<T>) {
  const { t } = useTranslation();
  const [showErrors, setShowErrors] = useState(false);

  const cfButtonStyle = {
    fontFamily: "'Titillium Web', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: '21px',
    letterSpacing: 0.3,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    const raw = formik.values.cf || '';
    const cleaned = raw
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .trim();
    formik.setFieldValue('cf', cleaned, false);
    if (!cleaned) {
      formik.setFieldError('cf', t('pages.reportedUsers.cf.insertCf'));
      return;
    }
    if (!isValidCF(cleaned)) {
      formik.setFieldError('cf', t('pages.reportedUsers.cf.invalid'));
      return;
    }
    onSearch({ ...formik.values, cf: cleaned });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box
          sx={{
            minWidth: 220,
            minHeight: '72px',
            flexBasis: { xs: '100%', sm: '50%', md: '25%', lg: '25%' },
            flexGrow: 0,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <CfTextField
            formik={formik}
            showErrors={showErrors}
            setShowErrors={setShowErrors}
            label={t('pages.reportedUsers.cfPlaceholder')}
            name="cf"
          />
        </Box>
        <Box
          sx={{
            minWidth: 100,
            maxWidth: 160,
            flexBasis: { xs: '100%', sm: '50%', md: '8.33%', lg: '8.33%' },
            flexGrow: 0,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <Button
            sx={{ height: '44.5px', width: '100%', ...cfButtonStyle }}
            variant="outlined"
            size="small"
            type="submit"
            data-testid="btn-filters-cf"
          >
            {t('pages.reportedUsers.filterBtn')}
          </Button>
        </Box>
        <Box
          sx={{
            minWidth: 100,
            maxWidth: 160,
            flexBasis: { xs: '100%', sm: '50%', md: '8.33%', lg: '8.33%' },
            flexGrow: 0,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <Button
            variant="text"
            onClick={() => formik.setFieldValue('cf', '')}
            data-testid="btn-cancel-cf"
            sx={cfButtonStyle}
          >
            {t('pages.reportedUsers.cancelBtn')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default SearchTaxCode;
