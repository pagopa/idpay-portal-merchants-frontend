import React, { useEffect, useState } from 'react';
import { Box, Card, CircularProgress, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import CachedIcon from '@mui/icons-material/Cached';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useParams } from 'react-router-dom';
import DataTable from '../../components/dataTable/DataTable';
import { safeFormatDate } from '../../utils/formatUtils';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { downloadMerchantReport, getMerchantReports } from '../../services/merchantService';
import { ReportDTO, ReportStatusEnum } from '../../api/generated/merchants/ReportDTO';

type RouteParams = {
  id: string;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case ReportStatusEnum.GENERATED || ReportStatusEnum.INSERTED:
      return <CachedIcon color="info" />;
    case ReportStatusEnum.FAILED:
      return <ErrorIcon color="error" />;
    case ReportStatusEnum.INSERTED:
      return <CheckCircleIcon color="success" />;
    default:
      return <CachedIcon name="default" />;
  }
};


const ReportDataTable: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<RouteParams>();
  const [reports, setReports] = useState<any>({
    reports: [],
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadReports = () => {
    if (!id) {return;}

    setLoading(true);

    void getMerchantReports(id, pagination.pageNo, pagination.pageSize)
      .then((response) => {
        setReports(response);
        setPagination({
          pageNo: response.page ?? 0,
          pageSize: response.size ?? 10,
          totalElements: response.totalElements ?? 0,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [pagination.pageNo, pagination.pageSize]);

  const handleDownload = async (reportId: string, fileName: string) => {
    if (!id) {
      return;
    }

    setDownloadingId(reportId);

    try {
      const response = await downloadMerchantReport(id, reportId);
      const blob = new Blob([response as any], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      // eslint-disable-next-line functional/immutable-data
      link.href = url;
      link.setAttribute('download', fileName || 'report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report', error);
    } finally {
      setDownloadingId(null);
    }
  };

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
            <Typography variant="caption-semibold" fontSize="1rem" pl={1}>
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
        if (params.row.reportStatus !== ReportStatusEnum.FAILED) {
          return (
            <IconButton
              disabled={
                params.row.reportStatus !== ReportStatusEnum.INSERTED ||
                downloadingId === params.row.id
              }
              onClick={() =>
                handleDownload(params.row.id, params.row.fileName)
              }
            >
              <DownloadIcon
                color={
                  params.row.reportStatus === ReportStatusEnum.INSERTED &&
                  downloadingId !== params.row.id
                    ? 'primary'
                    : 'disabled'
                }
              />
            </IconButton>
          );
        }
        return '';
      },
    },
  ];

  const tableRows = reports?.reports?.map((row: ReportDTO) => ({
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
      <Box px={2} sx={{ mt: 2, position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {reports?.reports && reports.reports.length > 0 ? (
              <>
                <Typography variant="h6" mb={2}>
                  {t('pages.reportExport.reportTitle')}
                </Typography>

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
                    isTransactionsPage={true}
                  />
                </Box>
              </>
            ) : (
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2">
                  {t('pages.reportExport.noReportFound')}
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>
    </Card>
  );
};

export default ReportDataTable;
