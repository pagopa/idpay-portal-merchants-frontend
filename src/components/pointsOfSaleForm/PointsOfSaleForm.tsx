import React, { useState, useEffect, FC } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Grid, Button, Alert, Slide,
} from '@mui/material';
import { ArrowOutward} from '@mui/icons-material';
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
  showErrorAlert: Array<boolean>;
  setShowErrorAlert: (showErrorAlert: Array<boolean>) => void;
  // onValidate?: (validateFn: () => boolean) => void;
  hasAttemptedSubmit: boolean;
}

interface FormErrors {
  [salesPointIndex: number]: FieldErrors;
}

interface FieldErrors {
  [fieldName: string]: string;
}


const PointsOfSaleForm: FC<PointsOfSaleFormProps> = ({hasAttemptedSubmit,showErrorAlert,externalErrors, onFormChange, onErrorChange, pointsOfSaleLoaded }) => {
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
    },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [contactEmailConfirm, setContactEmailConfirm] = useState<{ [index: number]: string }>({});
  const mergedErrors = { ...errors, ...externalErrors };

  useEffect(() => {
    validateForm(hasAttemptedSubmit);
  }, [hasAttemptedSubmit]);

  // useEffect(() => {
  //   console.log('errors', errors);
  //   let arrayAlert  = {};
  //   Object.entries(errors).forEach(([,value], salesPointIndex) => {
  //     let salesPointError = false;
  //     Object.entries(value).forEach(([ ,valore],) => {
  //       console.log(valore,'valore');
  //       if (valore === 'Campo obbligatorio'){
  //         salesPointError = true;
  //       }
  //     });
  //     arrayAlert = { ...arrayAlert, [salesPointIndex]: salesPointError };
  //
  //   });
  // console.log('arrayAlert',arrayAlert);
  // }, [errors]);


  useEffect(() => {
    onFormChange(salesPoints);
    onErrorChange(errors);
  }, [salesPoints,errors]);

  const validateForm = (showErrors: boolean): boolean => {
    let isValid = true;

    const newErrors = salesPoints.reduce<FormErrors>((acc, sp, index) => {
      let fieldErrors: FieldErrors = {};

      if (!sp.contactEmail?.trim()) {
        fieldErrors = { ...fieldErrors, contactEmail: 'Campo obbligatorio' };
        isValid = false;
      } else if (!isValidEmail(sp.contactEmail)) {
        fieldErrors = { ...fieldErrors, contactEmail: 'Email non valida' };
        isValid = false;
      }

      if (!contactEmailConfirm[index]?.trim()) {
        fieldErrors = { ...fieldErrors, confirmContactEmail: 'Campo obbligatorio' };
        isValid = false;
      } else if (sp.contactEmail?.trim() !== contactEmailConfirm[index]?.trim()) {
        fieldErrors = { ...fieldErrors, confirmContactEmail: 'Le email non coincidono' };
        isValid = false;
      }

      if (!sp.contactName?.trim()) {
        fieldErrors = { ...fieldErrors, contactName: 'Campo obbligatorio' };
        isValid = false;
      }
      if (!sp.contactSurname?.trim()) {
        fieldErrors = { ...fieldErrors, contactSurname: 'Campo obbligatorio' };
        isValid = false;
      }
      if (!sp.franchiseName?.trim()) {
        fieldErrors = { ...fieldErrors, franchiseName: 'Campo obbligatorio' };
        isValid = false;
      }
      if (sp.type === TypeEnum.PHYSICAL) {

        if (!sp.city?.trim()) {
          fieldErrors = { ...fieldErrors, city: 'Campo obbligatorio' };
          isValid = false;
        }
        if (!sp.zipCode?.trim()) {
          fieldErrors = { ...fieldErrors, zipCode: 'Campo obbligatorio' };
          isValid = false;
        }
        if (!sp.region?.trim()) {
          fieldErrors = { ...fieldErrors, region: 'Campo obbligatorio' };
          isValid = false;
        }
        if (!sp.province?.trim()) {
          fieldErrors = { ...fieldErrors, province: 'Campo obbligatorio' };
          isValid = false;
        }
        if (!sp.address?.trim()) {
          fieldErrors = { ...fieldErrors, address: 'Campo obbligatorio' };
          isValid = false;
        }
      }
      if (sp.type === TypeEnum.ONLINE) {
        if (!sp.website?.trim()) {
          fieldErrors = { ...fieldErrors, website: 'Campo obbligatorio' };
          isValid = false;
        } else if (!isValidUrl(normalizeUrlHttps(sp.website))) {
          fieldErrors = { ...fieldErrors, website: 'Deve essere un sito valido' };
          isValid = false;
        }
      }
      // eslint-disable-next-line sonarjs/no-collapsible-if
      if (sp.type === TypeEnum.PHYSICAL) {
        if (!sp.address?.trim()) {
          fieldErrors = { ...fieldErrors, address: 'Campo obbligatorio' };
          isValid = false;
        }
        if (sp.channelGeolink?.trim() && !isValidUrl(normalizeUrlHttp(sp.channelGeolink?.trim()))) {
          fieldErrors = { ...fieldErrors, channelGeolink: 'Deve essere un sito valido' };
          isValid = false;
        }
      }

      return Object.keys(fieldErrors).length > 0
        ? { ...acc, [index]: fieldErrors }
        : acc;
    }, {});

    if (showErrors) {
      setErrors(newErrors);
    }


    return isValid;
  };


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
        },
      ]);
    }
  }, [pointsOfSaleLoaded]);

  const clearFormOnTypeChanging = (index : number, type: string) => {
    setErrors({});
    setSalesPoints(prevSalesPoints =>
      prevSalesPoints.map((salesPoint, i) =>
       i === index && type === 'ONLINE' ?
         { ...salesPoint,
           ['address']: '' ,
           ['city']: '' ,
           ['zipCode']: '' ,
           ['province']: '' ,
           ['region']: '' ,
         }
       : salesPoint

      )
    );
  };

  const handleFieldChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
      switch (name) {
        case 'type' :
          clearFormOnTypeChanging(index, value);
          break;
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
        case 'website':
          if (salesPoints[index].type === 'ONLINE') {
            if (!value || value.trim().length === 0) {
              updateError(index, 'website', 'Campo obbligatorio');
            } else if (value && !isValidUrl(normalizeUrlHttps(value))) {
              updateError(index, 'website', 'Deve essere un sito valido');
            } else {
              clearError(index, 'website');
            }
          } else {
            if (value && !isValidUrl(normalizeUrlHttps(value))) {
              updateError(index, 'website', 'Deve essere un sito valido');
            } else {
              clearError(index, 'website');
            }
          }
          break;
        case 'contactEmail':
          if (value){
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
          }else{
            updateError(index, 'confirmContactEmail', 'Campo obbligatorio');
          }

          break;
        case 'confirmContactEmail':
          setContactEmailConfirm((prev) => ({
            ...prev,
            [index]: value,
          }));
          if(value){
            if (!isValidEmail(value)) {
              updateError(index, 'confirmContactEmail', 'Email non valida');
            } else if (salesPoints[index].contactEmail && value !== salesPoints[index].contactEmail) {
              updateError(index, 'confirmContactEmail', 'Le email non coincidono');
            } else {
              clearError(index, 'confirmContactEmail');
            }
          }else{
            updateError(index, 'confirmContactEmail', 'Campo obbligatorio');
          }
          break;
        case 'contactName':
          if (!value.trim()) {
            updateError(index, 'contactName', 'Campo obbligatorio');
          } else {
            clearError(index, 'contactName');
          }
          break;
        case 'contactSurname':
          if (!value.trim()) {
            updateError(index, 'contactSurname', 'Campo obbligatorio');
          } else {
            clearError(index, 'contactSurname');
          }
          break;
        case 'franchiseName':
          if (!value.trim()) {
            updateError(index, 'franchiseName', 'Campo obbligatorio');
          } else {
            clearError(index, 'franchiseName');
          }
          break;
        case 'city':
          if (!value.trim()) {
            updateError(index, 'city', ' ');
          } else {
            clearError(index, 'city');
          }
          break;
        case 'zipCode':
          if (!value.trim()) {
            updateError(index, 'zipCode', ' ');
          } else {
            clearError(index, 'zipCode');
          }
          break;
        case 'region':
          if (!value.trim()) {
            updateError(index, 'region', ' ');
          } else {
            clearError(index, 'region');
          }
          break;
        case 'province':
          if (!value.trim()) {
            updateError(index, 'province', ' ');
          } else {
            clearError(index, 'province');
          }
          break;
        case 'address':
          if (!value.trim()) {
            updateError(index, 'address', 'Campo obbligatorio');
          } else {
            clearError(index, 'address');
          }
          break;
        default:
          break;
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
    console.log('clear');
    // setShowErrorAlert(
    //   salesPoints.map(() => false));
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

  const getFieldError = (salesPointIndex: number, fieldName: string): string =>
    mergedErrors[salesPointIndex]?.[fieldName] ?? '';

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
          website: '',
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
      clearError(salesPointIndex, 'city');
      clearError(salesPointIndex, 'province');
      clearError(salesPointIndex, 'region');
      clearError(salesPointIndex, 'zipCode');

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
            <Grid item xs={12} pb={3}>
              <Slide direction="left" in={showErrorAlert?.[index] === true} mountOnEnter unmountOnExit>
                <Alert
                  severity="error"
                >
                  {'Per continuare è necessario compilare tutti i campi obbligatori.'}
                </Alert>
              </Slide>
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
                sx={{
                  mb: 2,
                  '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                    color: theme.palette.text.secondary,
                  },
                }}
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
                  sx={{
                    mb: 2,
                    '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                      color: theme.palette.text.secondary,
                    },
                  }}
                  error={!!getFieldError(index, 'website')}
                  helperText={getFieldError(index, 'website')}
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
                          onChange={(addressObj) => {
                            console.log('VALUE', addressObj, index);
                            handleChangeAddress(index, addressObj);
                          }}
                          inputError={!!getFieldError(index, 'address')}
                          errorText={getFieldError(index, 'address')}
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
                        helperText={''}
                        sx={{
                          '& .MuiInputLabel-root.Mui-disabled': {
                            color: theme.palette.text.secondary,
                            opacity: 1,
                          },
                        }}
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
                        helperText={''}
                        sx={{
                          '& .MuiInputLabel-root.Mui-disabled': {
                            color: theme.palette.text.secondary,
                            opacity: 1,
                          },
                        }}
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
                        helperText={''}
                        sx={{
                          '& .MuiInputLabel-root.Mui-disabled': {
                            color: theme.palette.text.secondary,
                            opacity: 1,
                          },
                        }}
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
                        helperText={''}
                        sx={{
                          '& .MuiInputLabel-root.Mui-disabled': {
                            color: theme.palette.text.secondary,
                            opacity: 1,
                          },
                        }}
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
                        sx={{
                          '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                            color: theme.palette.text.secondary,
                          },
                        }}
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
                        error={!!getFieldError(index, 'confirmContactEmail')}
                        helperText={getFieldError(index, 'confirmContactEmail')}
                        sx={{
                          '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                            color: theme.palette.text.secondary,
                          },
                        }}
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
                        sx={{
                          '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                            color: theme.palette.text.secondary,
                          },
                        }}
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
                        sx={{
                          '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                            color: theme.palette.text.secondary,
                          },
                        }}
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
                          sx={{
                            '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                              color: theme.palette.text.secondary,
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Box mx={4} mt={2.5}>
                          <ButtonNaked
                            sx={{ whiteSpace: 'nowrap' }}
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
                          '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                            color: theme.palette.text.secondary,
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
                        sx={{
                          '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                            color: theme.palette.text.secondary,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Sito web"
                        name="website"
                        value={salesPoint.website}
                        onChange={(e) =>
                          handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)
                        }
                        margin="dense"
                        error={!!getFieldError(index, 'website')}
                        helperText={getFieldError(index, 'website')}
                        sx={{
                          '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                            color: theme.palette.text.secondary,
                          },
                        }}
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