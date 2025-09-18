import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Link,
  Grid,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { generatePath, useParams, useHistory } from 'react-router-dom';
import { theme } from '@pagopa/mui-italia';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { parseJwt } from '../../utils/jwt-utils';
import { normalizeUrlHttp , normalizeUrlHttps } from '../../utils/formatUtils';
import PointsOfSaleForm from '../../components/pointsOfSaleForm/PointsOfSaleForm';
import { PointOfSaleDTO, TypeEnum } from '../../api/generated/merchants/PointOfSaleDTO';
import { updateMerchantPointOfSales } from '../../services/merchantService';
import { isValidUrl, isValidEmail } from '../../helpers';
import ROUTES from '../../routes';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import { POS_UPDATE } from '../../utils/constants';

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
  const [uploadMethod, setUploadMethod] = useState<POS_UPDATE.Csv | POS_UPDATE.Manual>(POS_UPDATE.Csv);
  const [_showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [_showErrorAlert, setShowErrorAlert] = useState(false);
  const [salesPoints, setSalesPoints] = useState<Array<PointOfSaleDTO>>([]);
  const [_errors, setErrors] = useState<FormErrors>({});
  const [pointsOfSaleLoaded, setPointsOfSaleLoaded] = useState(false);
  const { t } = useTranslation();
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const addError = useErrorDispatcher();



  const onFormChange = (salesPoints: Array<PointOfSaleDTO>) => {
    if (pointsOfSaleLoaded) {
      setPointsOfSaleLoaded(false);
    }
    const salesPointsWithoutId = salesPoints.map((salesPoint) => {
      const { id, ...rest } = salesPoint;
      return rest;
    });
    setSalesPoints(salesPointsWithoutId);
  };

  const handleConfirm = async () => {
    if (uploadMethod === POS_UPDATE.Manual) {
      const userJwt = parseJwt(storageTokenOps.read());
      const merchantId = userJwt?.merchant_id;
      if (!merchantId) {
        addError({
          id: 'UPLOAD_STORES',
          blocking: false,
          error: new Error('Merchant ID not found'),
          techDescription: 'Merchant ID not found',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
        return;
      }
      const normalizedSalesPoints = salesPoints.map(sp => ({
        ...sp,
        channelWebsite: normalizeUrlHttps(sp.channelWebsite),
        channelGeolink: normalizeUrlHttp(sp.channelGeolink),
      }));
      try {
        await updateMerchantPointOfSales(merchantId, normalizedSalesPoints);
        setPointsOfSaleLoaded(true);
        setShowSuccessAlert(true);
        history.push(generatePath(ROUTES.STORES, { id }));
      } catch (error: any) {
        addError({
          id: 'UPLOAD_STORES',
          blocking: false,
          error,
          techDescription: `${error.message}`,
          displayableTitle: error.code === 'POINT_OF_SALE_ALREADY_REGISTERED' ? 'Errore punto vendita' : t('errors.genericTitle'),
          displayableDescription: error.code === 'POINT_OF_SALE_ALREADY_REGISTERED' ? 'Email referente già associata ad altro punto vendita ' : t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });

        setShowErrorAlert(true);
      }
    }
    if (uploadMethod === POS_UPDATE.Csv) {
      history.push(generatePath(ROUTES.STORES, { id }));
    }
  };

  const handleBack = () => {
    history.push(generatePath(ROUTES.OVERVIEW, { id }));
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
    <Box sx={{ width: '100%' }}>
      <Box>
        <Box mt={2} sx={{ display: 'grid', gridColumn: 'span 8' }}>
          <BreadcrumbsBox backLabel={t('commons.backBtn')} items={[]} />
          <TitleBox
            title={t('pages.initiativeStores.uploadStores')}
            mbTitle={2}
            mtTitle={2}
            variantTitle="h4"
          />
        </Box>
      </Box>

      <Paper elevation={1} square={true} sx={{ mt: 2 }}>
        <Box px={4} pt={2} pb={4}>
          <Grid container>
            <Grid item xs={12}>
              <TitleBox
                title={t('pages.initiativeStores.addStore')}
                subTitle={t('pages.initiativeStores.addStoresSubtitle')}
                mbTitle={3}
                mtTitle={2}
                mbSubTitle={2}
                variantTitle="h6"
                variantSubTitle="body2"
              />
            </Grid>
            <Grid item xs={12}>
              <Link
                fontWeight={theme.typography.fontWeightBold}
                href="#"
                underline="hover"
              >
                {t('pages.initiativeStores.manualLink')}
              </Link>
            </Grid>
            <Grid item xs={12}>
              <Box my={2}>
                <RadioGroup
                  row
                  value={uploadMethod}
                  onChange={(e) => setUploadMethod(e.target.value as POS_UPDATE.Csv | POS_UPDATE.Manual)}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel
                    value= {POS_UPDATE.Csv}
                    control={<Radio />}
                    label={t('pages.initiativeStores.uploadCSV')}
                  />
                  <FormControlLabel
                    value={POS_UPDATE.Manual}
                    control={<Radio />}
                    label={t('pages.initiativeStores.enterManually')}
                  />
                </RadioGroup>
              </Box>
            </Grid>

            {uploadMethod === POS_UPDATE.Csv &&
              <Grid item xs={12}>
                <Box p={2} mb={4} display="flex" alignItems={"center"} justifyContent={"center"}
                  sx={{
                    borderWidth: '1px', borderStyle: "dashed", borderColor: theme.palette.primary.main, borderRadius: "10px",
                    backgroundColor: theme.palette.primaryAction.selected
                  }}>
                  <Box mr={1}>
                    <CloudUploadIcon fontSize="large" color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="body1">
                      {t('pages.initiativeStores.dragCSV')}
                      <Link href="#" underline="hover" color={theme.palette.primary.main}>
                        {t('pages.initiativeStores.selectFromPc')}
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            }

            {
              uploadMethod === POS_UPDATE.Manual &&
              <Grid item xs={12}>
                <PointsOfSaleForm onFormChange={onFormChange} onErrorChange={onErrorChange} pointsOfSaleLoaded={pointsOfSaleLoaded} />
              </Grid>
            }
            {uploadMethod === POS_UPDATE.Csv &&
              <Grid item xs={12}>
                <Typography variant="body1" color="text.primary">
                  {t('pages.initiativeStores.prepareList')}
                  <Link fontWeight={theme.typography.fontWeightMedium} href="#" underline="hover">
                    {t('pages.initiativeStores.downloadExampleFile')}
                  </Link>
                </Typography>
              </Grid>
            }
          </Grid>
        </Box>
      </Paper>


      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button data-testid="back-stores-button" variant="outlined" onClick={handleBack}>{t('commons.backBtn')}</Button>
        <Button data-testid="confirm-stores-button" variant="contained" disabled={!isFormValid()} onClick={handleConfirm}>
          {t('commons.confirmBtn')}
        </Button>
      </Box>
    </Box>
  );
};

export default InitiativeStoresUpload;