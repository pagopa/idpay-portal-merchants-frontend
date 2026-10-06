import { ReactNode } from 'react';
import AcceptNewDiscount from './pages/acceptNewDiscount/acceptNewDiscount';
import ExportReport from './pages/exportReport/ExportReport';
import InitiativeOverview from './pages/initiativeOverview/initiativeOverview';
import InitiativeStoreDetail from './pages/initiativeStores/initiativeStoreDetail';
import InitiativeStores from './pages/initiativeStores/InitiativeStores';
import InitiativeStoresUpload from './pages/initiativeStores/initiativeStoresUpload';
import { StoreProvider } from './pages/initiativeStores/StoreContext';
import ModifyDocument from './pages/modifyDocument/ModifyDocument';
import NewDiscount from './pages/newDiscount/newDiscount';
import ShopDetails from './pages/refundRequests/detail/ShopDetails';
import RefundRequests from './pages/refundRequests/RefundRequests';
import InsertReportedUser from './pages/reportedUsers/insertReportedUser';
import ReportedUsers from './pages/reportedUsers/reportedUsers';
import Reverse from './pages/reverse/Reverse';
import routes from './routes';

type ConfigProps = {
  key: string;
  route: string;
  render: () => ReactNode;
};

export const routesConfig: Array<ConfigProps> = [
  {
    key: 'initiativeOverview',
    route: routes.OVERVIEW,
    render: () => <InitiativeOverview />,
  },
  {
    key: 'initiativeStoresUpload',
    route: routes.STORES_UPLOAD,
    render: () => <InitiativeStoresUpload />,
  },
  {
    key: 'initiativeStores',
    route: routes.STORES,
    render: () => <InitiativeStores />,
  },
  {
    key: 'reportedUsers',
    route: routes.REPORTED_USERS,
    render: () => <ReportedUsers />,
  },
  {
    key: 'insertReportedUser',
    route: routes.REPORTED_USERS_INSERT,
    render: () => <InsertReportedUser />,
  },
  {
    key: 'reportExport',
    route: routes.EXPORT_REPORT,
    render: () => <ExportReport />,
  },
  {
    key: 'initiativeStoreDetail',
    route: routes.STORES_DETAIL,
    render: () => (
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    ),
  },
  {
    key: 'newDiscount',
    route: routes.NEW_DISCOUNT,
    render: () => <NewDiscount />,
  },
  {
    key: 'acceptNewDiscount',
    route: routes.ACCEPT_NEW_DISCOUNT,
    render: () => <AcceptNewDiscount />,
  },
  {
    key: 'refundRequests',
    route: routes.REFUND_REQUESTS,
    render: () => <RefundRequests />,
  },
  {
    key: 'refundRequestsStore',
    route: routes.REFUND_REQUESTS_STORE,
    render: () => (
      <StoreProvider>
        <ShopDetails />
      </StoreProvider>
    ),
  },
  {
    key: 'modifyDocument',
    route: routes.MODIFY_DOCUMENT,
    render: () => <ModifyDocument />,
  },
  {
    key: 'reverse',
    route: routes.REVERSE,
    render: () => <Reverse />,
  },
];
