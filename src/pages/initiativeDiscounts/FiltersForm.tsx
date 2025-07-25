import { Box, Button, FormControl} from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import React from 'react';
import { genericContainerStyle } from '../../styles';

interface Props {
  children?: Array<React.ReactNode>;
  formik: FormikProps<{ searchUser: string; filterStatus: string }>;
  resetForm?: () => void;
}

const FiltersForm = ({children, formik, resetForm}: Props) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ ...genericContainerStyle, gap: 2, alignItems: 'baseline' }}>
      {React.Children.map(children, (child) => (<>{child}</>))}
      <FormControl sx={{ gridColumn: 'span 1' }}>
        <Button
          sx={{ height: '44.5px' }}
          variant="outlined"
          size="small"
          onClick={() => formik.handleSubmit()}
          data-testid="apply-filters-test"
        >
          {t('commons.filterBtn')}
        </Button>
      </FormControl>
      <FormControl sx={{ gridColumn: 'span 1' }}>
        <ButtonNaked
          component="button"
          sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.875rem' }}
          onClick={resetForm}
          data-testid="reset-filters-test"
        >
          {t('commons.removeFiltersBtn')}
        </ButtonNaked>
      </FormControl>
    </Box>
  );
};

export default FiltersForm;
