import { useState, useEffect, FC } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Grid,
  Button,
} from '@mui/material';
import { ArrowOutward } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { PointOfSaleDTO } from '../../api/generated/merchants/PointOfSaleDTO';
import { TypeEnum } from '../../api/generated/merchants/PointOfSaleDTO';

// utils
import { isValidEmail, isValidUrl } from '../../helpers';

import style from './pointsOfSaleForm.module.css';


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
  const [salesPoints, setSalesPoints] = useState<Array<PointOfSaleDTO>>([
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

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    onFormChange(salesPoints);
    onErrorChange(errors);
  }, [salesPoints]);

  useEffect(() => {
    if(pointsOfSaleLoaded){
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
  },[pointsOfSaleLoaded]);

  const handleFieldChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if(name !== 'type'){
      switch (name) {
        case 'contactEmail':
          if (!isValidEmail(value)) {
            updateError(index, 'contactEmail', 'Email non valida');
          } else {
            clearError(index, 'contactEmail');
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
    }else{
     setErrors({});
    //   prevSalesPoints.map((salesPoint, i) => {
    //     if (i !== index) {
    //       return salesPoint;
    //     }
  
    //     // Se il campo è 'type', usa l'asserzione di tipo
    //     if (name === 'type') {
    //       return { ...salesPoint, type: value as TypeEnum };
    //     }
  
    //     // Per tutti gli altri campi, la logica originale va bene
    //     return { [name]: value };
    //   })
    // );
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
    if(salesPoints.length < 5 ){
      setSalesPoints([
        ...salesPoints,
        {
          type: TypeEnum.PHYSICAL,
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
    <Box sx={{ width: '100%', mx: 'auto', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      {salesPoints.map((salesPoint, index) => (
        <Box className={style['points-of-sale-wrapper']} key={`${salesPoint.franchiseName}-${index}`} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Punto vendita {index + 1}
            <Typography component="span" variant="body2" sx={{ float: 'right' }}>
              {index + 1}/{salesPoints.length}
            </Typography>
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Tipologia di punto vendita</FormLabel>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              I punti vendita fisici richiedono l&apos;indirizzo completo. Per quelli online è sufficiente l&apos;URL del sito.
            </Typography>
            <RadioGroup
              row
              name="type"
              value={salesPoint.type}
              onChange={(e) => handleFieldChange(index, e)}
            >
              <FormControlLabel value="PHYSICAL" control={<Radio />} label="Fisico" />
              <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle1" gutterBottom>Nome insegna</Typography>
          {/* Nome insegna */}
          <TextField
            fullWidth
            label="Nome insegna"
            name="franchiseName"
            value={salesPoint.franchiseName}
            onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
            margin="normal"
            sx={{ mb: 3 }}
            error={!!getFieldError(index, 'franchiseName')}
            helperText={getFieldError(index, 'franchiseName')}
            required
          />

          {
            salesPoint.type === 'ONLINE' && (
              <>
                <Typography variant="subtitle1" gutterBottom>Indirizzo web</Typography>
                <TextField
                  fullWidth
                  label="Indirizzo completo"
                  name="webSite"
                  value={salesPoint.webSite}
                  onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                  margin="normal"
                  sx={{ mb: 3 }}
                  error={!!getFieldError(index, 'webSite')}
                  helperText={getFieldError(index, 'webSite')}
                  required
                />
              </>
            )
          }

          {salesPoint.type === 'PHYSICAL' && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={10}>
                  <Typography variant="subtitle1" gutterBottom>Indirizzo</Typography>
                  <TextField
                    fullWidth
                    label="Indirizzo completo"
                    name="address"
                    value={salesPoint.address}
                    onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                    margin="normal"
                    sx={{ mb: 2 }}
                    error={!!getFieldError(index, 'address')}
                    helperText={getFieldError(index, 'address')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}></Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
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
          )}

          {/* Contatti referente */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Contatti referente</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Indica la persona di contatto per questo punto vendita. Può coincidere &lt;con te stesso&gt;
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
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
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="contactName"
                  value={salesPoint.contactName}
                  onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                  margin="normal"
                  error={!!getFieldError(index, 'contactName')}
                  helperText={getFieldError(index, 'contactName')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cognome"
                  name="contactSurname"
                  value={salesPoint.contactSurname}
                  onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                  margin="normal"
                  error={!!getFieldError(index, 'contactSurname')}
                  helperText={getFieldError(index, 'contactSurname')}
                  required
                />
              </Grid>
            </Grid>
          </Box>

          {/* Contatti punto vendita */}
          {
            salesPoint.type === 'PHYSICAL' && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Contatti punto vendita</Typography>
                <FormControl fullWidth margin="normal" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <TextField
                    sx={{ flexGrow: 1, mr: 1 }}
                    label="Scheda Google MYBusiness"
                    name="landingGoogle"
                    value={salesPoint.channelGeolink}
                    onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}

                  />
                  <Button
                    variant="text"
                    onClick={() => { 
                      const url = salesPoint.channelGeolink;
                      if(url && isValidUrl(url)){
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    endIcon={<ArrowOutward fontSize="small" />}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Verifica URL
                  </Button>
                </FormControl>
                <TextField
                  fullWidth
                  label="Numero di telefono"
                  name="phoneNumber"
                  value={salesPoint.channelPhone}
                  onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={salesPoint.channelEmail}
                  onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Sito web"
                  name="website"
                  value={salesPoint.channelWebsite}
                  onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                  margin="normal"
                />
              </Box>
            )
          }
        </Box>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addAnotherSalesPoint}
        sx={{ p: 1 }}
      >
        Aggiungi un altro punto vendita
      </Button>
    </Box>
  );
};

export default PointsOfSaleForm;