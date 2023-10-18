import { Box } from '@mui/material';
import { matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useState } from 'react';
import ROUTES, { BASE_ROUTE } from '../../routes';
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
  const [amount, setAmount] = useState<number | undefined>();
  const [code, setCode] = useState<string | undefined>();
  const [amountGiven, setAmountGiven] = useState(false);

  return (
    <Box
      sx={{
        ...genericContainerStyle,
        mt: 3,
        minWidth: 920,
      }}
    >
      <BreadcrumbsBox
        backUrl={`${BASE_ROUTE}/sconti-iniziativa/${id}`}
        backLabel={t('commons.backBtn')}
        items={[
          t('pages.initiativesList.title'),
          selectedInitiative?.initiativeName,
          t('pages.initiativeDiscounts.createBtn'),
        ]}
      />
      <Box sx={{ gridColumn: 'span 12' }}>
        <TitleBox
          title={'Accetta un buono sconto'}
          subTitle={''}
          mbTitle={2}
          mtTitle={2}
          mbSubTitle={3}
          variantTitle="h4"
          variantSubTitle="body1"
        />
      </Box>
      {!amountGiven ? (
        <TotalAmount
          id={id}
          amount={amount}
          setAmount={setAmount}
          setAmountGiven={setAmountGiven}
        />
      ) : (
        <DiscountCode
          id={id}
          amount={amount}
          setAmountGiven={setAmountGiven}
          code={code}
          setCode={setCode}
        />
      )}
    </Box>
  );
};

export default AcceptNewDiscount;
