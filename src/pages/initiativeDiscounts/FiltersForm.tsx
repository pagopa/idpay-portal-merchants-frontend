import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import { genericContainerStyle } from '../../styles';

interface Props {
  formik: FormikProps<{ searchUser: string; filterStatus: string }>;
  resetForm: () => void;
  filterByStatusOptionsList: Array<{ value: string; label: string }>;
}

const FiltersForm = ({ formik, resetForm, filterByStatusOptionsList }: Props) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ ...genericContainerStyle, gap: 2, alignItems: 'baseline' }}>
      <FormControl sx={{ gridColumn: 'span 4' }}>
        <TextField
          label={t('pages.initiativeDiscounts.searchByFiscalCode')}
          placeholder={t('pages.initiativeDiscounts.searchByFiscalCode')}
          name="searchUser"
          aria-label="searchUser"
          role="input"
          InputLabelProps={{ required: false }}
          value={formik.values.searchUser}
          onChange={(e) => formik.handleChange(e)}
          size="small"
          data-testid="searchUser-test"
        />
      </FormControl>
      <FormControl sx={{ gridColumn: 'span 2' }} size="small">
        <InputLabel>{t('pages.initiativeDiscounts.filterByStatus')}</InputLabel>
        <Select
          id="filterStatus"
          inputProps={{
            'data-testid': 'filterStatus-select',
          }}
          name="filterStatus"
          label={t('pages.initiativeDiscounts.filterByStatus')}
          placeholder={t('pages.initiativeDiscounts.filterByStatus')}
          onChange={(e) => formik.handleChange(e)}
          value={formik.values.filterStatus}
        >
          {filterByStatusOptionsList.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
