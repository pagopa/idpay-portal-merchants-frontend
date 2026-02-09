import { Box, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { TitleBox } from "@pagopa/selfcare-common-frontend";
import { useTranslation } from 'react-i18next';
import ExportFiltersCard from '../../components/exportFiltersCard/ExportFiltersCard';



const InitiativeExportReportPage = () => {
  const { t } = useTranslation();

  // const { setAlert } = useAlert();

  return (
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
        <ExportFiltersCard
          onGenerateReport={(range: { from: string; to: string }) => console.log(range.from+'-'+range.to)}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1, mb: 3 }}>
        <Table sx={{ backgroundColor: '#FFFFFF' }}>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={10}
                sx={{
                  textAlign: 'center',
                  py: 4,
                  fontSize: 16,
                  fontWeight: 500,
                  color: '#5C6F82',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {t('pages.reportExport.noReportFound')}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default InitiativeExportReportPage;