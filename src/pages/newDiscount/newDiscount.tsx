import { Box } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useState, useEffect } from 'react';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import { genericContainerStyle } from '../../styles';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import { TransactionResponse } from '../../api/generated/merchants/data-contracts';
import { useCurrentInitiative } from '../../hooks/useCurrentInitiative';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import CreateForm from './CreateForm';
import DiscountCreatedRecap from './DiscountCreatedRecap';

const NewDiscount = () => {
  const [discountCreated, setDiscountCreated] = useState(false);
  const [discountResponse, setDiscountResponse] = useState<TransactionResponse | undefined>();
  const currentInitiative = useCurrentInitiative();
  const { initiativeId } = useCurrentInitiativeId();
  const { t } = useScopedTranslation();

  useEffect(() => {
    if (!initiativeId) {
      return;
    }

    setDiscountCreated(false);
    setDiscountResponse(undefined);
  }, [initiativeId]);

  if (!initiativeId) {
    return null;
  }

  return (
    <Box
      sx={{
        ...genericContainerStyle,
        mt: 3,
        alignItems: 'start',
        maxWidth: '75%',
        justifySelf: 'center',
      }}
    >
      <BreadcrumbsBox
        backLabel={t('actions.back')}
        items={[
          t('pages.initiativesList.title'),
          currentInitiative?.initiativeName,
          t('pages.initiativeDiscounts.createBtn'),
        ]}
      />

      <Box sx={{ gridColumn: 'span 12' }}>
        <TitleBox
          title={
            !discountCreated ? t('pages.newDiscount.title') : t('pages.newDiscount.createdTitle')
          }
          subTitle={
            !discountCreated
              ? t('pages.newDiscount.subtitle')
              : t('pages.newDiscount.createdSubtitle')
          }
          mbTitle={2}
          mtTitle={2}
          mbSubTitle={3}
          variantTitle="h4"
          variantSubTitle="body1"
        />
      </Box>

      {!discountCreated ? (
        <CreateForm
          id={initiativeId}
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
