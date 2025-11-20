import React from 'react';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import InvoiceDataTable from '../invoiceDataTable';
import { ShopCard } from './ShopCard';

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
                {'Rimborsi'}
              </Typography>
              <Typography color="text.disabled" variant="body2">
                {store?.insegna}
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
              title={store?.insegna ?? MISSING_DATA_PLACEHOLDER}
              mbTitle={2}
              variantTitle="h4"
              variantSubTitle="body1"
            />
          </Box>
        </Box>

        <ShopCard />

        <Box
          sx={{
            height: 'auto',
            width: '100%',
            mt: 2,
            '& .MuiDataGrid-footerContainer': { display: 'none' },
          }}
        >
          <InvoiceDataTable />
        </Box>

      </Box>
    </>
  );
};

export default ShopDetails;
