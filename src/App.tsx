import {
  ErrorBoundary,
  LoadingOverlay,
  UnloadEventHandler,
  UserNotifyHandle,
} from '@pagopa/selfcare-common-frontend/lib';
import { matchPath, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import withSelectedPartyProducts from './decorators/withSelectedPartyProducts';
import withLogin from './decorators/withLogin';
import Layout from './components/Layout/Layout';
import Auth from './pages/auth/Auth';
import TOS from './pages/tos/TOS';
import PrivacyPolicy from './pages/privacyPolicy/PrivacyPolicy';
import routes from './routes';
import InitiativesList from './pages/initiativesList/initiativesList';
import Assistance from './pages/assistance/assistance';
import { AlertProvider } from './contexts/AlertContext';
import ROUTES from './routes';
import { useGetInitiativesQuery } from './redux/api/initiativesApi';
import WithInitiativeGuard from './decorators/withInitiativeGuard';
import { routesConfig } from './routesConfig';
import PosCatalog from './pages/pointOfSalesCatalog/posCatalog';

const SecuredRoutes = withLogin(
  withSelectedPartyProducts(() => {
    const [match, setMatch] = useState<any>(null);
    const location = useLocation();

    useEffect(() => {
      setMatch(
        matchPath(location.pathname, {
          path: [ROUTES.PRIVACY_POLICY, ROUTES.TOS, ROUTES.ASSISTANCE, ROUTES.AUTH],
          exact: true,
          strict: false,
        })
      );
    }, [location]);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    useGetInitiativesQuery({ enabled: !match });

    return (
      <AlertProvider>
        <Layout>
          <Switch>
            <Route path={routes.HOME} exact={true}>
              <InitiativesList />
            </Route>
            <Route path={routes.ASSISTANCE} exact={true}>
              <Assistance />
            </Route>

            <Route path={routes.TOS} exact={true}>
              <TOS />
            </Route>

            <Route path={routes.PRIVACY_POLICY} exact={true}>
              <PrivacyPolicy />
            </Route>

            {/* <Route path={routes.DISCOUNTS} exact={true}>
            <InitiativeDiscounts />
          </Route> */}

            {routesConfig.map(({ key, route, render }) => (
              <Route key={key} path={route} exact={true}>
                <WithInitiativeGuard route={key}>{render()}</WithInitiativeGuard>
              </Route>
            ))}

            <Route path={routes.POS_CATALOG}>
              <PosCatalog />
            </Route>

            <Route path="*">
              <Redirect to={routes.HOME} />
            </Route>
          </Switch>
        </Layout>
      </AlertProvider>
    );
  })
);

const App = () => (
  <ErrorBoundary>
    <LoadingOverlay />
    <UserNotifyHandle />
    <UnloadEventHandler />
    <Switch>
      <Route path={routes.AUTH}>
        <Auth />
      </Route>
      <Route path="*">
        <SecuredRoutes />
      </Route>
    </Switch>
  </ErrorBoundary>
);

export default App;
