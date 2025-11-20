import React from 'react';
import { Box, Typography, Breadcrumbs, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import routes from '../../../routes';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import InvoiceDataTable from '../invoiceDataTable';
import BatchDetail from './batchDetail';

interface RouteParams {
  id: string;
}

const RefundRequestDetail: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation<{ batch: any }>();
  const batch = location.state?.batch;

  const history = useHistory();
  const { id } = useParams<RouteParams>();

  const mockData = [
    {
      name: 'DE RISI SPA',
      transactionsNumber: 1234,
      refundAmount: '8.000,00 €',
      status: 'CREATED',
    },
    {
      name: 'ABCDC SPA',
      transactionsNumber: 1234,
      refundAmount: '8.000,00 €',
      status: 'CREATED',
    },
    {
      name: 'NOME SPA',
      transactionsNumber: 1234,
      refundAmount: '8.000,00 €',
      status: 'CREATED',
    },
  ];

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
                {'Richieste di rimborso'}
              </Typography>
              <Typography color="text.disabled" variant="body2">
                {batch?.name}
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
              title={batch?.name ?? MISSING_DATA_PLACEHOLDER}
              mbTitle={2}
              variantTitle="h4"
              variantSubTitle="body1"
            />
          </Box>
        </Box>

        <BatchDetail batch={batch} />

        <Button
          sx={{ marginY: 3 }}
          onClick={() => {
            history.push(
              routes.REFUND_REQUESTS_STORE.replace(':id', id).replace(':store', mockData[0].name),
              {
                store: mockData[0],
              }
            );
          }}
        >
          mock go to shop page
        </Button>

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

export default RefundRequestDetail;
