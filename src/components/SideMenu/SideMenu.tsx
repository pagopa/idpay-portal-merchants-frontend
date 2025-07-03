/* eslint-disable no-prototype-builtins */
import {
  List,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemText,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import StoreIcon from '@mui/icons-material/Store';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useEffect, useState } from 'react';
import { matchPath } from 'react-router';
import ROUTES, { BASE_ROUTE } from '../../routes';
import { intiativesListSelector, setSelectedInitative } from '../../redux/slices/initiativesSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import SidenavItem from './SidenavItem';

interface MatchParams {
  id: string;
}

/** The side menu of the application */
export default function SideMenu() {
  const initiativesList = useAppSelector(intiativesListSelector);
  const { t } = useTranslation();
  const history = useHistory();
  const onExit = useUnloadEventOnExit();
  const [expanded, setExpanded] = useState<string | false>(false);
  const dispatch = useAppDispatch();
  const [pathname, setPathName] = useState(() => {
    /*
    For some reason, push on history will not notify this component.
    We are configuring the listener here and not into a useEffect in order to configure it at the costruction of the component, not at its mount
    because the Redirect performed as fallback on the routing would be executed before the listen as been configured
    */
    history.listen(() => setPathName(history.location.pathname));
    return history.location.pathname;
  });

  const match = matchPath(location.pathname, {
    path: [ROUTES.DISCOUNTS],
    exact: true,
    strict: false,
  });

  useEffect(() => {
    // eslint-disable-next-line no-prototype-builtins
    if (match !== null && match.params.hasOwnProperty('id')) {
      const { id } = match.params as MatchParams;
      const itemExpanded = `panel-${id}`;
      setExpanded(itemExpanded);
    } else {
      const firstItemExpanded =
        Array.isArray(initiativesList) && initiativesList.length > 0
          ? `panel-${initiativesList[0].initiativeId}`
          : false;
      setExpanded(firstItemExpanded);
    }
  }, [JSON.stringify(match), initiativesList]);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box display="grid" mt={1}>
      <Box gridColumn="auto">
        <List data-testid="list-test">
          <SidenavItem
            title={t('pages.initiativesList.title')}
            handleClick={() => onExit(() => history.replace(ROUTES.HOME))}
            isSelected={pathname === ROUTES.HOME}
            icon={ListAltIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
          {initiativesList?.map((item) => (
            <Accordion
              key={item.initiativeId}
              expanded={expanded === `panel-${item.initiativeId}`}
              onChange={handleChange(`panel-${item.initiativeId}`)}
              disableGutters
              elevation={0}
              sx={{
                border: 'none',
                '&:before': { backgroundColor: '#fff' },
                minWidth: 300,
                maxWidth: 316,
              }}
              data-testid="accordion-click-test"
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${item.initiativeId}-content`}
                id={`panel-${item.initiativeId}-header`}
              >
                <ListItemText sx={{ wordBreak: 'break-word' }} primary={item.initiativeName} />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List disablePadding>
                  <SidenavItem
                    title={t('pages.initiativeOverview.title')}
                    handleClick={() =>
                      onExit(() => {
                        dispatch(
                          setSelectedInitative({
                            spendingPeriod:
                              `${item.startDate?.toLocaleDateString(
                                'fr-FR'
                              )} - ${item.endDate?.toLocaleDateString('fr-FR')}` || '',
                            initiativeName: item.initiativeName,
                          })
                        );
                        history.replace(`${BASE_ROUTE}/panoramica/${item.initiativeId}`);
                      })}
                    isSelected={pathname === `${BASE_ROUTE}/panoramica/${item.initiativeId}`}
                    icon={DashboardIcon}
                    level={2}
                    data-testid="initiativeDiscountsTitle-click-test"
                  />
                  <SidenavItem
                    title={t('pages.initiativeStores.title')}
                    handleClick={() =>{}}
                    isSelected={pathname === `${BASE_ROUTE}/punti-vendita/${item.initiativeId}`}
                    icon={StoreIcon}
                    level={2}
                    data-testid="initiativeDiscountsTitle-click-test"
                  />
                  <SidenavItem
                    title={t('pages.initiativeDiscounts.title')}
                    handleClick={() =>
                      onExit(() => {
                        dispatch(
                          setSelectedInitative({
                            spendingPeriod:
                              `${item.startDate?.toLocaleDateString(
                                'fr-FR'
                              )} - ${item.endDate?.toLocaleDateString('fr-FR')}` || '',
                            initiativeName: item.initiativeName,
                          })
                        );
                        history.replace(`${BASE_ROUTE}/sconti-iniziativa/${item.initiativeId}`);
                      })
                    }
                    isSelected={pathname === `${BASE_ROUTE}/sconti-iniziativa/${item.initiativeId}`}
                    icon={ConfirmationNumberIcon}
                    level={2}
                    data-testid="initiativeDiscountsTitle-click-test"
                  />
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </List>
      </Box>
    </Box>
  );
}
