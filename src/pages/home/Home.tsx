import { Box, Paper } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useInitiativesList } from '../../hooks/useInitiativesList';
import { intiativesListSelector } from '../../redux/slices/initiativesSlice';
import { useAppSelector } from '../../redux/hooks';

const Home = () => {
  useInitiativesList();

  const initiativesList = useAppSelector(intiativesListSelector);

  return (
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
        {initiativesList?.map((r) => (
          <Box key={r.initiativeId}>{r.initiativeName}</Box>
        ))}
      </Paper>
    </Box>
  );
};
export default Home;
