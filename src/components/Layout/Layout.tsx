import { Box } from '@mui/material';
import { Footer } from '@pagopa/selfcare-common-frontend';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  storageTokenOps,
  storageUserOps,
} from '@pagopa/selfcare-common-frontend/utils/storage';
import Header from '../Header/Header';
import ROUTES from '../../routes';

type Props = {
  children?: React.ReactNode;
};

import { ENV } from '../../utils/env';

const Layout = ({ children }: Props) => {
  const customExitAction = () => {
    storageTokenOps.delete();
    storageUserOps.delete();
    Object.keys(localStorage).forEach((key) => {
      if (
        key.toLowerCase().includes('filter') ||
        key === 'user' ||
        key === 'token' ||
        key.startsWith('persist:')
      ) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.toLowerCase().includes('filter') || key === 'user' || key === 'token') {
        sessionStorage.removeItem(key);
      }
    });

    window.location.assign(ENV.URL_FE.LOGOUT);
  };

  const onExit = useUnloadEventOnExit();
  const location = useLocation();
  const [, setShowAssistanceInfo] = useState(true);

  useEffect(() => {
    setShowAssistanceInfo(location.pathname !== ROUTES.ASSISTANCE);
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
        <Header
          onExit={() => onExit(customExitAction)}
          parties={[]}
          withSecondHeader={false}
        />
      </Box>
        <Box
          gridArea="body"
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          justifyContent="center"
        >
          <Box
            display="grid"
            justifyContent="center"
            gridColumn="span 12"
            maxWidth={
              location.pathname !== ROUTES.PRIVACY_POLICY && location.pathname !== ROUTES.TOS
                ? 920
                : '100%'
            }
            justifySelf="center"
          >
            {children}
          </Box>
        </Box>
      <Box gridArea="footer">
        <Footer onExit={() => onExit(customExitAction)} loggedUser={true} />
      </Box>
    </Box>
  );
};
export default Layout;
