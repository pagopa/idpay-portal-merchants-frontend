import { Box, FormControl, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import EuroSymbolIcon from '@mui/icons-material/EuroSymbol';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Dispatch, Fragment, SetStateAction, useState } from 'react';
import { BASE_ROUTE } from '../../routes';
import ExitModal from '../../components/ExitModal/ExitModal';
import WizardNavigation from './WizardNavigation';

interface Props {
  id: string;
  amount: number | undefined;
  setAmount: Dispatch<SetStateAction<number | undefined>>;
  steps: number;
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
}

const TotalAmount = ({ id, amount, setAmount, setActiveStep }: Props) => {
  const { t } = useTranslation();
  const [openExitModal, setOpenExitModal] = useState(false);

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .typeError(t('validation.number'))
      .required(t('validation.requiredField'))
      .positive(t('validation.positiveNumber'))
      .min(0.01, t('validation.minValue', { x: 0.01 })),
  });

  const formik = useFormik({
    initialValues: {
      amount,
    },
    initialErrors: {
      amount: '',
    },
    validateOnMount: true,
    validateOnChange: true,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      setAmount(values.amount);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    },
  });

  const handleFieldChange = (e: { target: { value: string } }) => {
    formik.handleChange(e);
    const roundedAmount = parseFloat(e.target.value).toFixed(2);
    const amount = parseFloat(roundedAmount);
    setAmount(amount);
  };

  const handleNext = () => {
    formik.handleSubmit();
  };

  const handleBack = () => {
    setOpenExitModal(true);
  };

  return (
    <Fragment>
      <Paper sx={{ gridColumn: 'span 12', p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {t('pages.newDiscount.spendingInfoTitle')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {t('pages.newDiscount.spendingInfoSubtitle')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <FormControl sx={{ gridColumn: 'span 4' }}>
            <TextField
              id={`amount`}
              name={`amount`}
              label={t('pages.newDiscount.spendingAmountLabel')}
              value={formik.values.amount}
              onChange={(e) => handleFieldChange(e)}
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
        <ExitModal
          title={t('pages.acceptNewDiscount.exitModalTitle')}
          subtitle={t('pages.acceptNewDiscount.exitModalBody')}
          openExitModal={openExitModal}
          handleCloseExitModal={() => setOpenExitModal(false)}
          backRoute={`${BASE_ROUTE}/sconti-iniziativa/${id}`}
        />
      </Paper>
      <WizardNavigation
        handleBack={handleBack}
        handleNext={handleNext}
        disabledNext={!formik.isValid}
      />
    </Fragment>
  );
};

export default TotalAmount;
