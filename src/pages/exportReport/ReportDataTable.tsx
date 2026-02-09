import React, { useEffect, useState } from 'react';
import { Box, IconButton, Typography, CircularProgress, Paper, Card } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import DataTable from '../../components/dataTable/DataTable';
import { safeFormatDate } from '../../utils/formatUtils';

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

const mockFetchReports = (): Promise<ReportsApiResponse> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        content: [
          {
            id: '1',
            initiativeId: 'INIT-001',
            reportStatus: 'GENERATED',
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
      renderCell: (params: any) => <Typography fontWeight={600}>{params.row.fileName}</Typography>,
    },
    {
      field: 'requestDate',
      headerName: 'Data richiesta',
      flex: 1,
      renderCell: (params: any) => safeFormatDate(params.row.requestDate),
    },
    {
      field: 'elaborationDate',
      headerName: 'Data generazione',
      flex: 1,
      renderCell: (params: any) => safeFormatDate(params.row.elaborationDate),
    },
    {
      field: 'period',
      headerName: 'Periodo',
      flex: 1,
      renderCell: (params: any) => (
        <Typography fontWeight={600}>
          {safeFormatDate(params.row.startPeriod)} - {safeFormatDate(params.row.endPeriod)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      align: 'right' as const,
      renderCell: () => (
        <IconButton>
          <DownloadIcon />
        </IconButton>
      ),
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
