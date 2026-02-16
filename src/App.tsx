import {
  ErrorBoundary,
  LoadingOverlay,
  UnloadEventHandler,
  UserNotifyHandle,
} from '@pagopa/selfcare-common-frontend';
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
import NewDiscount from './pages/newDiscount/newDiscount';
import AcceptNewDiscount from './pages/acceptNewDiscount/acceptNewDiscount';
import InitiativeOverview from './pages/initiativeOverview/initiativeOverview';
import InitiativeStoresUpload from './pages/initiativeStores/initiativeStoresUpload';
import InitiativeStores from './pages/initiativeStores/InitiativeStores';
import InitiativeStoreDetail from './pages/initiativeStores/initiativeStoreDetail';
import { StoreProvider } from './pages/initiativeStores/StoreContext';
import ReportedUsers from './pages/reportedUsers/reportedUsers';
import InsertReportedUser from './pages/reportedUsers/insertReportedUser';
import { AlertProvider } from './contexts/AlertContext';
import RefundRequests from './pages/refundRequests/RefundRequests';
import ROUTES from './routes';
import { useInitiativesList } from './hooks/useInitiativesList';
import ShopDetails from './pages/refundRequests/detail/ShopDetails';
import ModifyDocument from './pages/modifyDocument/ModifyDocument';

const SecuredRoutes = withLogin(
  withSelectedPartyProducts(() => {
    const [match, setMatch] = useState<any>(null);
    const location = useLocation();

    useEffect(() => {
      setMatch(
        matchPath(location.pathname, {
          path: [
            ROUTES.HOME,
            ROUTES.DISCOUNTS,
            ROUTES.OVERVIEW,
            ROUTES.STORES,
            ROUTES.REPORTED_USERS,
            ROUTES.STORES_DETAIL,
            ROUTES.REFUND_REQUESTS,
            ROUTES.REFUND_REQUESTS_STORE,
          ],
          exact: true,
          strict: false,
        })
      );
    }, [location]);

    useInitiativesList(match);

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
            <Route path={routes.OVERVIEW} exact={true}>
              <InitiativeOverview />
            </Route>
            <Route path={routes.STORES_UPLOAD} exact={true}>
              <InitiativeStoresUpload />
            </Route>
            <Route path={routes.STORES} exact={true}>
              <InitiativeStores />
            </Route>
            <Route path={routes.REPORTED_USERS} exact={true}>
              <ReportedUsers />
            </Route>
            <Route path={routes.REPORTED_USERS_INSERT} exact={true}>
              <InsertReportedUser />
            </Route>
            <Route path={routes.STORES_DETAIL} exact={true}>
              <StoreProvider>
                <InitiativeStoreDetail />
              </StoreProvider>
            </Route>
            <Route path={routes.NEW_DISCOUNT} exact={true}>
              <NewDiscount />
            </Route>
            <Route path={routes.ACCEPT_NEW_DISCOUNT} exact={true}>
              <AcceptNewDiscount />
            </Route>
            <Route path={routes.REFUND_REQUESTS} exact={true}>
              <RefundRequests />
            </Route>
            <Route path={routes.REFUND_REQUESTS_STORE} exact={true}>
              <StoreProvider>
                <ShopDetails />
              </StoreProvider>
            </Route>
            <Route path={routes.MODIFY_DOCUMENT} exact={true}>
              <ModifyDocument />
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
