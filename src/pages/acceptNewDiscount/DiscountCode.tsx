import { Box, Button, FormControl, Paper, TextField, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { authPaymentBarCode } from '../../services/merchantService';
import { BASE_ROUTE } from '../../routes';

interface Props {
  id: string;
  amount: number | undefined;
  setAmountGiven: Dispatch<SetStateAction<boolean>>;
  code: string | undefined;
  setCode: Dispatch<SetStateAction<string | undefined>>;
}

const DiscountCode = ({ id, amount, setAmountGiven, code, setCode }: Props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const addError = useErrorDispatcher();

  const sendAuthorizationPaymentBarCode = (
    amount: number | undefined,
    discountCode: string | undefined
  ) => {
    if (typeof amount === 'number' && typeof discountCode === 'string') {
      const amountCents = amount * 100;
      authPaymentBarCode(discountCode, amountCents)
        .then((response) => {
          if (response !== null) {
            history.replace(`${BASE_ROUTE}/sconti-iniziativa/${id}`);
          } else {
            throw new Error();
          }
        })
        .catch((error) => {
          formik.setFieldError('discountCode', 'Codice non valido');
          addError({
            id: 'AUTHORIZE_PAYMENT_BAR_CODE_ERROR',
            blocking: false,
            error,
            techDescription: 'An error occurred authorizing payment bar code',
            displayableTitle: t('errors.genericTitle'),
            displayableDescription: t('errors.validationDescription'),
            toNotify: true,
            component: 'Toast',
            showCloseIcon: true,
          });
        });
    }
  };

  const validationSchema = Yup.object().shape({
    discountCode: Yup.string()
      .required(t('validation.requiredField'))
      .test(
        'len',
        t('validation.exactChars', { x: 8 }),
        (val) => typeof val === 'string' && val.length === 8
      ),
  });

  const formik = useFormik({
    initialValues: {
      amount,
      discountCode: code,
    },
    validateOnMount: false,
    validateOnChange: true,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      sendAuthorizationPaymentBarCode(values.amount, values.discountCode);
    },
  });

  return (
    <>
      <Paper sx={{ gridColumn: 'span 12', p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {'Qual è il codice sconto?'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {"Inserisci il codice sconto generato dal cliente sull'app IO"}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <FormControl sx={{ gridColumn: 'span 3' }}>
            <TextField
              id={`discountCode`}
              name={`discountCode`}
              label={'Codice sconto'}
              size="small"
              focused
              value={formik.values.discountCode}
              onChange={(e) => {
                formik.handleChange(e);
                setCode(e.target.value);
              }}
              error={Boolean(formik.errors.discountCode)}
              helperText={formik.errors.discountCode}
            />
          </FormControl>
        </Box>
      </Paper>
      <Box sx={{ gridColumn: 'span 12', mt: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="outlined"
              onClick={() => {
                setAmountGiven(false);
                setCode(formik.values.discountCode);
              }}
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

export default DiscountCode;
