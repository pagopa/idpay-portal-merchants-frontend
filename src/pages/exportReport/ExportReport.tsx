import { Box } from '@mui/material';
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import AlertListComponent, { AlertProps } from '../../components/Alert/AlertListComponent';
import ExportFiltersCard from '../../components/exportFiltersCard/ExportFiltersCard';
import ReportDataTable from './ReportDataTable';

const InitiativeExportReportPage = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Record<string, AlertProps>>({
    INSERTED: {
      text: t('pages.reportExport.alert.info'),
      severity: "info",
      isOpen: false
    },
    IN_PROGRESS: {
      text: t('pages.reportExport.alert.info'),
      severity: "info",
      isOpen: false
    },
    GENERATED: {
      text: t('pages.reportExport.alert.success'),
      severity: "success",
      isOpen: false
    },
    FAILED: {
      text: t('pages.reportExport.alert.error'),
      severity: "error",
      isOpen: false
    },
    error: {
      title: t('errors.genericTitle'),
      text: t('errors.genericDescription'),
      severity: "error",
      isOpen: false
    }
  });

  const updateAlerts = useCallback((key: string, open: boolean) => {
    setAlerts((prev) => ({
      ...prev,
      [key]: { ...prev[key], isOpen: open },
    }));
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box>
          <Box sx={{ display: 'grid', gridColumn: 'span 10' }}>
            <TitleBox
              title={t('pages.reportExport.title')}
              subTitle={t('pages.reportExport.subtitle')}
              mbTitle={2}
              mtTitle={2}
              mbSubTitle={5}
              variantTitle="h4"
              variantSubTitle="body1"
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mt: 1, mb: 3, alignItems: 'center' }}>
          <ExportFiltersCard
            updateAlerts={updateAlerts}
            onReportGenerated={() => setRefreshKey((prev) => prev + 1)}
          />
        </Box>
        <ReportDataTable
          updateAlerts={updateAlerts}
          refreshKey={refreshKey}
        />
      </Box>
      <AlertListComponent
        alertList={Object.entries(alerts).map(([key, value]) => ({
          ...value,
          onClose: () => updateAlerts(key, false),
        }))}
      />
    </>
  );
};

export default InitiativeExportReportPage;
