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
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useEffect, useState } from 'react';
import { matchPath } from 'react-router';
import ROUTES, { BASE_ROUTE } from '../../routes';
import { intiativesListSelector, setSelectedInitative } from '../../redux/slices/initiativesSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import SidenavItem from './SidenavItem';
import { config } from './config';

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
  const [firstInitiativePage] = config;

  const match = matchPath(location.pathname, {
    path: [ROUTES.DISCOUNTS, ROUTES.OVERVIEW, ROUTES.STORES, ROUTES.REPORTED_USERS,
    ROUTES.STORES_DETAIL, ROUTES.REFUND_REQUESTS, ROUTES.REFUND_REQUESTS_STORE, ROUTES.EXPORT_REPORT],
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
                onClick={(e) => {
                  e.stopPropagation();
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
                    history.replace(
                      `${BASE_ROUTE}/${item.initiativeId}/${firstInitiativePage.route}`
                    );
                    setExpanded(`panel-${item.initiativeId}`);
                  });
                }}
              >
                <ListItemText sx={{ wordBreak: 'break-word' }} primary={item.initiativeName} />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List disablePadding>
                  {config.map(({ title, route, icon, dataTestId }) => (<SidenavItem key={title}
                    title={t(title)}
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
                        history.replace(
                          `${BASE_ROUTE}/${item.initiativeId}/${route}`
                        );
                      })
                    }
                    isSelected={pathname.startsWith(
                      `${BASE_ROUTE}/${item.initiativeId}/${route}`
                    )}
                    icon={icon}
                    level={2}
                    data-testid={dataTestId}
                  />))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </List>
      </Box>
    </Box>
  );
}
