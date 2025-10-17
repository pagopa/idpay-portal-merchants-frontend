import { Box } from '@mui/material';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router';
import Header from '../Header/Header';
import ROUTES from '../../routes';
import { CustomFooter } from '../Footer/CustomFooter';

type Props = {
  children?: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const location = useLocation();

  const match = matchPath({ path: ROUTES.HOME, end: true }, location.pathname);

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
      {match !== null ? (
        <Box gridArea="body" display="grid" gridTemplateColumns="minmax(300px, 2fr) 10fr">
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
      )}
      <Box gridArea="footer">
        <CustomFooter />
      </Box>
    </Box>
  );
};
export default Layout;
