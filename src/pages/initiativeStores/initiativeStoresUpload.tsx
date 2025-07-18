import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Link,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { matchPath } from 'react-router-dom';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import ROUTES from '../../routes';
import { genericContainerStyle } from '../../styles';
import PointsOfSaleForm from '../../components/pointsOfSaleForm/PointsOfSaleForm';
import { PointOfSaleDTO } from '../../api/generated/merchants/PointOfSaleDTO';
import { updateMerchantPointOfSales } from '../../services/merchantService';

interface MatchParams {
  id: string;
}

const InitiativeStoresUpload: React.FC = () => {
  const [uploadMethod, setUploadMethod] = useState<'csv' | 'manual'>('csv');
  const [salesPoints, setSalesPoints] = useState<Array<PointOfSaleDTO>>([]);
  const { t } = useTranslation();


  const match = matchPath(location.pathname, {
    path: [ROUTES.STORES_UPLOAD],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};

  useEffect(() => {
    console.log(id);
  }, []);

  const onFormChange = (salesPoints: Array<PointOfSaleDTO>) => {
    setSalesPoints(salesPoints);
  };

  const handleConfirm = async () => {
    if(uploadMethod === 'manual') {
      const merchantId = JSON.parse(localStorage.getItem('user') || '{}').uid;
      // const filteredSalesPoints = filterSalesPointsByType(salesPoints);
      await updateMerchantPointOfSales(merchantId, salesPoints);
    }
  };

  // const filterSalesPointsByType = (salesPoints: Array<PointOfSaleDTO>) => salesPoints.map(salesPoint => {
  //     if (salesPoint.type === 'ONLINE') {
  //       return {
  //         type: 'ONLINE',
  //         franchiseName: salesPoint.franchiseName,
  //         website: salesPoint.webSite,
  //         contactEmail: salesPoint.contactEmail,
  //         contactName: salesPoint.contactName,
  //         contactSurname: salesPoint.contactSurname};
  //     } else {
  //       return {
  //         type: 'PHYSICAL',
  //         franchiseName: salesPoint.franchiseName,
  //         address: salesPoint.address,
  //         city: salesPoint.city,
  //         zipCode: salesPoint.zipCode,
  //         region: salesPoint.region,
  //         province: salesPoint.province,
  //         contactEmail: salesPoint.contactEmail,
  //         contactName: salesPoint.contactName,
  //         contactSurname: salesPoint.contactSurname,
  //         channels: salesPoint.channels 
  //       };
  //     }
  //   });   

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>

      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 8', mt: 2 }}>
          <Link href="#" underline="none" sx={{ display: 'inline-block', mb: 2 }}>
            &lt; {t('commons.backBtn')}
          </Link>
          <TitleBox
            title={t('pages.initiativeStores.uploadStores')}
            mbTitle={2}
            mtTitle={2}
            variantTitle="h4"
          />
        </Box>
      </Box>

        <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: 'grid', gridColumn: 'span 8', mt: 2 }}>
            <TitleBox
              title={t('pages.initiativeStores.addStore')}
              subTitle={t('pages.initiativeStores.addStoresSubtitle')}
              mbTitle={3}
              mtTitle={2}
              mbSubTitle={2}
              variantTitle="h6"
              variantSubTitle="body2"
            />
            <Link href="#" underline="hover" sx={{ display: 'block', my: 1 }}>
              {t('pages.initiativeStores.manualLink')}
            </Link>
          </Box>

        <RadioGroup
          row
          value={uploadMethod}
          onChange={(e) => setUploadMethod(e.target.value as 'csv' | 'manual')}
          sx={{ mb: 2 }}
        >
          <FormControlLabel value="csv" control={<Radio />} label={t('pages.initiativeStores.uploadCSV')} />
          <FormControlLabel value="manual" control={<Radio />} label={t('pages.initiativeStores.enterManually')} />
        </RadioGroup>

        {uploadMethod === 'csv' && (
          <Paper
            variant="outlined"
            sx={{
              border: '2px dashed #2196f3',
              p: 4,
              textAlign: 'center',
              mb: 2,
              backgroundColor: '#f9f9f9',
            }}
          >
            <CloudUploadIcon fontSize="large" color="primary" />
            <Typography variant="body1" mt={2}>
              {t('pages.initiativeStores.dragCSV')}
              <Link href="#" underline="hover">
                {t('pages.initiativeStores.selectFromPc')}
              </Link>
            </Typography>
          </Paper>
        )}

        {
          uploadMethod === 'manual' && (
            <PointsOfSaleForm onFormChange={onFormChange}/>
          )
        }

        <Typography variant="body2" color="text.secondary">
          {t('pages.initiativeStores.prepareList')}
          <Link href="#" underline="hover">
            {t('pages.initiativeStores.downExampleFile')}
          </Link>
        </Typography>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined">{t('commons.backBtn')}</Button>
        <Button variant="contained" disabled={salesPoints.length === 0} onClick={handleConfirm}>
          {t('commons.confirmBtn')}
        </Button>
      </Box>
    </Box>
  );
};

export default InitiativeStoresUpload;