import { useState, useEffect, FC } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Grid
} from '@mui/material';
import { ArrowOutward } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { ButtonNaked, theme } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { PointOfSaleDTO } from '../../api/generated/merchants/PointOfSaleDTO';
import { TypeEnum } from '../../api/generated/merchants/PointOfSaleDTO';
import { isValidEmail, isValidUrl, generateUniqueId } from '../../helpers';
import { POS_TYPE } from '../../utils/constants';



interface PointsOfSaleFormProps {
  onFormChange: (salesPoints: Array<PointOfSaleDTO>) => void;
  onErrorChange: (errors: FormErrors) => void;
  pointsOfSaleLoaded: boolean;
}

interface FormErrors {
  [salesPointIndex: number]: FieldErrors;
}

interface FieldErrors {
  [fieldName: string]: string;
}


const PointsOfSaleForm: FC<PointsOfSaleFormProps> = ({ onFormChange, onErrorChange, pointsOfSaleLoaded }) => {
  const { t } = useTranslation();
  const [salesPoints, setSalesPoints] = useState<Array<PointOfSaleDTO>>([
    {
      type: TypeEnum.PHYSICAL,
      franchiseName: '',
      id: generateUniqueId(),
      address: '',
      city: '',
      zipCode: '',
      region: '',
      province: '',
      webSite: '',
      contactEmail: '',
      contactName: '',
      contactSurname: '',
      channelEmail: '',
      channelPhone: '',
      channelGeolink: '',
      channelWebsite: '',
    },
  ]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [contactEmailConfirm, setContactEmailConfirm] = useState<{ [index: number]: string }>({});

  useEffect(() => {
    onFormChange(salesPoints);
    onErrorChange(errors);
  }, [salesPoints]);

  useEffect(() => {
    if (pointsOfSaleLoaded) {
      setSalesPoints([
        {
          type: TypeEnum.PHYSICAL,
          franchiseName: '',
          address: '',
          city: '',
          zipCode: '',
          region: '',
          province: '',
          webSite: '',
          contactEmail: '',
          contactName: '',
          contactSurname: '',
          channelEmail: '',
          channelPhone: '',
          channelGeolink: '',
          channelWebsite: '',
        },
      ]);
    }
  }, [pointsOfSaleLoaded]);

  const handleFieldChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name !== 'type') {
      switch (name) {
        case 'contactEmail':
          if (contactEmailConfirm[index] && value !== contactEmailConfirm[index]) {
            updateError(index, 'confirmContactEmail', 'Le email non coincidono');
          } else {
            clearError(index, 'confirmContactEmail');
          }
          if (!isValidEmail(value)) {
            updateError(index, 'contactEmail', 'Email non valida');
          } else {
            clearError(index, 'contactEmail');
          }
          break;
        case 'confirmContactEmail':
          setContactEmailConfirm((prev) => ({
            ...prev,
            [index]: value,
          }));
          if (!isValidEmail(value)) {
            updateError(index, 'confirmContactEmail', 'Email non valida');
            }else if (salesPoints[index].contactEmail && value !== contactEmailConfirm[index]) {
            updateError(index, 'confirmContactEmail', 'Le email non coincidono');
          } else {
            clearError(index, 'confirmContactEmail');
          }
          break;
        case 'contactName':
          if (value.length === 0) {
            updateError(index, 'contactName', 'Nome non valido');
          } else {
            clearError(index, 'contactName');
          }
          break;
        case 'contactSurname':
          if (value.length === 0) {
            updateError(index, 'contactSurname', 'Cognome non valido');
          } else {
            clearError(index, 'contactSurname');
          }
          break;
        case 'franchiseName':
          if (value.length === 0) {
            updateError(index, 'franchiseName', 'Nome insegna non valido');
          } else {
            clearError(index, 'franchiseName');
          }
          break;
        case 'city':
          if (value.length === 0) {
            updateError(index, 'city', 'Città non valida');
          } else {
            clearError(index, 'city');
          }
          break;
        case 'zipCode':
          if (value.length === 0) {
            updateError(index, 'zipCode', 'CAP non valido');
          } else {
            clearError(index, 'zipCode');
          }
          break;
        case 'region':
          if (value.length === 0) {
            updateError(index, 'region', 'Regione non valida');
          } else {
            clearError(index, 'region');
          }
          break;
        case 'province':
          if (value.length === 0) {
            updateError(index, 'province', 'Provincia non valida');
          } else {
            clearError(index, 'province');
          }
          break;
        case 'webSite':
          if (value.length === 0 || !isValidUrl(value)) {
            updateError(index, 'webSite', 'Sito web non valido');
          } else {
            clearError(index, 'webSite');
          }
          break;
        case 'address':
          if (value.length === 0) {
            updateError(index, 'address', 'Indirizzo non valido');
          } else {
            clearError(index, 'address');
          }
          break;
        default:
          break;
      }
    } else {
      setErrors({});
    }

    setSalesPoints(prevSalesPoints =>
      prevSalesPoints.map((salesPoint, i) =>
        i === index
          ? { ...salesPoint, [name]: value }
          : salesPoint
      )
    );

  };

  const updateError = (salesPointIndex: number, fieldName: string, errorMessage: string) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [salesPointIndex]: {
        ...prevErrors[salesPointIndex],
        [fieldName]: errorMessage
      }
    }));
  };

  const clearError = (salesPointIndex: number, fieldName: string) => {
    setErrors(prevErrors => {
      if (!prevErrors[salesPointIndex]?.[fieldName]) {
        return prevErrors;
      }

      const { [fieldName]: _, ...restErrors } = prevErrors[salesPointIndex];

      if (Object.keys(restErrors).length === 0) {
        const { [salesPointIndex]: __, ...finalErrors } = prevErrors;
        return finalErrors;
      } else {
        return {
          ...prevErrors,
          [salesPointIndex]: restErrors,
        };
      }
    });
  };

  const getFieldError = (salesPointIndex: number, fieldName: string): string => errors[salesPointIndex]?.[fieldName] || '';

  const addAnotherSalesPoint = () => {
    if (salesPoints.length < 5) {
      setSalesPoints([
        ...salesPoints,
        {
          type: TypeEnum.PHYSICAL,
          id: generateUniqueId(),
          franchiseName: '',
          address: '',
          city: '',
          zipCode: '',
          region: '',
          province: '',
          contactEmail: '',
          contactName: '',
          contactSurname: '',
          channelEmail: '',
          channelGeolink: '',
          channelPhone: '',
          channelWebsite: '',
        },
      ]);
    }

  };


  return (
    <Box sx={{ bgcolor: 'background.paper', boxShadow: 3 }}>
      {salesPoints.map((salesPoint, index) => (
        <Box p={2} key={`${salesPoint.id}`} sx={{ mb: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Grid container>
            <Grid item xs={11}>
              <Typography variant="h5" gutterBottom fontWeight={theme.typography.fontWeightBold}>
                Punto vendita {index + 1}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2" sx={{ float: 'right' }}>
                {index + 1}/{salesPoints.length}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" sx={{ mb: 3, mt: 2 }}>
                <Typography variant="h6" >{t('pages.pointOfSales.type')}</Typography>

                <Typography variant="body1" sx={{ mb: 2, mt: 2 }}>
                  {t('pages.pointOfSales.typeDescription')}
                </Typography>
                <Box p={1.5}>
                  <RadioGroup
                    row
                    name="type"
                    value={salesPoint.type}
                    onChange={(e) => handleFieldChange(index, e)}
                  >
                    <FormControlLabel value={POS_TYPE.Physical} control={<Radio />} label="Fisico" />
                    <FormControlLabel value={POS_TYPE.Online} control={<Radio />} label="Online" />
                  </RadioGroup>
                </Box>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Nome insegna</Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField
                size="small"
                fullWidth
                label="Nome insegna"
                name="franchiseName"
                value={salesPoint.franchiseName}
                onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                margin="normal"
                sx={{ mb: 2 }}
                error={!!getFieldError(index, 'franchiseName')}
                helperText={getFieldError(index, 'franchiseName')}
                required
              />
            </Grid>
            <Grid item xs={7} />
            {
              salesPoint.type === 'ONLINE' && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Indirizzo web</Typography>
                  <TextField
                    size="small"
                    fullWidth
                    label="Indirizzo completo"
                    name="webSite"
                    value={salesPoint.webSite}
                    onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                    margin="normal"
                    sx={{ mb: 2 }}
                    error={!!getFieldError(index, 'webSite')}
                    helperText={getFieldError(index, 'webSite')}
                    required
                  />
                </>
              )
            }

            {salesPoint.type === 'PHYSICAL' &&
              <Grid item xs={12}>
                <Box sx={{ mb: 3, mt: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} md={10}>
                      <Typography variant="h6" gutterBottom>Indirizzo</Typography>
                      <TextField
                        size="small"
                        fullWidth
                        label="Indirizzo completo"
                        name="address"
                        value={salesPoint.address}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="normal"
                        error={!!getFieldError(index, 'address')}
                        helperText={getFieldError(index, 'address')}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Città"
                        name="city"
                        value={salesPoint.city}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="normal"
                        error={!!getFieldError(index, 'city')}
                        helperText={getFieldError(index, 'city')}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        size="small"
                        fullWidth
                        label="CAP"
                        name="zipCode"
                        value={salesPoint.zipCode}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="normal"
                        error={!!getFieldError(index, 'zipCode')}
                        helperText={getFieldError(index, 'zipCode')}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Regione"
                        name="region"
                        value={salesPoint.region}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="normal"
                        error={!!getFieldError(index, 'region')}
                        helperText={getFieldError(index, 'region')}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Provincia"
                        name="province"
                        value={salesPoint.province}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="normal"
                        error={!!getFieldError(index, 'province')}
                        helperText={getFieldError(index, 'province')}
                        required
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            }

            {/* Contatti referente */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>Contatti referente</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Indica la persona di contatto per questo punto vendita. Può coincidere &lt;con te stesso&gt;
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Box pr={1}>
                      <TextField
                        size="small"
                        fullWidth
                        label="E-mail"
                        name="contactEmail"
                        value={salesPoint.contactEmail}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="normal"
                        error={!!getFieldError(index, 'contactEmail')}
                        helperText={getFieldError(index, 'contactEmail')}
                        required
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box pl={1}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Conferma e-mail"
                        name="confirmContactEmail"
                        value={contactEmailConfirm[index] || ''}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="normal"
                        error={!!getFieldError(index, 'confirmContactEmail')}
                        helperText={getFieldError(index, 'confirmContactEmail')}
                        required
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box pr={1}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Nome"
                        name="contactName"
                        value={salesPoint.contactName}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="dense"
                        error={!!getFieldError(index, 'contactName')}
                        helperText={getFieldError(index, 'contactName')}
                        required
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box pl={1}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Cognome"
                        name="contactSurname"
                        value={salesPoint.contactSurname}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="dense"
                        error={!!getFieldError(index, 'contactSurname')}
                        helperText={getFieldError(index, 'contactSurname')}
                        required
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            {/* Contatti punto vendita */}
            {
              salesPoint.type === 'PHYSICAL' &&
              <Grid item xs={12}>
                <Box mt={2}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Contatti punto vendita</Typography>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                      <Box mr={2} mt={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Scheda Google MYBusiness"
                          name="channelGeolink"
                          value={salesPoint.channelGeolink}
                          onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Box mx={4} mt={2.5} >
                        <ButtonNaked
                          color="primary"
                          endIcon={<ArrowOutward fontSize="small" />}
                          onFocusVisible={() => {
                            const url = salesPoint.channelGeolink;
                            if (url && isValidUrl(url)) {
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          size="medium"
                        >
                          Verifica URL
                        </ButtonNaked>
                      </Box>
                    </Grid>
                    <Grid item xs={12} >
                      <TextField
                        size="small"
                        fullWidth
                        label="Numero di telefono"
                        name="channelPhone"
                        value={salesPoint.channelPhone}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={12} >
                      <TextField
                        size="small"
                        fullWidth
                        label="Email"
                        name="channelEmail"
                        value={salesPoint.channelEmail}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={12} >
                      <TextField
                        size="small"
                        fullWidth
                        label="Sito web"
                        name="channelWebsite"
                        value={salesPoint.channelWebsite}
                        onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                        margin="dense"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            }
          </Grid>
        </Box>

      ))}

      {
        salesPoints.length < 5 && (
          <ButtonNaked
            color="primary"
            startIcon={<AddIcon/>}
            onFocusVisible={()=>{addAnotherSalesPoint();}}
            onClick={()=>{addAnotherSalesPoint();}}
            size="medium"
            sx={{ p: 1, whiteSpace: 'nowrap' }}
          >
            Aggiungi un altro punto vendita
          </ButtonNaked>
        )
      }
    </Box>
  );
};

export default PointsOfSaleForm;