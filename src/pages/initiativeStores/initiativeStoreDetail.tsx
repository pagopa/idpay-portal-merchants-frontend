import { Box, Paper, Typography } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { theme } from '@pagopa/mui-italia/dist/theme/theme';
import ROUTES from '../../routes';
import { getMerchantDetail, getMerchantInitiativeStatistics } from '../../services/merchantService';
import { MISSING_DATA_PLACEHOLDER} from '../../utils/constants';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import LabelValuePair from '../../components/labelValuePair/labelValuePair';
import MerchantTransactions from '../initiativeDiscounts/MerchantTransactions';


interface MatchParams {
  id: string;
}
interface StoreField {
  id: string;
  label: string;
  value: string;
}

const storeFields: Array<StoreField> = [
  {
    id: 'id',
    label: 'ID',
    value: MISSING_DATA_PLACEHOLDER
  },
  {
    id: 'address',
    label: 'Indirizzo',
    value: MISSING_DATA_PLACEHOLDER
  },
  {
    id: 'phone',
    label: 'Telefono',
    value: MISSING_DATA_PLACEHOLDER
  },
  {
    id: 'email',
    label: 'Email',
    value: MISSING_DATA_PLACEHOLDER
  },
  {
    id: 'google_landing',
    label: 'Landing Google',
    value: MISSING_DATA_PLACEHOLDER
  },
  {
    id: 'website',
    label: 'Sito web',
    value: MISSING_DATA_PLACEHOLDER
  }
];
const referentFields: Array<StoreField> = [
  {
    id: 'nome',
    label: 'Nome',
    value: MISSING_DATA_PLACEHOLDER
  },
  {
    id: 'cognome',
    label: 'Cognome',
    value: MISSING_DATA_PLACEHOLDER
  },
  {
    id: 'email',
    label: 'email',
    value: MISSING_DATA_PLACEHOLDER
  }
];

const InitiativeStoreDetail = () => {
  // const history = useHistory();
  const { t } = useTranslation();
  const match = matchPath(location.pathname, {
    path: [ROUTES.STORES, ROUTES.STORES_DETAIL],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};
  const addError = useErrorDispatcher();

  useEffect(() => {
    getMerchantDetail(id)
      .catch((error) =>
        addError({
          id: 'GET_MERCHANT_DETAIL',
          blocking: false,
          error,
          techDescription: 'An error occurred getting merchant detail',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        })
      );
  }, [id]);

  useEffect(() => {
    getMerchantInitiativeStatistics(id)
      .catch((error) => {
        addError({
          id: 'GET_MERCHANT_STATISTICS',
          blocking: false,
          error,
          techDescription: 'An error occurred getting merchant statistics',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
  }, [id]);

  return (
    <Box>
        <Box mt={2}>
          <BreadcrumbsBox backLabel={t('commons.backBtn')} items={[]} />
          <TitleBox
            title={"Nome punto vendita"}
            mbTitle={2}
            mtTitle={2}
            variantTitle="h4"
          />
        </Box>
      <Box
        alignItems={'stretch'}
        display={'flex'}
        gridColumn={'span 6'}
        gap={2}
        mt={2}
        mb={4}>
        <Box flex="1">
          <Paper sx={{height: '100%'}}>
            <Box p={2}>
              <Typography
                fontWeight={theme.typography.fontWeightBold}
                mb={2}
              >
                DATI PUNTO VENDITA
              </Typography>
              <Box display={'flex'} flexDirection={'column'}>
                {storeFields?.map((field) => (
                  <LabelValuePair
                    key={field?.id}
                    label={field?.label}
                    value={field?.value}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>
        <Box flex="1">
          <Paper sx={{height: '100%'}}>
            <Box p={2}>
              <Typography
                fontWeight={theme.typography.fontWeightBold}
                mb={2}
              >
                {'REFERENTE'}
              </Typography>

              <Box display={'flex'} flexDirection={'column'}>
                {referentFields?.map((referent) => (
                  <LabelValuePair
                    key={referent?.id}
                    label={referent?.label}
                    value={referent?.value}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
      <Box mt={2}>
        <TitleBox
          title={"Storico transazioni"}
          mbTitle={2}
          mtTitle={2}
          variantTitle="h5"
        />
        <MerchantTransactions id={id}/>
      </Box>
    </Box>
  );
};

export default InitiativeStoreDetail;
