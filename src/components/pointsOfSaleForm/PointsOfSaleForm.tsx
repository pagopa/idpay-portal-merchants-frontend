import { useState, useEffect, FC } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Grid, Button,
} from '@mui/material';
import { ArrowOutward } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { ButtonNaked, theme } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { TypeEnum,PointOfSaleDTO } from '../../api/generated/merchants/PointOfSaleDTO';
import { isValidEmail, isValidUrl, generateUniqueId } from '../../helpers';
import { POS_TYPE } from '../../utils/constants';
import AutocompleteComponent from '../Autocomplete/AutocompleteComponent';
import { usePlacesAutocomplete } from '../../hooks/useAutocomplete';
import { normalizeUrlHttp, normalizeUrlHttps } from '../../utils/formatUtils';

interface PointsOfSaleFormProps {
  onFormChange: (salesPoints: Array<PointOfSaleDTO>) => void;
  onErrorChange: (errors: FormErrors) => void;
  pointsOfSaleLoaded: boolean;
  externalErrors?: FormErrors;
}

interface FormErrors {
  [salesPointIndex: number]: FieldErrors;
}

interface FieldErrors {
  [fieldName: string]: string;
}


const PointsOfSaleForm: FC<PointsOfSaleFormProps> = ({externalErrors, onFormChange, onErrorChange, pointsOfSaleLoaded }) => {
  const { t } = useTranslation();
  const { options, loading, error, search } = usePlacesAutocomplete();
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
      website: '',
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
  const mergedErrors = { ...errors, ...externalErrors };

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
          website: '',
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
        case 'channelGeolink':
          if (value) {
            if (!isValidUrl(normalizeUrlHttp(value))) {
              updateError(index, "channelGeolink", "Deve essere un sito valido");
            } else {
              clearError(index, "channelGeolink");
            }
          } else {
            clearError(index, "channelGeolink");
          }
          break;
        // case 'channelWebsite':
        //   if (value) {
        //     if (!isValidUrl(normalizeUrlHttps(value))) {
        //       updateError(index, "channelWebsite", "Deve essere un sito valido");
        //     } else {
        //       clearError(index, "channelWebsite");
        //     }
        //   } else {
        //     clearError(index, "channelWebsite");
        //   }
        //   break;
        case 'webSite':
          if (salesPoints[index].type === 'ONLINE') {
            if (!value || value.trim().length === 0) {
              updateError(index, 'webSite', 'Campo obbligatorio');
            } else if (value && !isValidUrl(normalizeUrlHttps(value))) {
              updateError(index, 'webSite', 'Deve essere un sito valido');
            } else {
              clearError(index, 'webSite');
            }
          } else {
            if (value && !isValidUrl(normalizeUrlHttps(value))) {
              updateError(index, 'webSite', 'Deve essere un sito valido');
            } else {
              clearError(index, 'webSite');
            }
          }
          break;
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
          } else if (salesPoints[index].contactEmail && value !== salesPoints[index].contactEmail) {
            updateError(index, 'confirmContactEmail', 'Le email non coincidono');
          } else {
            clearError(index, 'confirmContactEmail');
          }
          break;
        case 'contactName':
          if (value.length === 0) {
            updateError(index, 'contactName', 'Campo obbligatorio');
          } else {
            clearError(index, 'contactName');
          }
          break;
        case 'contactSurname':
          if (value.length === 0) {
            updateError(index, 'contactSurname', 'Campo obbligatorio');
          } else {
            clearError(index, 'contactSurname');
          }
          break;
        case 'franchiseName':
          if (value.length === 0) {
            updateError(index, 'franchiseName', 'Campo obbligatorio');
          } else {
            clearError(index, 'franchiseName');
          }
          break;
        case 'city':
          if (value.length === 0) {
            updateError(index, 'city', ' ');
          } else {
            clearError(index, 'city');
          }
          break;
        case 'zipCode':
          if (value.length === 0) {
            updateError(index, 'zipCode', ' ');
          } else {
            clearError(index, 'zipCode');
          }
          break;
        case 'region':
          if (value.length === 0) {
            updateError(index, 'region', ' ');
          } else {
            clearError(index, 'region');
          }
          break;
        case 'province':
          if (value.length === 0) {
            updateError(index, 'province', ' ');
          } else {
            clearError(index, 'province');
          }
          break;
        case 'address':
          if (value.length === 0) {
            updateError(index, 'address', 'Campo obbligatorio');
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

  const handleChangeAddress = (salesPointIndex: number, addressObj: any) => {
    if (addressObj?.Address) {
      if (!addressObj.Address.Street || !addressObj.Address.Locality || !addressObj.Address.PostalCode || !addressObj.Address.Region || !addressObj.Address.SubRegion) {
        updateError(salesPointIndex, 'address', 'Indirizzo non completo, selezionane un altro');
        return;
      }
      clearError(salesPointIndex, 'address');

      setSalesPoints((prev) =>
        prev.map((sp, i) =>
          i === salesPointIndex
            ? {
              ...sp,
              address: addressObj.Address.Street.concat(`, ${addressObj.Address.AddressNumber ?? 'SNC'}`),
              city: addressObj.Address.Locality ?? '',
              zipCode: addressObj.Address.PostalCode ?? '',
              region: addressObj.Address.Region?.Name ?? '',
              province: addressObj.Address.SubRegion?.Code ?? '',
            }
            : sp
        )
      );
    }else{
      setSalesPoints((prev) =>
        prev.map((sp, i) =>
          i === salesPointIndex
            ? {
              ...sp,
              address: '',
              city: '',
              zipCode: '',
              region: '',
              province: '',
            }
            : sp
        )
      );
    }

  };


  return (
    <Box bgcolor={'background.paper'} boxShadow={3}>
      {salesPoints.map((salesPoint, index) => (
        <Box p={2} key={`${salesPoint.id}`} mb={2} borderColor={'divider'} borderRadius={2}>
          <Grid container>
            <Grid item xs={10}>
              <Typography variant="h5" gutterBottom fontWeight={theme.typography.fontWeightBold}>
                {t('pages.pointOfSales.title')} {index + 1}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Grid container alignItems="center" justifyContent="flex-end" spacing={2}>
                <Grid item>
                  <Typography>
                    {index + 1}/{salesPoints.length}
                  </Typography>
                </Grid>
                {index > 0 && (
                  <Grid item mt={'5px'}>
                    <DeleteOutlineIcon
                      cursor={'pointer'}
                      onClick={() => setSalesPoints((prev) => prev.filter((_, i) => i !== index))}
                      fontSize="small"
                      htmlColor={theme.palette.error.dark}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" sx={{ mb: 3, mt: 2 }}>
                <Typography variant="h6">{t('pages.pointOfSales.type')}</Typography>

                <Typography variant="body1" mb={2} mt={2}>
                  {t('pages.pointOfSales.typeDescription')}
                </Typography>
                <Box p={1.5}>
                  <RadioGroup
                    row
                    name="type"
                    value={salesPoint.type}
                    onChange={(e) => handleFieldChange(index, e)}
                  >
                    <FormControlLabel
                      value={POS_TYPE.Physical}
                      control={<Radio />}
                      label="Fisico"
                    />
                    <FormControlLabel value={POS_TYPE.Online} control={<Radio />} label="Online" />
                  </RadioGroup>
                </Box>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('pages.pointOfSales.signName')}
              </Typography>
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
              />
            </Grid>
            <Grid item xs={7} />
            {salesPoint.type === 'ONLINE' && (
              <>
                <Typography variant="h6" gutterBottom>
                  {t('pages.pointOfSales.website')}
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  label="Indirizzo completo"
                  name="website"
                  value={salesPoint.website}
                  onChange={(e) =>
                    handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                  }
                  margin="normal"
                  sx={{ mb: 2 }}
                  error={!!mergedErrors[index]?.webSite}
                  helperText={mergedErrors[index]?.webSite}
                />
              </>
            )}

            {salesPoint.type === 'PHYSICAL' && (
              <Grid item xs={12}>
                <Box mb={3} mt={2}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={10} md={10} lg={10}>
                      <Typography variant="h6" gutterBottom>
                        {t('pages.pointOfSales.address')}
                      </Typography>
                      <Box mt={2}>
                        <AutocompleteComponent
                          options={options}
                          label="Indirizzo completo"
                          onChangeDebounce={(value) => search(value)}
                          inputError={!!errors[index]?.address}
                          onChange={(addressObj) => {
                            console.log('VALUE', addressObj, index);
                            handleChangeAddress(index, addressObj);
                          }}
                          errorText={errors[index]?.address}
                        />
                        {loading && <Typography variant="body2">{t('pages.pointOfSales.loandingText')}</Typography>}
                        {error && (
                          <Typography variant="body2" color="error">
                            {error}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        size="small"
                        aria-readonly={true}
                        fullWidth
                        label="Città"
                        name="city"
                        value={salesPoint.city}
                        disabled
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="normal"
                        error={!!getFieldError(index, 'city')}
                        helperText={getFieldError(index, 'city')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        size="small"
                        aria-readonly={true}
                        fullWidth
                        label="CAP"
                        name="zipCode"
                        value={salesPoint.zipCode}
                        disabled
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="normal"
                        error={!!getFieldError(index, 'zipCode')}
                        helperText={getFieldError(index, 'zipCode')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        size="small"
                        aria-readonly={true}
                        fullWidth
                        label="Regione"
                        name="region"
                        value={salesPoint.region}
                        disabled
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="normal"
                        error={!!getFieldError(index, 'region')}
                        helperText={getFieldError(index, 'region')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        size="small"
                        aria-readonly={true}
                        fullWidth
                        label="Provincia"
                        name="province"
                        value={salesPoint.province}
                        disabled
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="normal"
                        error={!!getFieldError(index, 'province')}
                        helperText={getFieldError(index, 'province')}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}

            {/* Contatti referente */}
            <Grid item xs={12}>
              <Box mb={3} mt={2}>
                <Typography variant="h6" gutterBottom>
                  {t('pages.pointOfSales.referentContactTitle')}
                </Typography>
                <Typography variant="body1" mb={2}>
                  {t('pages.pointOfSales.referentContactDescription')}
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
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="normal"
                        error={!!mergedErrors[index]?.contactEmail}
                        helperText={mergedErrors[index]?.contactEmail}
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
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="normal"
                        error={!!mergedErrors[index]?.confirmContactEmail}
                        helperText={mergedErrors[index]?.confirmContactEmail}
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
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="dense"
                        error={!!getFieldError(index, 'contactName')}
                        helperText={getFieldError(index, 'contactName')}
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
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="dense"
                        error={!!getFieldError(index, 'contactSurname')}
                        helperText={getFieldError(index, 'contactSurname')}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            {/* Contatti punto vendita */}
            {salesPoint.type === 'PHYSICAL' && (
              <Grid item xs={12}>
                <Box mt={2}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        {'Contatti punto vendita'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                      <Box mr={2} mt={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Scheda Google MYBusiness"
                          name="channelGeolink"
                          value={salesPoint.channelGeolink}
                          onChange={(e) =>
                            handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                          }
                          error={!!getFieldError(index, 'channelGeolink')}
                          helperText={getFieldError(index, 'channelGeolink')}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Box mx={4} mt={2.5}>
                          <ButtonNaked
                            sx={{ whiteSpace: 'nowrap' }}
                            disabled={!salesPoint.channelGeolink?.trim() || !!getFieldError(index, 'channelGeolink')}
                            color="primary"
                            endIcon={<ArrowOutward fontSize="small" />}
                            onClick={() => {
                              const url = salesPoint.channelGeolink?.trim().startsWith('http')
                                ? salesPoint.channelGeolink?.trim()
                                : `https://${salesPoint.channelGeolink?.trim()}`;
                              if (url && isValidUrl(url)) {
                                window.open(url, '_blank', 'noopener,noreferrer');
                              }
                            }}
                            size="medium"
                          >
                            {'Verifica URL'}
                          </ButtonNaked>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Numero di telefono"
                        name="channelPhone"
                        type="number"
                        value={salesPoint.channelPhone}
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        onBlur={() => {
                          if (String(salesPoint.channelPhone ?? '').trim()) {
                            if (
                              String(salesPoint.channelPhone ?? '').trim().length < 7 ||
                              String(salesPoint.channelPhone ?? '').trim().length > 15
                            ) {
                              updateError(
                                index,
                                'channelPhone',
                                'Il numero deve avere tra 7 e 15 cifre'
                              );
                            } else {
                              clearError(index, 'channelPhone');
                            }
                          } else {
                            clearError(index, 'channelPhone');
                          }
                        }}
                        margin="dense"
                        sx={{
                          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                            {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                          '& input[type=number]': {
                            MozAppearance: 'textfield',
                          },
                        }}
                        error={!!getFieldError(index, 'channelPhone')}
                        helperText={getFieldError(index, 'channelPhone')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Email"
                        name="channelEmail"
                        value={salesPoint.channelEmail}
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="dense"
                        onBlur={(e) => {
                          if (e.target.value.trim() !== '' && !isValidEmail(e.target.value)) {
                            updateError(index, 'channelEmail', 'Email non valida');
                          } else {
                            clearError(index, 'channelEmail');
                          }
                        }}
                        error={!!getFieldError(index, 'channelEmail')}
                        helperText={getFieldError(index, 'channelEmail')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Sito web"
                        name="webSite"
                        value={salesPoint.website}
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="dense"
                        error={!!getFieldError(index, 'webSite')}
                        helperText={getFieldError(index, 'webSite')}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      ))}

      {salesPoints.length < 5 && (
        <Button startIcon={<AddIcon />} onClick={addAnotherSalesPoint} sx={{ p: 1 }}>
          {'Aggiungi un altro punto vendita'}
        </Button>
      )}
    </Box>
  );
};

export default PointsOfSaleForm;