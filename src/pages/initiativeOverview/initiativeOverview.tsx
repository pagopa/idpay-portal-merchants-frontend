import { Box,Alert, Button } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { initiativeSelector } from '../../redux/slices/initiativesSlice';
import ROUTES from '../../routes';
import { genericContainerStyle } from '../../styles';
import InitiativeOverviewSummary from './initiativeOverviewSummary';
// import { mapDatesFromPeriod } from './helpers';

interface MatchParams {
  id: string;
}

const InitiativeOverview = () => {
  const { t } = useTranslation();
  // const [value, setValue] = useState(0);
  // const history = useHistory();
  const selectedInitiative = useAppSelector(initiativeSelector);
  // const [startDate, setStartDate] = useState<Date>();
  // const [endDate, setEndDate] = useState<Date>();
  const match = matchPath(location.pathname, {
    path: [ROUTES.DISCOUNTS],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};

  useEffect(() => {
    // const dates = mapDatesFromPeriod(selectedInitiative?.spendingPeriod);
    // setStartDate(dates?.startDate);
    // setEndDate(dates?.endDate);
    // setValue(0);
  }, [id, JSON.stringify(selectedInitiative)]);

  // interface TabPanelProps {
  //   children?: React.ReactNode;
  //   index: number;
  //   value: number;
  // }

  // const TabPanel = (props: TabPanelProps) => {
  //   const { children, value, index, ...other } = props;
  //
  //   return (
  //     <div
  //       role="tabpanel"
  //       hidden={value !== index}
  //       id={`tabpanel-${index}`}
  //       aria-labelledby={`tab-${index}`}
  //       {...other}
  //     >
  //       {value === index && (
  //         <Box sx={{ pt: 3 }}>
  //           <Box>{children}</Box>
  //         </Box>
  //       )}
  //     </div>
  //   );
  // };

  // const a11yProps = (index: number) => ({
  //   id: `tab-${index}`,
  //   'aria-controls': `tabpanel-${index}`,
  // });


  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 8', mt: 2 }}>
          <TitleBox
            title={t('pages.initiativeOverview.title')}
            subTitle={t('pages.initiativeOverview.subtitle')}
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
          />
        </Box>
      </Box>
      <Alert closeText="Inserisci IBAN" variant="outlined" severity="warning" sx={{ bgcolor: 'background.paper' }}
      >
        {t('pages.initiativeOverview.missingIban')}
        <Button size="small" variant="text">Inserisci IBAN</Button>
      </Alert>
      <Box sx={{ display: 'flex', gridColumn: 'span 6', gap: 2, mt: 2 }}>
        <InitiativeOverviewSummary id={id} />
        <InitiativeOverviewSummary id={id} />
      </Box>



    </Box>
  );
};

export default InitiativeOverview;
