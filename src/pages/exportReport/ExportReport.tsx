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
      text: 'Il report è stato generato ed è pronto per il download.',
      isOpen: false,
      severity: 'success',
    },
    generated: {
      text: 'Stiamo elaborando il file. Una volta fatto, il report potrà essere scaricato in questa sezione.',
      isOpen: false,
      severity: 'info',
    },
    failed: {
      text: 'Si è verificato un errore nella generazione del report. Riprova',
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

  return (
    <>
      <Box sx={{ width: '100%', pt: 2, px: 2 }}>
        <Box>
          <Box sx={{ display: 'grid', gridColumn: 'span 10', mt: 2 }}>
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
          <ExportFiltersCard updateAlerts={updateAlerts} />
        </Box>
        <ReportDataTable />
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
