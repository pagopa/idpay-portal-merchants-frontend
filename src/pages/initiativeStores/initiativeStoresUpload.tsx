import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Link, Alert, Slide,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { parseJwt } from '../../utils/jwt-utils';
import { genericContainerStyle } from '../../styles';
import PointsOfSaleForm from '../../components/pointsOfSaleForm/PointsOfSaleForm';
import { PointOfSaleDTO, TypeEnum } from '../../api/generated/merchants/PointOfSaleDTO';
import { updateMerchantPointOfSales } from '../../services/merchantService';
import { isValidUrl, isValidEmail } from '../../helpers';
import ROUTES from '../../routes';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import { BASE_ROUTE } from '../../routes';

interface FormErrors {
  [salesPointIndex: number]: FieldErrors;
}

interface FieldErrors {
  [fieldName: string]: string;
}


interface RouteParams {
  id: string;
}

const InitiativeStoresUpload: React.FC = () => {
  const [uploadMethod, setUploadMethod] = useState<'csv' | 'manual'>('csv');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [salesPoints, setSalesPoints] = useState<Array<PointOfSaleDTO>>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [pointsOfSaleLoaded, setPointsOfSaleLoaded] = useState(false);
  const { t } = useTranslation();
  const { id } = useParams<RouteParams>();
  const history = useHistory();

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  useEffect(() => {
    // eslint-disable-next-line functional/no-let
    let timer: any = {};
    if (showSuccessAlert || showErrorAlert) {
      timer = setTimeout(() => {
        setShowSuccessAlert(false);
        setShowErrorAlert(false);
      }, 5000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [showSuccessAlert, showErrorAlert]);

  useEffect(() => {
    // eslint-disable-next-line functional/no-let
    let timer : any = {};
    if (showSuccessAlert) {
      timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
    }
    return() => {
      clearTimeout(timer);
    };
  }, [showSuccessAlert]);

  const onFormChange = (salesPoints: Array<PointOfSaleDTO>) => {
    if(pointsOfSaleLoaded){
      setPointsOfSaleLoaded(false);
    }
    const salesPointsWithoutId = salesPoints.map((salesPoint) => {
      const { id, ...rest } = salesPoint;
      return rest;
    });
    setSalesPoints(salesPointsWithoutId);
  };

  const handleConfirm = async () => {
    if (uploadMethod === 'manual') {
      const userJwt = parseJwt(storageTokenOps.read());
      const merchantId = userJwt?.merchant_id;
      if (!merchantId) {
        setShowErrorAlert(true);
        return;
      }
      try{
        await updateMerchantPointOfSales(merchantId, salesPoints);
        setPointsOfSaleLoaded(true);
        setShowSuccessAlert(true);
        history.push(`${BASE_ROUTE}/${id}/${ROUTES.SIDE_MENU_STORES}`);
      } catch (error: any) {
        console.log(error);
        setShowErrorAlert(true);
      }
    }
  };

  const isFormValid = (): boolean => salesPoints.every(salesPoint => {
    if (salesPoint.type === TypeEnum.ONLINE) {
      return !!salesPoint.franchiseName &&
        (!!salesPoint.webSite && isValidUrl(salesPoint.webSite)) &&
        (!!salesPoint.contactEmail && isValidEmail(salesPoint.contactEmail)) &&
        !!salesPoint.contactName &&
        !!salesPoint.contactSurname;
    } else if (salesPoint.type === TypeEnum.PHYSICAL) {
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
    return false;
  });

  const onErrorChange = (errors: FormErrors) => {
    setErrors(errors);
  };

  return (
    <Box sx={{ p: 4, width: '100%', margin: '0 auto' }}>
      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 8', mt: 2 }}>
          <BreadcrumbsBox backLabel={t('commons.backBtn')} items={[]} />
          <TitleBox
            title={t('pages.initiativeStores.uploadStores')}
            mbTitle={2}
            mtTitle={2}
            variantTitle="h4"
          />
        </Box>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 0, p: 3, mt: 2 }}>
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
          <Link
            fontWeight={'bold'}
            href="#"
            underline="hover"
            sx={{ display: 'block', my: 1, mb: 2 }}
          >
            {t('pages.initiativeStores.manualLink')}
          </Link>
        </Box>

        <RadioGroup
          row
          value={uploadMethod}
          onChange={(e) => setUploadMethod(e.target.value as 'csv' | 'manual')}
          sx={{ mb: 2 }}
        >
          <FormControlLabel
            value="csv"
            control={<Radio />}
            label={t('pages.initiativeStores.uploadCSV')}
          />
          <FormControlLabel
            value="manual"
            control={<Radio />}
            label={t('pages.initiativeStores.enterManually')}
          />
        </RadioGroup>

        {uploadMethod === 'csv' && (
          <Paper
            variant="outlined"
            sx={{
              border: '2px dashed #2196f3',
              p: 4,
              textAlign: 'center',
              mb: 4,
              backgroundColor: '#0073E614',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mt: 2,
              }}
            >
              <CloudUploadIcon fontSize="large" color="primary" />
              <Typography variant="body1">
                {t('pages.initiativeStores.dragCSV')}
                <Link fontWeight={'bold'} href="#" underline="hover" sx={{ ml: 1 }}>
                  {t('pages.initiativeStores.selectFromPc')}
                </Link>
              </Typography>
            </Box>
          </Paper>
        )}

        {
          uploadMethod === 'manual' && (
            <PointsOfSaleForm onFormChange={onFormChange} onErrorChange={onErrorChange} pointsOfSaleLoaded={pointsOfSaleLoaded}/>
          )
        }
        {uploadMethod === 'csv' && (
          <Typography variant="body1" color="text.primary">
            {t('pages.initiativeStores.prepareList')}
            <Link fontWeight={'bold'} href="#" underline="hover">
              {t('pages.initiativeStores.downloadExampleFile')}
            </Link>
          </Typography>
        )}

      </Paper>
      <Slide direction="left" in={showSuccessAlert} mountOnEnter unmountOnExit>
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon />}
          sx={{
            position: 'fixed',
            bottom: 40,
            right: 20,
            backgroundColor: 'white',
            width: 'auto',
            maxWidth: '400px',
            minWidth: '300px',
            zIndex: 1300,
            boxShadow: 3,
            borderRadius: 1,
            '& .MuiAlert-icon': {
              color: '#6CC66A'
            }
          }}
        >
          {t('initiativeStoresUpload.uploadSuccess')}
        </Alert>
      </Slide>
      <Slide direction="left" in={showErrorAlert} mountOnEnter unmountOnExit>
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon />}
          sx={{
            position: 'fixed',
            bottom: 40,
            right: 20,
            backgroundColor: 'white',
            width: 'auto',
            maxWidth: '400px',
            minWidth: '300px',
            zIndex: 1300,
            boxShadow: 3,
            borderRadius: 1,
            '& .MuiAlert-icon': {
              color: 'red'
            }
          }}
        >
          {t('initiativeStoresUpload.uploadError')}
        </Alert>
      </Slide>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button data-testid="back-stores-button" variant="outlined">{t('commons.backBtn')}</Button>
        <Button data-testid="confirm-stores-button" variant="contained" disabled={!isFormValid()} onClick={handleConfirm}>
          {t('commons.confirmBtn')}
        </Button>
      </Box>
    </Box>
  );
};

export default InitiativeStoresUpload;