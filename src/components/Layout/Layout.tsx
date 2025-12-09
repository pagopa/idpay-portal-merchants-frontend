import { Box } from '@mui/material';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userSelectors } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router';
import SideMenu from '../SideMenu/SideMenu';
import ROUTES from '../../routes';
import Footer from '../Footer/Footer';
import CustomHeader from '../Header/CustomHeader';
import AlertComponent from '../Alert/AlertComponent';
import { useAlert } from '../../hooks/useAlert';

type Props = {
  children?: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const {alert, setAlert} = useAlert();
  const onExit = useUnloadEventOnExit();
  const loggedUser = useSelector(userSelectors.selectLoggedUser);
  const location = useLocation();
  const [showAssistanceInfo, setShowAssistanceInfo] = useState(true);

  const match = matchPath(location.pathname, {
    path: [ROUTES.HOME, ROUTES.DISCOUNTS, ROUTES.OVERVIEW, ROUTES.STORES, ROUTES.REPORTED_USERS, ROUTES.STORES_DETAIL, ROUTES.REFUND_REQUESTS, ROUTES.REFUND_REQUESTS_STORE],
    exact: true,
    strict: false,
  });

  const matchNoSideMenu = matchPath(location.pathname, {
    path: [ROUTES.STORES_UPLOAD],
    exact: true,
    strict: false,
  });

  const matchNoAlert = matchPath(location.pathname, {path: [ROUTES.PRIVACY_POLICY, ROUTES.TOS], exact: true, strict: false});

  useEffect(() => {
    setShowAssistanceInfo(location.pathname !== ROUTES.ASSISTANCE);
    setAlert(alert.isOpen ? { ...alert, isOpen: false} : alert);
  }, [location.pathname]);


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
            sx={{ backgroundColor: '#F5F5F5', overflowX: 'clip' }}
            display="grid"
            justifyContent="center"
            pb={16}
            pt={2}
            px={2}
            gridTemplateColumns="1fr"
          >
            {children}
            <AlertComponent { ...alert} />
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
            sx={{overflowX: 'clip'}}
            display="grid"
            pb={16}
            pt={2}
            gridColumn="span 12"
          >
            {children}
          { !matchNoAlert && <AlertComponent { ...alert} contentStyle={{right: '20px', ...alert.contentStyle }} />}
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
