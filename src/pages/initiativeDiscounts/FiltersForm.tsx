import { Button, Grid } from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import React, { cloneElement, isValidElement } from 'react';
import { FormikProps } from 'formik';

interface Props<T = any> {
  children?: React.ReactNode;
  formik: FormikProps<T>;
  onFiltersApplied?: (values: T) => void;
  onFiltersReset?: () => void;
  filtersAppliedOnce?: boolean;
}

const FiltersForm = <T extends Record<string, any>>({
  children,
  formik,
  onFiltersApplied,
  onFiltersReset,
  filtersAppliedOnce
}: Props<T>) => {
  const { t } = useTranslation();

  const handleApplyFilters = () => {
    if (onFiltersApplied) {
      onFiltersApplied(formik.values);
    }
  };

  const handleResetFilters = () => {
    formik.resetForm();
    if (onFiltersReset) {
      onFiltersReset();
    }
  };

  const enhancedChildren = React.Children.map(children, (child) => {
    if (isValidElement(child) && child.props.name) {
      const fieldName = child.props.name;

      return cloneElement(child, {
        ...child.props,
        value: formik.values[fieldName] || '',
        onChange: (event: any) => {
          formik.handleChange(event);
          if (child.props.onChange) {
            child.props.onChange(event);
          }
        },
        onBlur: (event: any) => {
          formik.handleBlur(event);
          if (child.props.onBlur) {
            child.props.onBlur(event);
          }
        },
      });
    }
    return child;
  });

  return (
    <Grid container alignItems="flex-start" sx={{ margin: '20px 0', gap: '10px'}}>

      {enhancedChildren}

      <Grid item xs={12} md={3} lg={2}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>

          {/* Bottone "Applica Filtri" */}
          <Button
            sx={{ height: '44.5px' }}
            variant="outlined"
            size="small"
            onClick={handleApplyFilters}
            disabled={!formik.dirty}
            data-testid="apply-filters-test"
          >
            {t('commons.filterBtn')}
          </Button>

          {/* Bottone "Rimuovi Filtri" */}
          <ButtonNaked
            component="button"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
            onClick={handleResetFilters}
            disabled={!formik.dirty && !filtersAppliedOnce}
            data-testid="reset-filters-test"
          >
            {t('commons.removeFiltersBtn')}
          </ButtonNaked>
        </div>
      </Grid>

    </Grid>


  );
};

export default FiltersForm;
