import React, { useState, useEffect, FC, useMemo } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Alert,
  Slide,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { ArrowOutward, Report as ReportIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { ButtonNaked } from '@pagopa/mui-italia/components';
import { theme } from '@pagopa/mui-italia/theme';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PointOfSaleDTO } from '../../api/generated/merchants/data-contracts';
import { isValidRegex, generateUniqueId } from '../../helpers';
import { POS_TYPE } from '../../utils/constants';
import AutocompleteComponent from '../Autocomplete/AutocompleteComponent';
import { usePlacesAutocomplete } from '../../hooks/useAutocomplete';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';

type TypeEnum = PointOfSaleDTO['type'];
const PHYSICAL: TypeEnum = 'PHYSICAL';
const ONLINE: TypeEnum = 'ONLINE';

interface PointsOfSaleFormProps {
  onFormChange: (salesPoints: Array<PointOfSaleDTO>) => void;
  onValidationChange: (isValid: boolean) => void;
  pointsOfSaleLoaded: boolean;
  externalErrors?: FormErrors;
  externalAlertMessages?: FormAlertMessages;
  submitAttempt: number;
}

interface FormErrors {
  [salesPointIndex: number]: FieldErrors;
}

interface FieldErrors {
  [fieldName: string]: string;
}

interface FormAlertMessages {
  [salesPointIndex: number]: string;
}

const PointsOfSaleForm: FC<PointsOfSaleFormProps> = ({
  submitAttempt,
  externalErrors,
  externalAlertMessages,
  onFormChange,
  onValidationChange,
  pointsOfSaleLoaded,
}) => {
  const { t } = useScopedTranslation();
  const { options, loading, error, search } = usePlacesAutocomplete();
  const [salesPoints, setSalesPoints] = useState<Array<PointOfSaleDTO>>([
    {
      type: PHYSICAL,
      franchiseName: '',
      id: generateUniqueId(),
      address: '',
      streetNumber: '',
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
  const [showErrorAlert, setShowErrorAlert] = useState<Array<boolean>>([]);
  const { defaultConfig } = useInitiativeConfig();
  const emailRegex = new RegExp(defaultConfig.regex.email);
  const urlRegex = new RegExp(defaultConfig.regex.url);
  const requiredFieldErrors = {
    franchiseName: t('pages.pointOfSales.requiredErrors.franchiseName'),
    address: t('pages.pointOfSales.requiredErrors.address'),
    website: t('pages.pointOfSales.requiredErrors.address'),
    contactEmail: t('pages.pointOfSales.requiredErrors.contactEmail'),
    confirmContactEmail: t('pages.pointOfSales.requiredErrors.confirmContactEmail'),
    contactName: t('pages.pointOfSales.requiredErrors.contactName'),
    contactSurname: t('pages.pointOfSales.requiredErrors.contactSurname'),
    city: t('validation.required'),
    zipCode: t('validation.required'),
    region: t('validation.required'),
    province: t('validation.required'),
  };
  const requiredLabelSx = {
    '& .MuiInputLabel-root::after': {
      content: '" *"',
      color: theme.palette.error.main,
    },
  };

  const mergedErrors = useMemo(() => ({ ...errors, ...externalErrors }), [errors, externalErrors]);

  const addHttpsIfMissing = (url?: string): string => {
    const trimmedUrl = url?.trim() ?? '';
    if (trimmedUrl.startsWith('http://')) {
      return trimmedUrl.replace('http://', 'https://');
    }
    return trimmedUrl !== '' && !trimmedUrl.startsWith('https://')
      ? `https://${trimmedUrl}`
      : trimmedUrl;
  };

  const isValidConfiguredUrl = (url?: string): boolean => {
    const normalizedUrl = addHttpsIfMissing(url);
    return normalizedUrl !== '' && urlRegex.test(normalizedUrl);
  };

  useEffect(() => {
    onFormChange(salesPoints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesPoints]);

  useEffect(() => {
    if (submitAttempt > 0) {
      const isValid = validateForm(true);
      onValidationChange(isValid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitAttempt]);

  // Validate when salesPoints or contactEmailConfirm change
  useEffect(() => {
    const isValid = validateForm(false);
    onValidationChange(isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesPoints, contactEmailConfirm]);

  useEffect(() => {
    if (submitAttempt > 0) {
      const excludedErrorKeys = ['channelEmail', 'channelGeolink', 'website', 'channelPhone'];

      const newShowErrorAlert = salesPoints.map((sp, idx) => {
        const fieldErrors = mergedErrors[idx] ?? {};
        const hasNonExcludedErrors = Object.keys(fieldErrors).some(
          (key) => !excludedErrorKeys.includes(key)
        );

        return (
          Boolean(externalAlertMessages?.[idx]) || (sp.type === PHYSICAL && hasNonExcludedErrors)
        );
      });

      setShowErrorAlert((prev) => {
        const hasChanged =
          prev.length !== newShowErrorAlert.length ||
          prev.some((val, index) => val !== newShowErrorAlert[index]);
        return hasChanged ? newShowErrorAlert : prev;
      });
    } else {
      setShowErrorAlert([]);
    }
  }, [errors, externalErrors, externalAlertMessages, submitAttempt, salesPoints.length]);

  const validateForm = (showErrors: boolean): boolean => {
    let isValid = true;

    const newErrors = salesPoints.reduce<FormErrors>((acc, sp, index) => {
      let fieldErrors: FieldErrors = {};

      if (!sp.contactEmail?.trim()) {
        fieldErrors = { ...fieldErrors, contactEmail: requiredFieldErrors.contactEmail };
        isValid = false;
      }

      if (!contactEmailConfirm[index]?.trim()) {
        fieldErrors = {
          ...fieldErrors,
          confirmContactEmail: requiredFieldErrors.confirmContactEmail,
        };
        isValid = false;
      }

      if (!sp.contactName?.trim()) {
        fieldErrors = { ...fieldErrors, contactName: requiredFieldErrors.contactName };
        isValid = false;
      }
      if (!sp.contactSurname?.trim()) {
        fieldErrors = { ...fieldErrors, contactSurname: requiredFieldErrors.contactSurname };
        isValid = false;
      }
      if (!sp.franchiseName?.trim()) {
        fieldErrors = { ...fieldErrors, franchiseName: requiredFieldErrors.franchiseName };
        isValid = false;
      }
      if (sp.type === PHYSICAL) {
        if (!sp.city?.trim()) {
          fieldErrors = { ...fieldErrors, city: requiredFieldErrors.city };
          isValid = false;
        }
        if (!sp.zipCode?.trim()) {
          fieldErrors = { ...fieldErrors, zipCode: requiredFieldErrors.zipCode };
          isValid = false;
        }
        if (!sp.region?.trim()) {
          fieldErrors = { ...fieldErrors, region: requiredFieldErrors.region };
          isValid = false;
        }
        if (!sp.province?.trim()) {
          fieldErrors = { ...fieldErrors, province: requiredFieldErrors.province };
          isValid = false;
        }
        if (!sp.address?.trim()) {
          fieldErrors = { ...fieldErrors, address: requiredFieldErrors.address };
          isValid = false;
        }
      }
      if (sp.type === ONLINE) {
        if (!sp.website?.trim()) {
          fieldErrors = { ...fieldErrors, website: requiredFieldErrors.website };
          isValid = false;
        } else if (!isValidConfiguredUrl(sp.website)) {
          fieldErrors = { ...fieldErrors, website: 'Devi inserire una URL valida' };
          isValid = false;
        }
      }
      // eslint-disable-next-line sonarjs/no-collapsible-if
      if (sp.type === PHYSICAL) {
        if (!sp.address?.trim()) {
          fieldErrors = { ...fieldErrors, address: requiredFieldErrors.address };
          isValid = false;
        }
        if (sp.channelGeolink?.trim() && !isValidConfiguredUrl(sp.channelGeolink)) {
          fieldErrors = { ...fieldErrors, channelGeolink: 'Devi inserire una URL valida' };
          isValid = false;
        }
        if (sp?.channelEmail && !isValidRegex(sp?.channelEmail, emailRegex)) {
          fieldErrors = { ...fieldErrors, channelEmail: 'Devi inserire una email valida' };
          isValid = false;
        }
        if (
          (sp?.channelPhone && String(sp?.channelPhone ?? '').trim().length < 7) ||
          String(sp?.channelPhone ?? '').trim().length > 15
        ) {
          fieldErrors = { ...fieldErrors, channelPhone: 'Il numero deve avere tra 7 e 15 cifre' };
          isValid = false;
        }
        if (sp?.website && !isValidConfiguredUrl(sp.website)) {
          fieldErrors = { ...fieldErrors, website: 'Devi inserire una URL valida' };
          isValid = false;
        }
      }

      return Object.keys(fieldErrors).length > 0 ? { ...acc, [index]: fieldErrors } : acc;
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
          type: PHYSICAL,
          franchiseName: '',
          address: '',
          streetNumber: '',
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

  const clearFormOnTypeChanging = (index: number, type: string) => {
    setErrors({});
    setSalesPoints((prevSalesPoints) =>
      prevSalesPoints.map((salesPoint, i) =>
        i === index && type === 'ONLINE'
          ? {
              ...salesPoint,
              ['address']: '',
              ['streetNumber']: '',
              ['city']: '',
              ['zipCode']: '',
              ['province']: '',
              ['region']: '',
            }
          : salesPoint
      )
    );
  };

  const handleFieldChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case 'type':
        clearFormOnTypeChanging(index, value);
        break;
      case 'channelGeolink':
        if (value) {
          if (!isValidConfiguredUrl(value)) {
            updateError(index, 'channelGeolink', 'Devi inserire una URL valida');
          } else {
            clearError(index, 'channelGeolink');
          }
        } else {
          clearError(index, 'channelGeolink');
        }
        break;
      case 'website':
        if (salesPoints[index].type === 'ONLINE') {
          if (!value || value.trim().length === 0) {
            updateError(index, 'website', requiredFieldErrors.website);
          } else if (value && !isValidConfiguredUrl(value)) {
            updateError(index, 'website', 'Devi inserire una URL valida');
          } else {
            clearError(index, 'website');
          }
        } else {
          if (value && !isValidConfiguredUrl(value)) {
            updateError(index, 'website', 'Devi inserire una URL valida');
          } else {
            clearError(index, 'website');
          }
        }
        break;
      case 'contactEmail':
        if (value) {
          if (contactEmailConfirm[index] && value !== contactEmailConfirm[index]) {
            updateError(index, 'confirmContactEmail', 'Le email non coincidono');
          } else {
            clearError(index, 'confirmContactEmail');
          }
          if (!isValidRegex(value, emailRegex)) {
            updateError(index, 'contactEmail', 'Devi inserire una email valida');
          } else {
            clearError(index, 'contactEmail');
          }
        } else {
          updateError(index, 'contactEmail', requiredFieldErrors.contactEmail);
          updateError(index, 'confirmContactEmail', requiredFieldErrors.confirmContactEmail);
        }

        break;
      case 'confirmContactEmail':
        setContactEmailConfirm((prev) => ({
          ...prev,
          [index]: value,
        }));
        if (value) {
          if (!isValidRegex(value, emailRegex)) {
            updateError(index, 'confirmContactEmail', 'Devi inserire una email valida');
          } else if (salesPoints[index].contactEmail && value !== salesPoints[index].contactEmail) {
            updateError(index, 'confirmContactEmail', 'Le email non coincidono');
          } else {
            clearError(index, 'confirmContactEmail');
          }
        } else {
          updateError(index, 'confirmContactEmail', requiredFieldErrors.confirmContactEmail);
        }
        break;
      case 'contactName':
        if (!value.trim()) {
          updateError(index, 'contactName', requiredFieldErrors.contactName);
        } else {
          clearError(index, 'contactName');
        }
        break;
      case 'contactSurname':
        if (!value.trim()) {
          updateError(index, 'contactSurname', requiredFieldErrors.contactSurname);
        } else {
          clearError(index, 'contactSurname');
        }
        break;
      case 'franchiseName':
        if (!value.trim()) {
          updateError(index, 'franchiseName', requiredFieldErrors.franchiseName);
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
          updateError(index, 'address', requiredFieldErrors.address);
        } else {
          clearError(index, 'address');
        }
        break;
      default:
        break;
    }

    setSalesPoints((prevSalesPoints) =>
      prevSalesPoints.map((salesPoint, i) =>
        i === index ? { ...salesPoint, [name]: value } : salesPoint
      )
    );
  };

  const updateError = (salesPointIndex: number, fieldName: string, errorMessage: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [salesPointIndex]: {
        ...prevErrors[salesPointIndex],
        [fieldName]: errorMessage,
      },
    }));
  };

  const clearError = (salesPointIndex: number, fieldName: string) => {
    setErrors((prevErrors) => {
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

  const getErrorInputProps = (hasError: boolean) =>
    hasError
      ? {
          sx: { position: 'relative' },
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{
                m: 0,
                position: 'absolute',
                right: 1.5,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <ReportIcon color="error" data-testid="input-error-icon" fontSize="small" />
            </InputAdornment>
          ),
        }
      : undefined;

  const addAnotherSalesPoint = async () => {
    if (salesPoints.length < 5) {
      await search('');
      setSalesPoints([
        ...salesPoints,
        {
          type: PHYSICAL,
          id: generateUniqueId(),
          franchiseName: '',
          address: '',
          streetNumber: '',
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
      if (
        !addressObj.Address.Street ||
        !addressObj.Address.Locality ||
        !addressObj.Address.PostalCode ||
        !addressObj.Address.Region ||
        !addressObj.Address.SubRegion
      ) {
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
                address: addressObj.Address.Street,
                streetNumber: addressObj.Address.AddressNumber ?? 'SNC',
                city: addressObj.Address.Locality ?? '',
                zipCode: addressObj.Address.PostalCode ?? '',
                region: addressObj.Address.Region?.Name ?? '',
                province: addressObj.Address.SubRegion?.Code ?? '',
              }
            : sp
        )
      );
    } else {
      setSalesPoints((prev) =>
        prev.map((sp, i) =>
          i === salesPointIndex
            ? {
                ...sp,
                address: '',
                streetNumber: '',
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

  const deleteSalesPoint = (index: number) => {
    setSalesPoints((prev) => prev.filter((_, i) => i !== index));
    const newErrors = Object.fromEntries(
      Object.entries(errors).filter(([key]) => Number(key) !== index)
    );
    setErrors(newErrors);
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
                      onClick={() => deleteSalesPoint(index)}
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
            {showErrorAlert[index] && (
              <Grid item xs={12} pb={3}>
                <Slide direction="left" in={showErrorAlert[index]} mountOnEnter unmountOnExit>
                  <Alert severity="error">
                    {externalAlertMessages?.[index] ??
                      'Per continuare è necessario compilare tutti i campi obbligatori.'}
                  </Alert>
                </Slide>
              </Grid>
            )}
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
                  ...requiredLabelSx,
                  mb: 2,
                  '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                    color: theme.palette.text.secondary,
                  },
                }}
                error={!!getFieldError(index, 'franchiseName')}
                helperText={getFieldError(index, 'franchiseName')}
                InputProps={getErrorInputProps(!!getFieldError(index, 'franchiseName'))}
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
                    ...requiredLabelSx,
                    mb: 2,
                    '& .MuiInputLabel-root.Mui-error, & .MuiFormLabel-root.Mui-error': {
                      color: theme.palette.text.secondary,
                    },
                  }}
                  error={!!getFieldError(index, 'website')}
                  helperText={getFieldError(index, 'website')}
                  InputProps={getErrorInputProps(!!getFieldError(index, 'website'))}
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
                          required
                          onChangeDebounce={(value) => search(value)}
                          onChange={(addressObj) => {
                            handleChangeAddress(index, addressObj);
                          }}
                          onTextChange={async (value) => {
                            if (value === '') {
                              await search('');
                            }
                          }}
                          inputError={!!getFieldError(index, 'address')}
                          errorText={getFieldError(index, 'address')}
                        />
                        {loading && (
                          <Typography variant="body2">
                            {t('pages.pointOfSales.loadingText')}
                          </Typography>
                        )}
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
                        InputProps={getErrorInputProps(!!getFieldError(index, 'city'))}
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
                        InputProps={getErrorInputProps(!!getFieldError(index, 'zipCode'))}
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
                        InputProps={getErrorInputProps(!!getFieldError(index, 'region'))}
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
                        InputProps={getErrorInputProps(!!getFieldError(index, 'province'))}
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
                        InputProps={getErrorInputProps(!!mergedErrors[index]?.contactEmail)}
                        sx={{
                          ...requiredLabelSx,
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
                        InputProps={getErrorInputProps(
                          !!getFieldError(index, 'confirmContactEmail')
                        )}
                        sx={{
                          ...requiredLabelSx,
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
                        InputProps={getErrorInputProps(!!getFieldError(index, 'contactName'))}
                        sx={{
                          ...requiredLabelSx,
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
                        InputProps={getErrorInputProps(!!getFieldError(index, 'contactSurname'))}
                        sx={{
                          ...requiredLabelSx,
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
                          InputProps={getErrorInputProps(!!getFieldError(index, 'channelGeolink'))}
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
                            const url = addHttpsIfMissing(salesPoint.channelGeolink);
                            if (url && isValidConfiguredUrl(salesPoint.channelGeolink)) {
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
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.', ',', ' '].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
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
                        InputProps={getErrorInputProps(!!getFieldError(index, 'channelPhone'))}
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
                          if (
                            e.target.value.trim() !== '' &&
                            !isValidRegex(e.target.value, emailRegex)
                          ) {
                            updateError(index, 'channelEmail', 'Devi inserire una email valida');
                          } else {
                            clearError(index, 'channelEmail');
                          }
                        }}
                        error={!!getFieldError(index, 'channelEmail')}
                        helperText={getFieldError(index, 'channelEmail')}
                        InputProps={getErrorInputProps(!!getFieldError(index, 'channelEmail'))}
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
                        InputProps={getErrorInputProps(!!getFieldError(index, 'website'))}
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
