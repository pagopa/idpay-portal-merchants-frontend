import { Box } from '@mui/material';
import { TitleBox } from "@pagopa/selfcare-common-frontend";
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import AlertListComponent, { AlertProps } from '../../components/Alert/AlertListComponent';
import ExportFiltersCard from '../../components/exportFiltersCard/ExportFiltersCard';
import ReportDataTable from './ReportDataTable';

const InitiativeExportReportPage = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Record<string, AlertProps>>({
    inserted: {
      text: t('pages.reportExport.alert.success'),
      isOpen: false,
      severity: 'success',
    },
    generated: {
      text: t('pages.reportExport.alert.info'),
      isOpen: false,
      severity: 'info',
    },
    failed: {
      text: t('pages.reportExport.alert.error'),
      isOpen: false,
      severity: 'error',
    },
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
      <Box sx={{ width: '100%'}}>
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
        <ReportDataTable refreshKey={refreshKey} />
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
