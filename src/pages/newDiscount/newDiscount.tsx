import { Box } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import ROUTES, { BASE_ROUTE } from '../../routes';
import { genericContainerStyle } from '../../styles';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import { TransactionResponse } from '../../api/generated/merchants/TransactionResponse';
import CreateForm from './CreateForm';
import DiscountCreatedRecap from './DiscountCreatedRecap';

interface MatchParams {
  name: string;
  id: string;
}

const NewDiscount = () => {
  const [discountCreated, setDiscountCreated] = useState(false);
  const [discountResponse, setDiscountResponse] = useState<TransactionResponse | undefined>();
  const { t } = useTranslation();

  const match = matchPath(location.pathname, {
    path: [ROUTES.NEW_DISCOUNT],
    exact: true,
    strict: false,
  });
  const { name, id } = (match?.params as MatchParams) || {};

  return (
    <Box sx={genericContainerStyle}>
      <BreadcrumbsBox
        backUrl={`${BASE_ROUTE}/sconti-iniziativa/${id}`}
        backLabel={t('commons.backBtn')}
        items={[
          t('pages.initiativesList.title'),
          decodeURIComponent(name),
          t('pages.initiativeDiscounts.createBtn'),
        ]}
      />

      <Box sx={{ gridColumn: 'span 12' }}>
        <TitleBox
          title={!discountCreated ? t('pages.newDiscount.title') : 'Buono sconto creato!'}
          subTitle={
            !discountCreated
              ? t('pages.newDiscount.subtitle')
              : 'Invia il buono sconto al tuo cliente, gli servirà per autorizzare la spesa con l’app IO.'
          }
          mbTitle={2}
          mtTitle={2}
          mbSubTitle={5}
          variantTitle="h4"
          variantSubTitle="body1"
        />
      </Box>

      {!discountCreated ? (
        <CreateForm
          id={id}
          setDiscountCreated={setDiscountCreated}
          setDiscountResponse={setDiscountResponse}
        />
      ) : (
        <DiscountCreatedRecap data={discountResponse} />
      )}
    </Box>
  );
};

export default NewDiscount;
