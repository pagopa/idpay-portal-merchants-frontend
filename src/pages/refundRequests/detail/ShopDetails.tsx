import React from 'react';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ShopDetails: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<{ store: any }>();
  const store = location.state?.store;

  const history = useHistory();

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 8' }}>
          <Box sx={{ display: 'flex', gridColumn: 'span 12', alignItems: 'center', marginTop: 2 }}>
            <ButtonNaked
              component="button"
              onClick={() => history.goBack()}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: 'primary.main',
                fontSize: '1rem',
                marginBottom: '3px',
                marginRight: '8px',
                fontWeight: 700,
              }}
              weight="default"
              data-testid="back-button-test"
            >
              {t('commons.backBtn')}
            </ButtonNaked>
            <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '3px', marginRight: '8px' }}>
              <Typography color="text.primary" variant="body2">
                {'Bonus Elettrodomestici'}
              </Typography>
              <Typography color="text.primary" variant="body2" fontWeight="600">
                {'...'}
              </Typography>
              <Typography color="text.disabled" variant="body2">
                {store?.name}
              </Typography>
            </Breadcrumbs>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
              mt: 3,
            }}
          >
            <TitleBox
              title={store?.name ?? '-'}
              mbTitle={2}
              variantTitle="h4"
              variantSubTitle="body1"
            />
          </Box>
        </Box>
        Pagina punto vendita
      </Box>
    </>
  );
};

export default ShopDetails;
