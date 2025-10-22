import { HeaderProduct, ProductEntity, RootLinkType } from '@pagopa/mui-italia';
import { PartySwitchItem } from '@pagopa/mui-italia/dist/components/PartySwitch';

import { User } from '@pagopa/selfcare-common-frontend/model/User';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { CONFIG } from '@pagopa/selfcare-common-frontend/config/env';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WithPartiesProps } from '../../decorators/withParties';
import { Product } from '../../model/Product';
import { useAppSelector } from '../../redux/hooks';
import { partiesSelectors } from '../../redux/slices/partiesSlice';
import { Party } from '../../model/Party';
import { ENV } from '../../utils/env';
import { CustomHeaderAccount } from './CustomHeaderAccount';

type Props = WithPartiesProps & {
  withSecondHeader: boolean;
  onExit: (exitAction: () => void) => void;
  loggedUser?: User | undefined;
  assistanceEmail?: string;
};

const CustomHeader = ({ onExit, loggedUser }: /* , parties */ Props) => {
  const { t } = useTranslation();
  const products = useAppSelector(partiesSelectors.selectPartySelectedProducts);
  const selectedParty = useAppSelector(partiesSelectors.selectPartySelected);
  const [party2Show, setParty2Show] = useState<Array<Party>>();
  const title = t('commons.title');

  const welfareProduct: ProductEntity = {
    // TODO check if correct
    id: 'prod-idpay-merchants',
    title,
    productUrl: CONFIG.HEADER.LINK.PRODUCTURL,
    linkType: 'internal',
  };

  const rootLink: RootLinkType = {
    label: 'PagoPA S.p.A.',
    href: 'https://www.pagopa.it/it/',
    ariaLabel: 'PagoPA S.p.A.',
    title: 'PagoPA S.p.A.',
  };

  useEffect(() => setParty2Show([{ ...(selectedParty as Party) }]), [selectedParty]);

  // const parties2Show = parties.filter((party) => party.status === 'ACTIVE');
  const activeProducts: Array<Product> = useMemo(
    () =>
      [
        {
          id: welfareProduct.id,
          title: welfareProduct.title,
          publicUrl: welfareProduct.productUrl,
        } as unknown as Product,
      ].concat(
        products?.filter(
          (p) => p.id !== welfareProduct.id && p.status === 'ACTIVE' && p.authorized
        ) ?? []
      ),
    [products]
  );

  return (
    <>
      <CustomHeaderAccount
        onLogout={() => onExit(() => window.location.assign(ENV.URL_FE.LOGOUT))}
        onLogin={() => onExit(() => window.location.assign(ENV.URL_FE.LOGIN))}
        onDocumentationClick={() => window.open(ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK, '_blank')}
        loggedUser={
          loggedUser
            ? {
                id: loggedUser ? loggedUser.uid : '',
                name: loggedUser?.name,
                surname: loggedUser?.surname,
                email: loggedUser?.email,
              }
            : false
        }
        enableAssistanceButton
        onAssistanceClick={() => window.open(ENV.ASSISTANCE.LINK, '_blank')}
        enableLogin={true}
        rootLink={rootLink}
      />
      <HeaderProduct
        partyId={selectedParty?.partyId}
        productId={welfareProduct.id}
        productsList={activeProducts.map((p) => ({
          id: p.id,
          title: p.title,
          productUrl: p.urlPublic ?? '',
          linkType: 'internal',
        }))}
        partyList={
          party2Show &&
          party2Show.map((party) => ({
            id: party.partyId,
            name: party.description,
            productRole: party?.roles?.map((r) => t(`roles.${r.roleKey}`)).join(','),
            logoUrl: party.urlLogo,
          }))
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
    </>
  );
};
export default CustomHeader;
