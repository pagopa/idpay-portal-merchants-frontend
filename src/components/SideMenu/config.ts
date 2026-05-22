import StoreIcon from '@mui/icons-material/Store';
import ReportIcon from '@mui/icons-material/Report';
import EuroIcon from '@mui/icons-material/Euro';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { SvgIconComponent } from '@mui/icons-material';
import ROUTES from '../../routes';

type ConfigProps = {
  key: string
  title: string
  route: string
  icon: SvgIconComponent
  dataTestId: string
}

export const config: Array<ConfigProps> = [
  {
    key: "initiativeOverview",
    title: 'pages.initiativeOverview.title',
    route: ROUTES.SIDE_MENU_OVERVIEW,
    icon: DashboardIcon,
    dataTestId: 'initiativeOverviewTitle-click-test',
  },
  {
    key: "initiativeStores",
    title: 'pages.initiativeStores.title',
    route: ROUTES.SIDE_MENU_STORES,
    icon: StoreIcon,
    dataTestId: 'initiativeStoresTitle-click-test',
  },
  {
    key: "refundRequests",
    title: 'pages.refundRequests.title',
    route: ROUTES.SIDE_MENU_REFUND_REQUESTS,
    icon: EuroIcon,
    dataTestId: 'refundRequestsTitle-click-test',
  },
  {
    key: "reportedUsers",
    title: 'pages.reportedUsers.title',
    route: ROUTES.SIDE_MENU_REPORTED_USERS,
    icon: ReportIcon,
    dataTestId: 'reportedUsers-click-test',
  },
  {
    key: "reportExport",
    title: 'pages.reportExport.title',
    route: ROUTES.SIDE_MENU_EXPORT_REPORT,
    icon: FileDownloadIcon,
    dataTestId: 'export-report-click-test',
  },
];
