import { Box } from '@mui/material';
import { Footer } from '@pagopa/selfcare-common-frontend';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import ROUTES from '../../routes';
import { customExitAction } from '../../helpers';

type Props = {
  children?: React.ReactNode;
};

const Layout = ({ children }: Props) => {
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
        <Header />
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
