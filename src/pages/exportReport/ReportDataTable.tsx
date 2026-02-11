import React, { useEffect, useState } from 'react';
import { Box, IconButton, Typography, CircularProgress, Paper, Card, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import CachedIcon from '@mui/icons-material/Cached';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DataTable from '../../components/dataTable/DataTable';
import { safeFormatDate } from '../../utils/formatUtils';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

export type MerchantReportDTO = {
  id: string;
  initiativeId: string;
  reportStatus: 'INSERTED' | 'IN_PROGRESS' | 'GENERATED' | 'FAILED';
  fileName: string;
  requestDate: string;
  elaborationDate: string;
  startPeriod: string;
  endPeriod: string;
  merchantId: string;
  businessName: string;
  rewardBatchAssignee: 'L1' | 'L2' | 'L3';
};

type ReportsApiResponse = {
  content: Array<MerchantReportDTO>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'GENERATED':
      return <CachedIcon color="info" />;
    case 'FAILED':
      return <ErrorIcon color="error" />;
    case 'INSERTED':
      return <CheckCircleIcon color="success" />;
    default:
      return <CachedIcon name="default" />;
  }
};

const mockFetchReports = (): Promise<ReportsApiResponse> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        content: [
          {
            id: '1',
            initiativeId: 'INIT-001',
            reportStatus: 'INSERTED',
            fileName: 'Report_300126.csv',
            requestDate: '2026-01-30T11:11:00Z',
            elaborationDate: '2026-01-30T11:11:00Z',
            startPeriod: '2025-12-30T00:00:00Z',
            endPeriod: '2026-01-30T00:00:00Z',
            merchantId: 'MERCHANT-001',
            businessName: 'Esercente Demo',
            rewardBatchAssignee: 'L1',
          },
        ],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      });
    }, 500);
  });

const ReportDataTable: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ReportsApiResponse>({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [pagination, setPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadReports = () => {
    setLoading(true);

    void mockFetchReports().then((response) => {
      setReports(response);
      setPagination({
        pageNo: response.page,
        pageSize: response.size,
        totalElements: response.totalElements,
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    loadReports();
  }, [pagination.pageNo, pagination.pageSize]);

  const columns = [
    {
      field: 'fileName',
      headerName: 'Nome file',
      flex: 1,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <>
          {getStatusIcon(params.row.reportStatus)}
          <Tooltip
            title={
              params.row.fileName && params.row.fileName !== ''
                ? params.row.fileName
                : MISSING_DATA_PLACEHOLDER
            }
          >
            <Typography variant="caption-semibold" fontSize="1rem">
              {params.row.fileName}
            </Typography>
          </Tooltip>
        </>
      ),
    },
    {
      field: 'requestDate',
      headerName: 'Data richiesta',
      flex: 1,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Typography color={theme.palette.text.secondary} fontWeight={400}>
          {safeFormatDate(params.row.requestDate)}
        </Typography>
      ),
    },
    {
      field: 'elaborationDate',
      headerName: 'Data generazione',
      flex: 1,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Typography color={theme.palette.text.secondary} fontWeight={400}>
          {safeFormatDate(params.row.elaborationDate)}
        </Typography>
      ),
    },
    {
      field: 'period',
      headerName: 'Periodo',
      flex: 1,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => {
        const period =
          safeFormatDate(params.row.startPeriod, false) +
          ' - ' +
          safeFormatDate(params.row.endPeriod, false);
        return (
          <Tooltip title={period && period !== '' ? period : MISSING_DATA_PLACEHOLDER}>
            <Typography variant="caption-semibold" fontSize="1rem">
              {period}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      disableColumnMenu: true,
      align: 'right' as const,
      renderCell: (params: any) => {
        if (params.row.reportStatus !== 'FAILED'){
          return (
            <IconButton disabled={params.row.reportStatus === 'GENERATED'}>
              <DownloadIcon color='primary'/>
            </IconButton>
          );
        }
          return '';
      },
    },
  ];

  const tableRows = reports.content.map((row) => ({
    ...row,
    id: row.id,
  }));

  const handlePaginationPageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, pageNo: page }));
  };

  const handleRowsPerPageChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageNo: 0, pageSize }));
  };

  return (
    <Card>
      <Box px={2} sx={{ mt: 3, position: 'relative' }}>
        <Typography variant="h6" mb={2}>
          {t('pages.reportExport.reportTitle')}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <DataTable
              rows={tableRows}
              columns={columns}
              rowsPerPage={pagination.pageSize}
              paginationModel={{
                pageNo: pagination.pageNo,
                pageSize: pagination.pageSize,
                totalElements: pagination.totalElements,
              }}
              onPaginationPageChange={handlePaginationPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        )}

        {!loading && reports.content.length === 0 && (
          <Paper
            sx={{
              my: 4,
              p: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">{t('pages.reportExport.noReportFound')}</Typography>
          </Paper>
        )}
      </Box>
    </Card>
  );
};

export default ReportDataTable;
