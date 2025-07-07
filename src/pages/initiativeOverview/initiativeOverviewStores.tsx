import { Box, Card, CardContent, Button } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import StoreIcon from '@mui/icons-material/Store';



const InitiativeOverviewStores = () => {
  const { t } = useTranslation();

  return (
    <Card sx={{ width:'100%', display: 'grid', gridColumn: 'span 12' }}>
      <CardContent
        sx={{
          p: 3,
          display: 'grid',
          width: '100%',
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'baseline',
          rowGap: 1,
        }}
      >
        <Box sx={{ display: 'grid', gridColumn: 'span 8', mt: 2 }}>
          <TitleBox
            title={t('pages.initiativeOverview.stores')}
            subTitle={t('pages.initiativeOverview.storesSubtitle')}
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={1}
            variantTitle="h5"
            variantSubTitle="caption"
          />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridColumn: 'span 12',
            mb: 5
          }}
        >
          <Box display="inline-block">
            <Button
              variant="contained"
              startIcon={<StoreIcon/>}
              size="medium"
              fullWidth={false}
            >
              {t('pages.initiativeOverview.storesSubtitle')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InitiativeOverviewStores;
