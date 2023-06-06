import EuroSymbolIcon from '@mui/icons-material/EuroSymbol';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { BASE_ROUTE } from '../../routes';
import { genericContainerStyle } from '../../styles';
import BreadcrumbsBox from '../components/BreadcrumbsBox';

const NewDiscount = () => {
  console.log('new discount');

  return (
    <>
      <Box
        sx={{
          ...genericContainerStyle,
        }}
      >
        <BreadcrumbsBox
          backUrl={`${BASE_ROUTE}`}
          backLabel={'Back'}
          items={['Iniziative', 'Nome', 'temp']}
        />

        <Box sx={{ gridColumn: 'span 12' }}>
          <TitleBox
            title={'Crea un nuovo buono sconto'}
            subTitle={
              'Compila i campi e genera buoni sconto da inviare ai tuoi clienti per usufruire dell’iniziativa.'
            }
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
          />
        </Box>
        <Paper sx={{ gridColumn: 'span 12', my: 4, px: 3 }}>
          <Box sx={{ py: 3 }}>
            <Typography variant="h6">Informazioni sulla spesa</Typography>
          </Box>
          <Typography variant="body2">
            Inserisci l’importo totale della spesa, ci servirà per calcolare lo sconto applicabile.
          </Typography>
          <FormControl sx={{ my: 3 }}>
            <TextField
              id={`spendingAmount`}
              name={`spendingAmount`}
              label={`Importo spesa`}
              // value={formik.values.}
              // onChange={(value) => console.log(value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EuroSymbolIcon />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </Paper>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', py: 2 }}>
        <Button variant='outlined'>Indietro</Button>
        <Button variant='contained'>Continua</Button>
      </Box>
    </>
  );
};

export default NewDiscount;
