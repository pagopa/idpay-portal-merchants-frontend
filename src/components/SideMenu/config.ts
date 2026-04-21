import StoreIcon from '@mui/icons-material/Store';
import ReportIcon from '@mui/icons-material/Report';
import EuroIcon from '@mui/icons-material/Euro';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ROUTES from '../../routes';

export const config = [
  {
    title: 'pages.initiativeOverview.title',
    route: ROUTES.SIDE_MENU_OVERVIEW,
    icon: DashboardIcon,
    dataTestId: 'initiativeOverviewTitle-click-test',
  },
  {
    title: 'pages.initiativeStores.title',
    route: ROUTES.SIDE_MENU_STORES,
    icon: StoreIcon,
    dataTestId: 'initiativeStoresTitle-click-test',
  },
  {
    title: 'pages.refundRequests.title',
    route: ROUTES.SIDE_MENU_REFUND_REQUESTS,
    icon: EuroIcon,
    dataTestId: 'refundRequestsTitle-click-test',
  },
  {
    title: 'pages.reportedUsers.title',
    route: ROUTES.SIDE_MENU_REPORTED_USERS,
    icon: ReportIcon,
    dataTestId: 'reportedUsers-click-test',
  },
  {
    title: 'pages.reportExport.title',
    route: ROUTES.SIDE_MENU_EXPORT_REPORT,
    icon: FileDownloadIcon,
    dataTestId: 'export-report-click-test',
  },
];
