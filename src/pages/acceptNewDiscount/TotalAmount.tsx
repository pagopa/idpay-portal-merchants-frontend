import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import EuroSymbolIcon from '@mui/icons-material/EuroSymbol';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { BASE_ROUTE } from '../../routes';

interface Props {
  id: string;
  amount: number | undefined;
  setAmount: Dispatch<SetStateAction<number | undefined>>;
  setAmountGiven: Dispatch<SetStateAction<boolean>>;
}

const TotalAmount = ({ id, amount, setAmount, setAmountGiven }: Props) => {
  const { t } = useTranslation();
  const history = useHistory();

  const validationSchema = Yup.object().shape({
    spendingAmount: Yup.number()
      .typeError(t('validation.number'))
      .required(t('validation.requiredField'))
      .positive(t('validation.positiveNumber'))
      .min(0.01, t('validation.minValue', { x: 0.01 })),
  });

  const formik = useFormik({
    initialValues: {
      spendingAmount: amount,
    },
    validateOnMount: false,
    validateOnChange: true,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      setAmount(values.spendingAmount);
      setAmountGiven(true);
    },
  });

  return (
    <>
      <Paper sx={{ gridColumn: 'span 12', p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {t('pages.newDiscount.spendingInfoTitle')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {t('pages.newDiscount.spendingInfoSubtitle')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <FormControl sx={{ gridColumn: 'span 3' }}>
            <TextField
              id={`spendingAmount`}
              name={`spendingAmount`}
              label={t('pages.newDiscount.spendingAmountLabel')}
              value={formik.values.spendingAmount}
              onChange={(e) => formik.handleChange(e)}
              error={Boolean(formik.errors.spendingAmount)}
              helperText={formik.errors.spendingAmount}
              size="small"
              inputProps={{
                step: 0.01,
                min: 0.01,
                type: 'number',
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EuroSymbolIcon />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </Box>
      </Paper>
      <Box sx={{ gridColumn: 'span 12', mt: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="outlined"
              onClick={() => history.replace(`${BASE_ROUTE}/sconti-iniziativa/${id}`)}
              data-testid="back-to-initiative-discounts-test"
            >
              {t('commons.backBtn')}
            </Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              disabled={!formik.isValid}
              onClick={() => formik.handleSubmit()}
              data-testid="submit-new-discount-test"
            >
              {t('commons.confirmBtn')}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default TotalAmount;
