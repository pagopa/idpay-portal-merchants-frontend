import { Box } from '@mui/material';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userSelectors } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router';
import SideMenu from '../SideMenu/SideMenu';
import ROUTES from '../../routes';
import { useInitiativesList } from '../../hooks/useInitiativesList';
import Footer from '../Footer/Footer';
import CustomHeader from '../Header/CustomHeader';

type Props = {
  children?: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const onExit = useUnloadEventOnExit();
  const loggedUser = useSelector(userSelectors.selectLoggedUser);
  const location = useLocation();
  const [showAssistanceInfo, setShowAssistanceInfo] = useState(true);

  const match = matchPath(location.pathname, {
    path: [ROUTES.HOME, ROUTES.DISCOUNTS, ROUTES.OVERVIEW, ROUTES.STORES, ROUTES.REPORTED_USERS, ROUTES.STORES_DETAIL, ROUTES.REFUND_REQUESTS, ROUTES.REFUND_REQUESTS_DETAILS],
    exact: true,
    strict: false,
  });

  const matchNoSideMenu = matchPath(location.pathname, {
    path: [ROUTES.STORES_UPLOAD],
    exact: true,
    strict: false,
  });

  useEffect(() => {
    setShowAssistanceInfo(location.pathname !== ROUTES.ASSISTANCE);
  }, [location.pathname]);

  useInitiativesList(match);

  return (
    <Box
      display="grid"
      gridTemplateColumns="1fr"
      gridTemplateRows="auto 1fr auto"
      gridTemplateAreas={`"header"
                          "body"
                          "footer"`}
      minHeight="100vh"
    >
      <Box gridArea="header">
        <CustomHeader
          withSecondHeader={showAssistanceInfo}
          onExit={onExit}
          loggedUser={loggedUser}
          parties={[]}
        />
      </Box>
      {match !== null && matchNoSideMenu === null ? (
        <Box gridArea="body" display="grid" gridTemplateColumns="minmax(300px, 2fr) 10fr">
          <Box gridColumn="auto" sx={{ backgroundColor: 'background.paper' }}>
            <SideMenu />
          </Box>
          <Box
            gridColumn="auto"
            sx={{ backgroundColor: '#F5F5F5' }}
            display="grid"
            justifyContent="center"
            pb={16}
            pt={2}
            px={2}
            gridTemplateColumns="1fr"
          >
            {children}
          </Box>
        </Box>
      ) : (
        <Box
          gridArea="body"
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          justifyContent="center"
        >
          <Box
            display="grid"
            justifyContent="center"
            pb={16}
            pt={2}
            gridColumn="span 12"
            maxWidth="75%"
            justifySelf="center"
          >
            {children}
          </Box>
        </Box>
      )}
      <Box gridArea="footer">
        <Footer onExit={onExit} loggedUser={true} />
      </Box>
    </Box>
  );
};
// export default withParties(Layout);
export default Layout;
