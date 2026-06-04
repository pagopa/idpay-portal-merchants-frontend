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
import { useGetInitiativesQuery } from './redux/api/initiativesApi';
import ShopDetails from './pages/refundRequests/detail/ShopDetails';
import ModifyDocument from './pages/modifyDocument/ModifyDocument';
import ExportReport from './pages/exportReport/ExportReport';
import Reverse from './pages/reverse/Reverse';
import WithInitiativeGuard from './decorators/withInitiativeGuard';

const SecuredRoutes = withLogin(
  withSelectedPartyProducts(() => {
    const [, setMatch] = useState<any>(null);
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
            ROUTES.EXPORT_REPORT,
          ],
          exact: true,
          strict: false,
        })
      );
    }, [location]);

    // Centralized initiatives fetch via RTK Query (bootstrap only, cached)
    useGetInitiativesQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnReconnect: false,
      refetchOnFocus: false,
    });

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
              <WithInitiativeGuard>
                <InitiativeOverview />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.STORES_UPLOAD} exact={true}>
              <WithInitiativeGuard>
                <InitiativeStoresUpload />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.STORES} exact={true}>
              <WithInitiativeGuard>
                <InitiativeStores />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.REPORTED_USERS} exact={true}>
              <WithInitiativeGuard>
                <ReportedUsers />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.REPORTED_USERS_INSERT} exact={true}>
              <WithInitiativeGuard>
                <InsertReportedUser />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.EXPORT_REPORT} exact={true}>
              <WithInitiativeGuard>
                <ExportReport />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.STORES_DETAIL} exact={true}>
              <WithInitiativeGuard>
                <StoreProvider>
                  <InitiativeStoreDetail />
                </StoreProvider>
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.NEW_DISCOUNT} exact={true}>
              <WithInitiativeGuard>
                <NewDiscount />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.ACCEPT_NEW_DISCOUNT} exact={true}>
              <WithInitiativeGuard>
                <AcceptNewDiscount />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.REFUND_REQUESTS} exact={true}>
              <WithInitiativeGuard>
                <RefundRequests />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.REFUND_REQUESTS_STORE} exact={true}>
              <WithInitiativeGuard>
                <StoreProvider>
                  <ShopDetails />
                </StoreProvider>
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.MODIFY_DOCUMENT} exact={true}>
              <WithInitiativeGuard>
                <ModifyDocument />
              </WithInitiativeGuard>
            </Route>
            <Route path={routes.REVERSE} exact={true}>
              <WithInitiativeGuard>
                <Reverse />
              </WithInitiativeGuard>
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
