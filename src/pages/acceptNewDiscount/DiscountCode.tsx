import { Box, FormControl, Paper, TextField, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { authPaymentBarCode } from '../../services/merchantService';
import { BASE_ROUTE } from '../../routes';
import WizardNavigation from './WizardNavigation';

interface Props {
  id: string;
  amount: number | undefined;
  code: string | undefined;
  setCode: Dispatch<SetStateAction<string | undefined>>;
  steps: number;
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
}

const DiscountCode = ({ id, amount, code, setCode, activeStep, setActiveStep }: Props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const addError = useErrorDispatcher();

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
      spendingAmount: amount,
      discountCode: code,
    },
    validateOnMount: true,
    validateOnChange: true,
    validationSchema,
    onSubmit: (values) => {
      sendAuthorizationPaymentBarCode(values.spendingAmount, values.discountCode);
    },
  });

  const handleNext = () => {
    formik.handleSubmit();
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setCode(formik.values.discountCode);
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const mapErrorCode = (errorCode: string) => {
    switch (errorCode) {
      case 'PAYMENT_NOT_FOUND_EXPIRED':
        return t('pages.acceptNewDiscount.errors.paymentNotFoundExpired');
      case 'PAYMENT_USER_NOT_VALID':
        return t('pages.acceptNewDiscount.errors.paymentUserNotValid');
      case 'PAYMENT_STATUS_NOT_VALID':
        return t('pages.acceptNewDiscount.errors.paymentStatusNotValid');
      case 'PAYMENT_ALREADY_AUTHORIZED':
        return t('pages.acceptNewDiscount.errors.paymentAlreadyAuthorized');
      case 'PAYMENT_BUDGET_EXHAUSTED':
        return t('pages.acceptNewDiscount.errors.paymentBudgetExhausted');
      case 'PAYMENT_GENERIC_REJECTED':
        return t('pages.acceptNewDiscount.errors.paymentGenericRejected');
      case 'PAYMENT_USER_SUSPENDED':
        return t('pages.acceptNewDiscount.errors.paymentUserSuspended');
      case 'PAYMENT_MERCHANT_NOT_FOUND':
        return t('pages.acceptNewDiscount.errors.paymentMerchantNotFound');
      case 'PAYMENT_AMOUNT_NOT_VALID':
        return t('pages.acceptNewDiscount.errors.paymentAmountNotValid');
      case 'PAYMENT_USER_UNSUBSCRIBED':
        return t('pages.acceptNewDiscount.errors.paymentUserUnsubscribed');
      case 'PAYMENT_USER_NOT_ONBOARDED':
        return t('pages.acceptNewDiscount.errors.paymentUserNotOnboarded');
      case 'PAYMENT_MERCHANT_OR_ACQUIRER_NOT_ALLOWED':
        return t('pages.acceptNewDiscount.errors.paymentMerchantOrAcquirerNotAllowed');
      case 'PAYMENT_INITIATIVE_INVALID_DATE':
        return t('pages.acceptNewDiscount.errors.paymentInitiativeInvalidDate');
      case 'PAYMENT_INITIATIVE_NOT_FOUND':
      case 'PAYMENT_INITIATIVE_NOT_DISCOUNT':
        return t('pages.acceptNewDiscount.errors.paymentInitiativeNotFound');
      case 'PAYMENT_TRANSACTION_EXPIRED':
      case 'PAYMENT_TOO_MANY_REQUESTS':
      case 'PAYMENT_GENERIC_ERROR':
      default:
        return t('pages.acceptNewDiscount.errors.paymentGenericError');
    }
  };

  const sendAuthorizationPaymentBarCode = (
    amount: number | undefined,
    discountCode: string | undefined
  ) => {
    // eslint-disable-next-line functional/no-let
    let amountCents = 0;
    if (typeof amount === 'number') {
      amountCents = amount * 100;
    }

    if (amountCents && typeof discountCode === 'string') {
      const trxDate = new Date();
      const idTrxAcquirer = trxDate.getTime().toString();
      authPaymentBarCode(discountCode, amountCents, idTrxAcquirer)
        .then((response) => {
          // eslint-disable-next-line no-prototype-builtins
          if (response.hasOwnProperty('right')) {
            const errorText = mapErrorCode(response.right.value.code);
            formik.setFieldError('discountCode', errorText);
          } else {
            history.replace(`${BASE_ROUTE}/sconti-iniziativa/${id}`);
          }
        })
        .catch((error) => {
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

  return (
    <>
      <Paper sx={{ gridColumn: 'span 12', p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {t('pages.acceptNewDiscount.discountInfoTitle')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {t('pages.acceptNewDiscount.discountInfoSubtitle')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <FormControl sx={{ gridColumn: 'span 4' }}>
            <TextField
              id={`discountCode`}
              name={`discountCode`}
              label={t('pages.acceptNewDiscount.discountCodeLabel')}
              size="small"
              focused
              value={formik.values.discountCode}
              onChange={(e) => {
                formik.handleChange(e);
              }}
              error={formik.touched.discountCode && Boolean(formik.errors.discountCode)}
              helperText={formik.touched.discountCode && formik.errors.discountCode}
            />
          </FormControl>
        </Box>
      </Paper>
      <WizardNavigation
        handleBack={handleBack}
        handleNext={handleNext}
        disabledNext={!formik.isValid}
      />
    </>
  );
};
export default DiscountCode;
