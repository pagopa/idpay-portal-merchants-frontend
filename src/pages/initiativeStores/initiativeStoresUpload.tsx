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
import { PointOfSaleDTO, TypeEnum } from '../../api/generated/merchants/PointOfSaleDTO';
import { updateMerchantPointOfSales } from '../../services/merchantService';
import { isValidUrl, isValidEmail } from '../../helpers';

interface FormErrors {
  [salesPointIndex: number]: FieldErrors;
}

interface FieldErrors {
  [fieldName: string]: string;
}

interface MatchParams {
  id: string;
}


const InitiativeStoresUpload: React.FC = () => {
  const [uploadMethod, setUploadMethod] = useState<'csv' | 'manual'>('csv');
  const [salesPoints, setSalesPoints] = useState<Array<PointOfSaleDTO>>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const { t } = useTranslation();

  useEffect(() => {
    console.log(errors);
  }, [errors]);


  const match = matchPath(location.pathname, {
    path: [ROUTES.STORES_UPLOAD],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};

  useEffect(() => {
    console.log(id);
    console.log(salesPoints);
  }, [salesPoints]);

  const onFormChange = (salesPoints: Array<PointOfSaleDTO>) => {
    setSalesPoints(salesPoints);
  };

  const handleConfirm = async () => {
    if (uploadMethod === 'manual') {
      await updateMerchantPointOfSales('3a602b17-ac1c-3029-9e78-0a4bbb8693d4', salesPoints);
    }
  };

  const isFormValid = (): boolean => salesPoints.every(salesPoint => {
    if (salesPoint.type === TypeEnum.ONLINE) {
      return !!salesPoint.franchiseName &&
        (!!salesPoint.webSite && isValidUrl(salesPoint.webSite)) &&
        (!!salesPoint.contactEmail && isValidEmail(salesPoint.contactEmail)) &&
        !!salesPoint.contactName &&
        !!salesPoint.contactSurname;
    }else if(salesPoint.type === TypeEnum.PHYSICAL){
      return !!salesPoint.franchiseName &&
        !!salesPoint.address &&
        !!salesPoint.city &&
        !!salesPoint.zipCode &&
        !!salesPoint.region &&
        !!salesPoint.province &&
        (!!salesPoint.contactEmail && isValidEmail(salesPoint.contactEmail)) &&
        !!salesPoint.contactName &&
        !!salesPoint.contactSurname;
    }
    return true;
  });

  const onErrorChange = (errors: FormErrors) => {
    setErrors(errors);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 920, margin: '0 auto' }}>

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
            <PointsOfSaleForm onFormChange={onFormChange} onErrorChange={onErrorChange}/>
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
        <Button variant="contained" disabled={!isFormValid()} onClick={handleConfirm}>
          {t('commons.confirmBtn')}
        </Button>
      </Box>
    </Box>
  );
};

export default InitiativeStoresUpload;