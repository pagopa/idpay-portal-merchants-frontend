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
import AddIcon from '@mui/icons-material/Add';
import { PointOfSaleDTO } from '../../api/generated/merchants/PointOfSaleDTO';
import { TypeEnum } from '../../api/generated/merchants/PointOfSaleDTO';
import { TypeEnum as ChannelTypeEnum } from '../../api/generated/merchants/ChannelDTO';

import style from './pointsOfSaleForm.module.css';

interface PointsOfSaleFormProps {
  onFormChange: (salesPoints: Array<PointOfSaleDTO>) => void;
}


const PointsOfSaleForm: FC<PointsOfSaleFormProps> = ({ onFormChange }) => {
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
      channels: [
        {
          type: ChannelTypeEnum.LANDING,
          contact: '',
        },
        {
          type: ChannelTypeEnum.WEB,
          contact: '',
        },
        {
          type: ChannelTypeEnum.EMAIL,
          contact: '',
        },
        {
          type: ChannelTypeEnum.MOBILE,
          contact: '',
        },
      ],
    },
  ]);

  useEffect(() => {
    onFormChange(salesPoints);
  }, [salesPoints]);

  // Handler per le proprietà dirette di PointOfSaleDTO
  const handleFieldChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSalesPoints(prevSalesPoints =>
      prevSalesPoints.map((salesPoint, i) =>
        i === index
          ? { ...salesPoint, [name]: value }
          : salesPoint
      )
    );
  };

  const handleChannelChange = (salesPointIndex: number, channelType: ChannelTypeEnum, value: string) => {
    setSalesPoints(prevSalesPoints =>
      prevSalesPoints.map((salesPoint, i) =>
        i === salesPointIndex
          ? {
            ...salesPoint,
            channels: salesPoint.channels?.map(channel =>
              channel.type === channelType
                ? { ...channel, contact: value }
                : channel
            ) || []
          }
          : salesPoint
      )
    );
  };

  const addAnotherSalesPoint = () => {
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
        channels: [
          {
            type: ChannelTypeEnum.LANDING,
            contact: '',
          },
          {
            type: ChannelTypeEnum.WEB,
            contact: '',
          },
          {
            type: ChannelTypeEnum.EMAIL,
            contact: '',
          },
          {
            type: ChannelTypeEnum.MOBILE,
            contact: '',
          },
        ],
      },
    ]);
  };

  const getChannelValue = (salesPoint: PointOfSaleDTO, channelType: ChannelTypeEnum): string => {
    const channel = salesPoint.channels?.find(ch => ch.type === channelType);
    return channel?.contact || '';
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      {salesPoints.map((salesPoint, index) => (
        <Box className={style['points-of-sale-wrapper']} key={index} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
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
          />

          {
            salesPoint.type === 'ONLINE' && (
              <>
              <Typography variant="subtitle1" gutterBottom>Indirizzo web</Typography>
              <TextField
                fullWidth
                label="Indirizzo completo"
                name="website"
                value={salesPoint.webSite}
                onChange={(e) => handleFieldChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                margin="normal"
                sx={{ mb: 3 }}
              />
              </>
            )
          }

          {/* Indirizzo (conditionally rendered for 'fisico' type) */}
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
                    value={getChannelValue(salesPoint, ChannelTypeEnum.LANDING)}
                    onChange={(e) => handleChannelChange(index, ChannelTypeEnum.LANDING, e.target.value)}
                  />
                  <Button
                    variant="text"
                    onClick={() => { }}
                    // endIcon={<OpenInNewIcon fontSize="small" />} // Changed to OpenInNewIcon for external link
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Verifica URL
                  </Button>
                </FormControl>
                <TextField
                  fullWidth
                  label="Numero di telefono"
                  name="phoneNumber"
                  value={getChannelValue(salesPoint, ChannelTypeEnum.MOBILE)}
                  onChange={(e) => handleChannelChange(index, ChannelTypeEnum.MOBILE, e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={getChannelValue(salesPoint, ChannelTypeEnum.EMAIL)}
                  onChange={(e) => handleChannelChange(index, ChannelTypeEnum.EMAIL, e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Sito web"
                  name="website"
                  value={getChannelValue(salesPoint, ChannelTypeEnum.WEB)}
                  onChange={(e) => handleChannelChange(index, ChannelTypeEnum.WEB, e.target.value)}
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