import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Button } from '@mui/material';
import { FormikProps } from 'formik';

/**
 * Formal validation of the Italian tax code (Codice Fiscale).
 * - Checks presence (not empty or only spaces)
 * - Cleans input by removing spaces and non-alphanumeric characters, then converts to uppercase
 * - Checks that the cleaned value is exactly 16 alphanumeric characters
 * - Checks that there is at least one letter and at least one number (not only letters or only numbers)
 * - (Checksum validation not implemented)
 */
export function isValidCF(cf: string): boolean {
  if (!cf || /^\s+$/.test(cf)) {
    return false;
  }

  const cleaned = String(cf)
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();

  return /^[A-Za-z0-9]{16}$/.test(cleaned) && /[A-Za-z]/.test(cleaned) && /[0-9]/.test(cleaned);
}

interface SearchTaxCodeProps<T> {
  formik: FormikProps<T>;
  onSearch: (values: T) => void;
  filtersAppliedOnce?: boolean;
}

function SearchTaxCode<T extends { cf: string }>({ formik, onSearch }: SearchTaxCodeProps<T>) {
  const { t } = useTranslation();
  const [showErrors, setShowErrors] = useState(false);

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
      formik.setFieldError('cf', t('pages.reportedUsers.insertCf'));
      return;
    }
    if (!isValidCF(cleaned)) {
      formik.setFieldError('cf', 'Codice fiscale non valido');
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
          <TextField
            fullWidth
            size="small"
            label={t('pages.reportedUsers.cf')}
            name="cf"
            value={formik.values.cf}
            onChange={(e) => {
              const raw = e.target.value || '';
              const cleaned = raw
                .replace(/[^A-Za-z0-9]/g, '')
                .toUpperCase()
                .slice(0, 16);
              formik.setFieldValue('cf', cleaned, false);
              if (cleaned === '') {
                setShowErrors(false);
                formik.setFieldError('cf', '');
              }
            }}
            error={showErrors && Boolean(formik.errors.cf)}
            helperText={showErrors ? formik.errors.cf : ''}
            FormHelperTextProps={{ sx: { minHeight: '20px' } }}
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
            sx={{ height: '44.5px', width: '100%' }}
            variant="outlined"
            size="small"
            type="submit"
            data-testid="apply-filters-test"
          >
            {t('pages.reportedUsers.filterBtn')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default SearchTaxCode;
