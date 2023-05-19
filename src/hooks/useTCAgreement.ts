import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { getPortalConsent, savePortalConsent } from '../services/rolePermissionService';

const useTCAgreement = () => {
  const addError = useErrorDispatcher();
  const { t } = useTranslation();
  const [acceptedTOS, setAcceptedTOS] = useState<boolean | undefined>(undefined);
  const [acceptedTOSVersion, setAcceptedTOSVersion] = useState<string | undefined>();
  const [firstAcceptance, setFirstAcceptance] = useState<boolean | undefined>(false);
  useEffect(() => {
    getPortalConsent()
      .then((res) => {
        if (Object.keys(res).length) {
          setAcceptedTOSVersion(res.versionId);
          setFirstAcceptance(res.firstAcceptance);
          setAcceptedTOS(false);
        } else {
          setAcceptedTOS(true);
        }
      })
      .catch((error) => {
        setAcceptedTOS(false);
        addError({
          id: 'GET_TERMS_AND_CONDITION_ACCEPTANCE',
          blocking: false,
          error,
          techDescription: 'An error occurred getting terms and conditions acceptance',
          displayableTitle: t('errors.title'),
          displayableDescription: t('errors.cantGetTC'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
  }, []);

  const acceptTOS = () => {
    savePortalConsent(acceptedTOSVersion)
      .then((_res) => {
        setAcceptedTOS(true);
      })
      .catch((error) => {
        setAcceptedTOS(false);
        addError({
          id: 'SAVE_TERMS_AND_CONDITION_ACCEPTANCE',
          blocking: false,
          error,
          techDescription: 'An error occurred saving terms and conditions acceptance',
          displayableTitle: t('errors.title'),
          displayableDescription: t('errors.cantSaveTC'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
  };

  return { isTOSAccepted: acceptedTOS, acceptTOS, firstAcceptance };
};

export default useTCAgreement;
