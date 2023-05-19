import { Box, Paper } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import ROUTES from '../../routes';

const Home = () => (
  <Box width="100%" px={2}>
    <TitleBox
      title="Portale esercente"
      subTitle="Pagine disponibili"
      mbTitle={2}
      mtTitle={2}
      mbSubTitle={5}
      variantTitle="h4"
      variantSubTitle="body1"
      data-testid="title"
    />
    <Paper sx={{ padding: '16px' }} data-testid="content">
      {Object.keys(ROUTES).map((r) => (
        <Box key={r}>
          {r} -&gt; {ROUTES[r as keyof typeof ROUTES]}
        </Box>
      ))}
    </Paper>
  </Box>
);

export default Home;
