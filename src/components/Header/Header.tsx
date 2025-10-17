import { ProductEntity } from '@pagopa/mui-italia';
import { PartySwitchItem } from '@pagopa/mui-italia/dist/components/PartySwitch';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import CustomHeader from './CustomHeader';

const Header = () => {
  const { t } = useTranslation();
  const [party2Show, ] = useState<Array<any>>();
  const title = t('commons.title');
  const onExit = useUnloadEventOnExit();

  const welfareProduct: ProductEntity = {
    id: 'prod-idpay-asset-register',
    title,
    productUrl: CONFIG.HEADER.LINK.PRODUCTURL,
    linkType: 'internal',
  };

  return (
    <CustomHeader
      onExit={onExit}
      loggedUser={false}
      enableLogin={false}
      withSecondHeader={false}
      selectedPartyId={''}
      selectedProductId={welfareProduct.id}
      addSelfcareProduct={false}
      productsList={[]}
      partyList={
        party2Show &&
        party2Show.map((party) => ({
          id: party.partyId,
          name: party.description,
          productRole: party?.roles
            ?.map((r: { roleKey: any }) => t(`roles.${r.roleKey}`))
            .join(','),
          logoUrl: party.urlLogo,
        }))
      }
      onDocumentationClick={() =>
        window.open('https://developer.pagopa.it/pari/guides/manuale-tecnico-esercente', '_blank')
      }
      assistanceEmail={
        'https://developer.pagopa.it/pari/guides/manuale-tecnico-esercente/contatti'
      }
      onSelectedProduct={(p) =>
        onExit(() => console.log(`TODO: perform token exchange to change Product and set ${p}`))
      }
      onSelectedParty={(selectedParty: PartySwitchItem) => {
        if (selectedParty) {
          trackEvent('PARTY_SELECTION', {
            party_id: selectedParty.id,
          });
          onExit(() =>
            console.log(`TODO: perform token exchange to change Party and set ${selectedParty}`)
          );
        }
      }}
    />
  );
};
export default Header;
