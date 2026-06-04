import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Box, Card, CircularProgress, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { theme } from '@pagopa/mui-italia/theme';
import CachedIcon from '@mui/icons-material/Cached';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useParams } from 'react-router-dom';
import DataTable from '../../components/dataTable/DataTable';
import { safeFormatDate } from '../../utils/formatUtils';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { downloadMerchantReport, getMerchantReports } from '../../services/merchantService';
import { ReportDTO } from '../../api/generated/merchants/data-contracts';
import { browserConsole } from '../../utils/consoleLogger';
import useScopedTranslation from '../../hooks/useScopedTranslation';

type ReportStatusEnum = ReportDTO['reportStatus'];
const INSERTED: ReportStatusEnum = 'INSERTED';
const IN_PROGRESS: ReportStatusEnum = 'IN_PROGRESS';
const FAILED: ReportStatusEnum = 'FAILED';
const GENERATED: ReportStatusEnum = 'GENERATED';

type RouteParams = {
  initiative_id: string;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case INSERTED:
    case IN_PROGRESS:
      return <CachedIcon color="info" />;
    case FAILED:
      return <ErrorIcon color="error" />;
    case GENERATED:
      return <CheckCircleIcon color="success" />;
    default:
      return <CachedIcon color="info" />;
  }
};

interface ReportDataTableProps {
  updateAlerts: (key: string, open: boolean) => void;
  refreshKey: number;
}

const ReportDataTable: React.FC<ReportDataTableProps> = ({ updateAlerts, refreshKey }) => {
  const { t } = useScopedTranslation();
  const { initiative_id } = useParams<RouteParams>();

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
  const requestIdRef = useRef<number>(0);

  const loadReports = async (pageNo: number, pageSize: number) => {
    if (!initiative_id) {
      return;
    }

    const currentRequestId = requestIdRef.current + 1;
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = currentRequestId;

    setLoading(true);

    try {
      const response = await getMerchantReports(initiative_id, pageNo, pageSize);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setReports(response);
      setPagination({
        pageNo: response.page ?? 0,
        pageSize: response.size ?? 10,
        totalElements: response.totalElements ?? 0,
      });
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!initiative_id) {
      return;
    }
    void loadReports(pagination.pageNo, pagination.pageSize);
  }, [initiative_id, pagination.pageNo, pagination.pageSize]);

  useEffect(() => {
    if (!initiative_id) {
      return;
    }

    if (refreshKey) {
      setPagination((prev) => ({
        ...prev,
        pageNo: 0,
      }));
    }
  }, [refreshKey, initiative_id]);

  const handleDownload = useCallback(
    async (reportId: string, fileName: string) => {
      if (!initiative_id) {
        return;
      }

      setDownloadingId(reportId);

      try {
        const response = await downloadMerchantReport(initiative_id, reportId);
        const reportUrl = (response as any)?.reportUrl;

        if (reportUrl) {
          const link = document.createElement('a');
          // eslint-disable-next-line functional/immutable-data
          link.href = reportUrl;
          link.setAttribute('download', fileName || 'report.csv');
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
        }
      } catch (error) {
        browserConsole.error('Error downloading report', error);
        updateAlerts('error', true);
        setTimeout(() => updateAlerts('error', false), 3000);
      } finally {
        setDownloadingId(null);
      }
    },
    [initiative_id, updateAlerts]
  );

  const columns = useMemo(
    () => [
      {
        field: 'fileName',
        headerName: 'Nome file',
        flex: 3,
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
              <Typography
                variant="caption-semibold"
                fontSize="1rem"
                pl={1}
                sx={{ maxWidth: '100% !important' }}
                className="ShowDots"
              >
                {params.row.fileName}
              </Typography>
            </Tooltip>
          </>
        ),
      },
      {
        field: 'requestDate',
        headerName: 'Data richiesta',
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params: any) => (
          <Tooltip
            title={
              params.row.requestDate && params.row.requestDate !== ''
                ? safeFormatDate(params.row.requestDate)
                : MISSING_DATA_PLACEHOLDER
            }
          >
            <Typography color={theme.palette.text.secondary} fontWeight={400} className="ShowDots">
              {safeFormatDate(params.row.requestDate)}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'elaborationDate',
        headerName: 'Data generazione',
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params: any) => (
          <Tooltip
            title={
              params.row.elaborationDate && params.row.elaborationDate !== ''
                ? safeFormatDate(params.row.elaborationDate)
                : MISSING_DATA_PLACEHOLDER
            }
          >
            <Typography color={theme.palette.text.secondary} fontWeight={400} className="ShowDots">
              {safeFormatDate(params.row.elaborationDate)}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'period',
        headerName: 'Periodo',
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params: any) => {
          const period =
            safeFormatDate(params.row.startPeriod, false) +
            ' - ' +
            safeFormatDate(params.row.endPeriod, false);

          return (
            <Tooltip title={period && period !== '' ? period : MISSING_DATA_PLACEHOLDER}>
              <Typography
                variant="caption-semibold"
                fontSize="1rem"
                sx={{ maxWidth: '100% !important' }}
                className="ShowDots"
              >
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
          if (params.row.reportStatus !== FAILED) {
            return (
              <IconButton
                disabled={params.row.reportStatus !== GENERATED || downloadingId === params.row.id}
                onClick={() => handleDownload(params.row.id, params.row.fileName)}
              >
                <DownloadIcon
                  color={
                    params.row.reportStatus === GENERATED && downloadingId !== params.row.id
                      ? 'primary'
                      : 'disabled'
                  }
                />
              </IconButton>
            );
          }
          return null;
        },
      },
    ],
    [downloadingId, handleDownload]
  );

  const tableRows = useMemo(
    () =>
      reports?.reports?.map((row: ReportDTO) => ({
        ...row,
        id: row.id,
      })),
    [reports]
  );

  const handlePaginationPageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, pageNo: page }));
  }, []);

  const handleRowsPerPageChange = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageNo: 0, pageSize }));
  }, []);

  return (
    <Card>
      <Box px={2} sx={{ position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {reports?.reports && reports.reports.length > 0 ? (
              <>
                <Typography variant="h6" my={2}>
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
                <Typography variant="body2">{t('pages.reportExport.noReportFound')}</Typography>
              </Paper>
            )}
          </>
        )}
      </Box>
    </Card>
  );
};

export default ReportDataTable;
