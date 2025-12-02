import { Box, Step, StepLabel, Stepper } from '@mui/material';
import { matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useState } from 'react';
import ROUTES from '../../routes';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import { useAppSelector } from '../../redux/hooks';
import { initiativeSelector } from '../../redux/slices/initiativesSlice';
import { genericContainerStyle } from '../../styles';
import TotalAmount from './TotalAmount';
import DiscountCode from './DiscountCode';

interface MatchParams {
  id: string;
}

const AcceptNewDiscount = () => {
  const { t } = useTranslation();
  const match = matchPath(location.pathname, {
    path: [ROUTES.ACCEPT_NEW_DISCOUNT],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};
  const selectedInitiative = useAppSelector(initiativeSelector);
  const [activeStep, setActiveStep] = useState(0);
  const [amount, setAmount] = useState<number | undefined>();
  const [code, setCode] = useState<string | undefined>();

  const steps = [
    t('pages.acceptNewDiscount.spendingDataStepperTitle'),
    t('pages.acceptNewDiscount.discountDataStepperTitle'),
  ];

  const renderActiveStepBox = (activeStep: number) => {
    switch (activeStep) {
      case 0:
        return (
          <TotalAmount
            id={id}
            amount={amount}
            setAmount={setAmount}
            steps={steps.length}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        );
      case 1:
        return (
          <DiscountCode
            id={id}
            amount={amount}
            code={code}
            setCode={setCode}
            steps={steps.length}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        ...genericContainerStyle,
        mt: 3,
        minWidth: 920,
        maxWidth: '75%',
        justifySelf: 'center'
      }}
    >
      <BreadcrumbsBox
        backLabel={t('commons.backBtn')}
        items={[
          t('pages.initiativesList.title'),
          selectedInitiative?.initiativeName,
          t('pages.initiativeDiscounts.acceptBtn'),
        ]}
      />
      <Box sx={{ gridColumn: 'span 12' }}>
        <TitleBox
          title={t('pages.acceptNewDiscount.title')}
          subTitle={''}
          mbTitle={2}
          mtTitle={2}
          mbSubTitle={3}
          variantTitle="h4"
          variantSubTitle="body1"
        />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridColumn: 'span 12',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 2,
          gridTemplateRows: 'auto',
          gridTemplateAreas: `". . . stepper stepper stepper stepper stepper stepper . . ."`,
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            gridArea: 'stepper',
            my: 2,
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={index} sx={{ px: 0 }}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>
      {renderActiveStepBox(activeStep)}
    </Box>
  );
};

export default AcceptNewDiscount;
