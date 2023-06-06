import EuroSymbolIcon from '@mui/icons-material/EuroSymbol';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { Dispatch, SetStateAction } from 'react';
import { useHistory } from 'react-router-dom';
import { createTransaction } from '../../services/merchantService';
import { TransactionResponse } from '../../api/generated/merchants/TransactionResponse';
import { BASE_ROUTE } from '../../routes';

interface Props {
  id: string;
  setDiscountCreated: Dispatch<SetStateAction<boolean>>;
  setDiscountResponse: Dispatch<SetStateAction<TransactionResponse | undefined>>;
}

const CreateForm = ({ id, setDiscountCreated, setDiscountResponse }: Props) => {
  const { t } = useTranslation();
  const addError = useErrorDispatcher();
  const history = useHistory();

  const validationSchema = Yup.object().shape({
    spendingAmount: Yup.number()
      .typeError(t('validation.numeric'))
      .required(t('validation.required'))
      .positive(t('validation.positive'))
      .min(0.01, t('validation.minOne')),
  });

  const formik = useFormik({
    initialValues: {
      spendingAmount: '',
    },
    validateOnMount: true,
    validateOnChange: true,
    validationSchema,
    onSubmit: (values) => {
      const roundedAmount = parseFloat(values.spendingAmount).toFixed(2);
      const amountCents = parseFloat(roundedAmount) * 100;
      const trxDate = new Date();
      const idTrxIssuer = trxDate.getTime().toString();
      if (typeof id === 'string') {
        createTransaction(amountCents, idTrxIssuer, id, trxDate, undefined)
          .then((response) => {
            setDiscountResponse({ ...response });
            setDiscountCreated(true);
          })
          .catch((error) => {
            addError({
              id: 'CREATE_INITIATIVE_DISCOUNT_ERROR',
              blocking: false,
              error,
              techDescription: 'An error occurred creating initiative discount',
              displayableTitle: t('errors.title'),
              displayableDescription: t('errors.invalidDataDescription'),
              toNotify: true,
              component: 'Toast',
              showCloseIcon: true,
            });
          });
      }
    },
  });

  return (
    <>
      <Paper sx={{ gridColumn: 'span 12', my: 4, px: 3 }}>
        <Box sx={{ py: 3 }}>
          <Typography variant="h6">Informazioni sulla spesa</Typography>
        </Box>
        <Typography variant="body2">
          Inserisci l’importo totale della spesa, ci servirà per calcolare lo sconto applicabile.
        </Typography>
        <FormControl sx={{ my: 3 }}>
          <TextField
            id={`spendingAmount`}
            name={`spendingAmount`}
            label={`Importo spesa`}
            value={formik.values.spendingAmount}
            onChange={(e) => formik.handleChange(e)}
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
      </Paper>
      <Box sx={{ gridColumn: 'span 12', py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="outlined"
              onClick={() => history.replace(`${BASE_ROUTE}/sconti-iniziativa/${id}`)}
            >
              Indietro
            </Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              disabled={!formik.isValid}
              onClick={() => formik.handleSubmit()}
            >
              Crea buono sconto
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CreateForm;
