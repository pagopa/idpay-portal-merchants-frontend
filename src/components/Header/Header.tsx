import { ProductEntity } from '@pagopa/mui-italia';
import { PartySwitchItem } from '@pagopa/mui-italia/dist/components/PartySwitch';
import { Header as CommonHeader } from '@pagopa/selfcare-common-frontend';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { CONFIG } from '@pagopa/selfcare-common-frontend/config/env';
import { useTranslation } from 'react-i18next';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import { ENV } from '../../utils/env';
import { customExitAction } from '../../helpers';

const Header = () => {
  const { t } = useTranslation();
  const title = t('commons.title');
  const onExit = useUnloadEventOnExit();
  
  const welfareProduct: ProductEntity = {
    id: 'prod-idpay-merchants',
    title,
    productUrl: CONFIG.HEADER.LINK.PRODUCTURL,
    linkType: 'internal',
  };

  return (
    <CommonHeader
      onExit={() => onExit(customExitAction)}
      loggedUser={false}
      enableLogin={false}
      withSecondHeader={false}
      selectedProductId={welfareProduct.id}
      addSelfcareProduct={false}
      assistanceEmail={ENV.ASSISTANCE.EMAIL}
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
