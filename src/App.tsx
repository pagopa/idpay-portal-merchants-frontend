import {
  ErrorBoundary,
  LoadingOverlay,
  UnloadEventHandler,
  UserNotifyHandle,
} from '@pagopa/selfcare-common-frontend';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import withSelectedPartyProducts from './decorators/withSelectedPartyProducts';
import withLogin from './decorators/withLogin';
import Layout from './components/Layout/Layout';
import Auth from './pages/auth/Auth';
import TOSWall from './components/TOS/TOSWall';
import TOSLayout from './components/TOSLayout/TOSLayout';
import TOS from './pages/tos/TOS';
import PrivacyPolicy from './pages/privacyPolicy/PrivacyPolicy';
import routes from './routes';
import useTCAgreement from './hooks/useTCAgreement';
import InitiativesList from './pages/initiativesList/initiativesList';
import Assistance from './pages/assistance/assistance';
import InitiativeDiscounts from './pages/initiativeDiscounts/initiativeDiscounts';
import NewDiscount from './pages/newDiscount/newDiscount';
import AcceptNewDiscount from './pages/acceptNewDiscount/acceptNewDiscount';
import InitiativeOverview from './pages/initiativeOverview/initiativeOverview';
import InitiativeStoresUpload from './pages/initiativeStores/initiativeStoresUpload';
import InitiativeStoreDetail from './pages/initiativeStores/initiativeStoreDetail';

const SecuredRoutes = withLogin(
  withSelectedPartyProducts(() => {
    const location = useLocation();
    const { isTOSAccepted, acceptTOS, firstAcceptance } = useTCAgreement();

    if (
      isTOSAccepted === false &&
      location.pathname !== routes.PRIVACY_POLICY &&
      location.pathname !== routes.TOS
    ) {
      return (
        <TOSLayout>
          <TOSWall
            acceptTOS={acceptTOS}
            privacyRoute={routes.PRIVACY_POLICY}
            tosRoute={routes.TOS}
            firstAcceptance={firstAcceptance}
          />
        </TOSLayout>
      );
    } else if (
      typeof isTOSAccepted === 'undefined' &&
      location.pathname !== routes.PRIVACY_POLICY &&
      location.pathname !== routes.TOS
    ) {
      return <></>;
    }

    return (
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
          <Route path={routes.DISCOUNTS} exact={true}>
            <InitiativeDiscounts />
          </Route>
          <Route path={routes.OVERVIEW} exact={true}>
            <InitiativeOverview />
          </Route>
          <Route path={routes.STORES_UPLOAD} exact={true}>
            <InitiativeStoresUpload />
          </Route>
          <Route path={routes.STORES} exact={true}>
            <InitiativeStoreDetail />
          </Route>
          <Route path={routes.NEW_DISCOUNT} exact={true}>
            <NewDiscount />
          </Route>
          <Route path={routes.ACCEPT_NEW_DISCOUNT} exact={true}>
            <AcceptNewDiscount />
          </Route>
          <Route path="*">
            <Redirect to={routes.HOME} />
          </Route>
        </Switch>
      </Layout>
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
